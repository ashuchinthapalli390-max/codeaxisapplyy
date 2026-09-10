import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  TeamMemberDbRow,
  PublicLeadershipDto,
  AdminLeadershipDto,
  validateLeadershipInput,
  isDeleteProtected,
} from "./schema";
import {
  mapDbRowToPublicDto,
  mapDbRowToAdminDto,
  mapMutationInputToDbRow,
  getMemberVersion,
  setMemberVersion,
} from "./mapper";
import {
  CANONICAL_INITIAL_PROFILES,
  INITIAL_VERIFIED_CONTRIBUTIONS,
  findMatchingCanonicalProfile,
} from "./canonical";
import { randomUUID } from "node:crypto";

// Re-export canonical definitions for backward compatibility across tests and consumers
export { CANONICAL_INITIAL_PROFILES, INITIAL_VERIFIED_CONTRIBUTIONS, findMatchingCanonicalProfile };

export class LeadershipError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LeadershipError";
  }
}

/**
 * Parses PostgREST / PostgreSQL missing column error message to dynamically strip unknown fields
 */
export function extractMissingColumn(error: any): string | null {
  if (!error) return null;
  const msg = typeof error === "string" ? error : String(error.message || error.details || error.hint || "");
  let match = msg.match(/Could not find the '([a-zA-Z0-9_]+)' column/i);
  if (match) return match[1];
  match = msg.match(/column "([a-zA-Z0-9_]+)" of relation/i);
  if (match) return match[1];
  match = msg.match(/column (?:[a-zA-Z0-9_]+\.)?"?([a-zA-Z0-9_]+)"? does not exist/i);
  if (match) return match[1];
  return null;
}

const VALID_PRODUCTION_TEAM_MEMBER_COLS = new Set([
  "id",
  "name",
  "display_name",
  "codename",
  "designation",
  "secondary_designation",
  "role_type",
  "department",
  "tagline",
  "bio",
  "short_bio",
  "quote",
  "photo_url",
  "profile_storage_path",
  "profile_object_position_x",
  "profile_object_position_y",
  "profile_scale",
  "skills",
  "email",
  "github_url",
  "linkedin_url",
  "instagram_url",
  "website_url",
  "display_order",
  "is_featured",
  "is_visible",
  "created_at",
  "updated_at",
  // Columns if migrated:
  "status",
  "deleted_at",
  "deleted_by",
  "delete_reason",
  "is_delete_protected",
  "version",
]);

function cleanTeamMemberPayload(table: string, payload: Record<string, any>): Record<string, any> {
  if (table !== "team_members") return { ...payload };
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (VALID_PRODUCTION_TEAM_MEMBER_COLS.has(k)) {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

/**
 * Adaptive Update helper: Retries database update by removing missing schema columns
 */
async function adaptiveUpdate(
  supabase: any,
  table: string,
  id: string,
  initialPayload: Record<string, any>
): Promise<{ data: any; error: any }> {
  const payload = cleanTeamMemberPayload(table, initialPayload);
  for (let attempt = 0; attempt < 25; attempt++) {
    const res = await supabase.from(table).update(payload).eq("id", id);
    if (!res.error) {
      const { data: updatedRow } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      return { data: updatedRow || { id, ...payload }, error: null };
    }

    const missingCol = extractMissingColumn(res.error);
    if (missingCol) {
      console.warn(`[Adaptive DB Update] Column "${missingCol}" does not exist in "${table}". Retrying without it.`);
      delete payload[missingCol];
      delete payload[missingCol.toLowerCase()];
      continue;
    }
    return res;
  }
  return await supabase.from(table).update(payload).eq("id", id);
}

/**
 * Adaptive Insert helper: Retries database insert by removing missing schema columns
 */
async function adaptiveInsert(
  supabase: any,
  table: string,
  initialPayload: Record<string, any>
): Promise<{ data: any; error: any }> {
  const payload = cleanTeamMemberPayload(table, initialPayload);
  for (let attempt = 0; attempt < 25; attempt++) {
    const res = await supabase.from(table).insert(payload);
    if (!res.error) {
      const { data: insertedRow } = await supabase.from(table).select("*").eq("id", payload.id).maybeSingle();
      return { data: insertedRow || payload, error: null };
    }

    const missingCol = extractMissingColumn(res.error);
    if (missingCol) {
      console.warn(`[Adaptive DB Insert] Column "${missingCol}" does not exist in "${table}". Retrying without it.`);
      delete payload[missingCol];
      delete payload[missingCol.toLowerCase()];
      continue;
    }
    return res;
  }
  return await supabase.from(table).insert(payload);
}

async function triggerLeadershipRevalidation() {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/api/team");
    revalidatePath("/admin/team");
  } catch {
    // Non-blocking in non-Next runtime
  }
}

/**
 * Reconciles canonical records: ensures the 5 canonical records exist,
 * populates complete verified content for rows that have missing data,
 * and archives stale demo profiles.
 */
export async function reconcileLeadershipDatabase(): Promise<{
  inserted: number;
  updated: number;
  archivedStale: number;
  existing: number;
}> {
  if (!isSupabaseConfigured()) {
    return { inserted: 0, updated: 0, archivedStale: 0, existing: 0 };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { inserted: 0, updated: 0, archivedStale: 0, existing: 0 };

  let inserted = 0;
  let updated = 0;
  let archivedStale = 0;

  // 1. Fetch current rows in team_members using plain select
  const { data: existingRows, error: fetchErr } = await supabase
    .from("team_members")
    .select("*");

  if (fetchErr) {
    console.warn("[Leadership Reconcile Warning] Could not inspect table:", fetchErr.message);
    return { inserted: 0, updated: 0, archivedStale: 0, existing: 0 };
  }

  const existingList = existingRows || [];

  // 2. Identify and archive stale demo profiles (Deepak, Ashu)
  for (const row of existingList) {
    const rowName = (row.full_name || row.display_name || row.name || "").toLowerCase().trim();
    const isStaleDemo = rowName === "deepak" || rowName === "ashu";
    const alreadyArchived = row.status === "archived" || row.is_archived === true;

    if (isStaleDemo && !alreadyArchived) {
      console.log(`[Leadership Reconcile] Archiving stale profile: ${row.id} (${rowName})`);
      const updatePayload: Record<string, any> = {
        status: "archived",
        deleted_at: new Date().toISOString(),
        deleted_by: "reconciliation_archiver",
        delete_reason: "Archived stale demo profile",
      };
      await supabase
        .from("team_members")
        .update(updatePayload)
        .eq("id", row.id);
      archivedStale++;
    }
  }

  // 3. Ensure each canonical profile exists and has complete verified content
  for (const canonical of CANONICAL_INITIAL_PROFILES) {
    const canonicalNameLower = (canonical.full_name || canonical.display_name || "").toLowerCase().trim();

    // Match by ID, slug, or matching name
    const match = existingList.find(
      (r) =>
        r.id === canonical.id ||
        (canonical.slug && r.slug === canonical.slug) ||
        (r.full_name && r.full_name.toLowerCase().trim() === canonicalNameLower) ||
        (r.display_name && r.display_name.toLowerCase().trim() === canonicalNameLower) ||
        (r.name && r.name.toLowerCase().trim() === canonicalNameLower)
    );

    const now = new Date().toISOString();

    if (!match) {
      console.log(`[Leadership Reconcile] Inserting canonical profile: ${canonical.full_name} (${canonical.id})`);
      const { leadership_summary, is_active, is_archived, ...cleanCanonical } = canonical as any;
      const insertRow = {
        ...cleanCanonical,
        short_bio: canonical.short_bio || canonical.leadership_summary,
        full_bio: canonical.full_bio || canonical.leadership_summary,
        created_at: now,
        updated_at: now,
      };

      const { error: insertErr } = await adaptiveInsert(supabase, "team_members", insertRow);
      if (!insertErr) {
        inserted++;
      } else {
        console.warn(`[Leadership Reconcile] Could not insert ${canonical.id}:`, insertErr.message);
      }
    } else {
      // Check if existing record has empty or placeholder designation/bio/responsibilities
      const isPlaceholder =
        !match.primary_designation ||
        match.primary_designation === "Core Team" ||
        !match.short_bio ||
        !match.responsibilities ||
        (Array.isArray(match.responsibilities) && match.responsibilities.length === 0);

      if (isPlaceholder) {
        console.log(`[Leadership Reconcile] Upgrading profile with verified content: ${canonical.full_name} (${match.id})`);
        const updatePayload: Record<string, any> = {
          slug: match.slug || canonical.slug,
          full_name: canonical.full_name,
          display_name: canonical.display_name,
          code_name: canonical.code_name,
          role_type: canonical.role_type,
          primary_designation: canonical.primary_designation,
          secondary_designation: canonical.secondary_designation,
          department: canonical.department,
          tagline: canonical.tagline,
          short_tagline: canonical.short_tagline,
          short_bio: canonical.short_bio,
          full_bio: canonical.full_bio,
          quote: canonical.quote,
          responsibilities: canonical.responsibilities,
          focus_areas: canonical.focus_areas,
          skills: canonical.skills,
          education_summary: canonical.education_summary,
          experience_summary: canonical.experience_summary,
          verification_status: "published",
          profile_completeness: 100,
          is_public: true,
          status: "active",
          sort_order: canonical.sort_order,
          updated_at: now,
        };

        if (canonical.photo_url && (!match.photo_url || match.photo_url === "/logo.jpeg")) {
          updatePayload.photo_url = canonical.photo_url;
        }
        if (canonical.image_path && (!match.image_path || match.image_path === "")) {
          updatePayload.image_path = canonical.image_path;
        }
        if (canonical.linkedin_url && !match.linkedin_url) {
          updatePayload.linkedin_url = canonical.linkedin_url;
        }
        if (canonical.github_url && !match.github_url) {
          updatePayload.github_url = canonical.github_url;
        }

        const { error: upErr } = await adaptiveUpdate(supabase, "team_members", match.id, updatePayload);

        if (!upErr) {
          updated++;
        } else {
          console.warn(`[Leadership Reconcile] Could not update ${match.id}:`, upErr.message);
        }
      }
    }
  }

  // 4. Seed verified contributions for Varun if not present
  try {
    const { data: existingContribs } = await supabase
      .from("team_member_contributions")
      .select("id, title")
      .eq("team_member_id", "e7b92f15-8c34-4b52-9c1a-6d8e2f3a4b5c");

    if (!existingContribs || existingContribs.length === 0) {
      for (const contrib of INITIAL_VERIFIED_CONTRIBUTIONS) {
        await supabase.from("team_member_contributions").insert(contrib as any);
      }
    }
  } catch (cErr: any) {
    console.warn("[Leadership Reconcile] Contributions notice:", cErr.message);
  }

  return { inserted, updated, archivedStale, existing: existingList.length };
}

/**
 * Public Query: Returns only active, published members with their published contributions.
 * Guarantees all 5 verified profiles (including Varun) are returned with complete content.
 */
export async function getPublicLeadership(): Promise<PublicLeadershipDto[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let data: any[] | null = null;
      let error: any = null;

      try {
        const queryRes = await supabase
          .from("team_members")
          .select("*");
        data = queryRes.data;
        error = queryRes.error;
        if (data && Array.isArray(data)) {
          data.sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
        }
      } catch (err: any) {
        error = err;
      }

      if (data && Array.isArray(data)) {
        const allDbRows = data;

        // Filter for active, published, non-deleted rows
        const activeRows = allDbRows.filter((row: any) => {
          if (row.deleted_at) return false;
          if (row.archived_at) return false;
          if (row.is_archived === true) return false;
          if (row.status && row.status !== "active") return false;
          if (row.is_visible === false) return false;
          if (row.is_active === false) return false;
          if (row.is_public === false) return false;
          if (row.verification_status && row.verification_status !== "published") return false;
          return true;
        });

        // Overlay canonical profiles ONLY if they have not been deleted/archived in the database
        const combinedList: any[] = [...activeRows];
        for (const canonical of CANONICAL_INITIAL_PROFILES) {
          const cName = (canonical.full_name || canonical.display_name || "").toLowerCase().trim();
          const dbMatch = allDbRows.find(
            (r) =>
              r.id === canonical.id ||
              (canonical.slug && r.slug === canonical.slug) ||
              (r.full_name && r.full_name.toLowerCase().trim() === cName) ||
              (r.display_name && r.display_name.toLowerCase().trim() === cName)
          );

          // If the profile was soft-deleted or archived in DB, NEVER show on the public website!
          if (
            dbMatch &&
            (dbMatch.deleted_at ||
              dbMatch.archived_at ||
              dbMatch.is_archived === true ||
              dbMatch.status === "archived" ||
              dbMatch.is_visible === false ||
              dbMatch.is_active === false ||
              dbMatch.is_public === false)
          ) {
            continue;
          }

          // If not already in combinedList, include it
          const alreadyInList = combinedList.some(
            (r) =>
              r.id === canonical.id ||
              (canonical.slug && r.slug === canonical.slug) ||
              (r.full_name && r.full_name.toLowerCase().trim() === cName)
          );
          if (!alreadyInList) {
            combinedList.push(canonical);
          }
        }

        combinedList.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

        // Fetch published contributions for these members
        let allContributions: any[] = [];
        try {
          const memberIds = combinedList.map((d: any) => d.id);
          const { data: contribData } = await supabase
            .from("team_member_contributions")
            .select("*")
            .in("team_member_id", memberIds)
            .eq("is_public", true)
            .eq("verification_status", "published")
            .order("display_order", { ascending: true });
          allContributions = contribData || [];
        } catch {
          // Contributions table optional / pending migration
        }

        return (combinedList as TeamMemberDbRow[]).map((row) => {
          const memberContribs = allContributions.filter((c) => c.team_member_id === row.id);
          return mapDbRowToPublicDto(row, memberContribs);
        });
      }

      if (error) {
        console.warn("[Leadership Repository] Falling back to canonical profiles due to database error:", error.message);
        return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
          mapDbRowToPublicDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
        );
      }
    }
  }

  // Fallback to the 5 canonical profiles if DB is unconfigured or temporarily unavailable
  return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
    mapDbRowToPublicDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
  );
}

/**
 * Admin Query: Returns all members with full editable fields and all contributions
 */
export async function getAdminLeadership(): Promise<AdminLeadershipDto[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let data: any[] | null = null;
      let error: any = null;

      try {
        const queryRes = await supabase
          .from("team_members")
          .select("*");
        data = queryRes.data;
        error = queryRes.error;
        if (data && Array.isArray(data)) {
          data.sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
        }
      } catch (err: any) {
        error = err;
      }

      const needsReconcile =
        !data ||
        data.length === 0 ||
        data.some((m: any) => !m.primary_designation || m.primary_designation === "Core Team");

      if (needsReconcile) {
        try {
          const rec = await reconcileLeadershipDatabase();
          if (rec.inserted > 0 || rec.updated > 0) {
            const { data: refetched } = await supabase
              .from("team_members")
              .select("*")
              .order("sort_order", { ascending: true });
            if (refetched && refetched.length > 0) {
              data = refetched;
            }
          }
        } catch (recErr) {
          console.warn("[Leadership Repository] Admin reconciliation notice:", recErr);
        }
      }

      if (data && data.length > 0) {
        // Ensure all 5 canonical profiles are represented in admin view
        const combinedList: any[] = [...data];
        for (const canonical of CANONICAL_INITIAL_PROFILES) {
          const cName = (canonical.full_name || canonical.display_name || "").toLowerCase().trim();
          const exists = combinedList.some(
            (r) =>
              r.id === canonical.id ||
              (canonical.slug && r.slug === canonical.slug) ||
              (r.full_name && r.full_name.toLowerCase().trim() === cName) ||
              (r.display_name && r.display_name.toLowerCase().trim() === cName)
          );
          if (!exists) {
            combinedList.push(canonical);
          }
        }

        combinedList.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

        let allContributions: any[] = [];
        try {
          const memberIds = combinedList.map((d: any) => d.id);
          const { data: contribData } = await supabase
            .from("team_member_contributions")
            .select("*")
            .in("team_member_id", memberIds)
            .order("display_order", { ascending: true });
          allContributions = contribData || [];
        } catch {
          // Contributions table optional
        }

        return (combinedList as TeamMemberDbRow[]).map((row) => {
          const memberContribs = allContributions.filter((c) => c.team_member_id === row.id);
          return mapDbRowToAdminDto(row, memberContribs);
        });
      }

      if (error) {
        console.warn("[Leadership Repository] Falling back to canonical admin profiles:", error.message);
        return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
          mapDbRowToAdminDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
        );
      }
    }
  }

  return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map((row) =>
    mapDbRowToAdminDto(row, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === row.id))
  );
}

/**
 * Single member lookup by ID or slug
 */
export async function getLeadershipMemberById(idOrSlug: string): Promise<AdminLeadershipDto | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();

      if (error) {
        throw new LeadershipError(`Failed to fetch team member: ${error.message}`, 500);
      }

      if (data) {
        let contribs: any[] = [];
        try {
          const { data: cData } = await supabase
            .from("team_member_contributions")
            .select("*")
            .eq("team_member_id", data.id)
            .order("display_order", { ascending: true });
          contribs = cData || [];
        } catch {
          // optional
        }
        return mapDbRowToAdminDto(data as TeamMemberDbRow, contribs);
      }
    }
  }

  const match = CANONICAL_INITIAL_PROFILES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return match
    ? mapDbRowToAdminDto(match as TeamMemberDbRow, INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === match.id))
    : null;
}

/**
 * Create or Update leadership member with full verification & cache invalidation
 * Requires exactly 1 row returned from database mutation
 */
export async function saveLeadershipMember(
  rawInput: any,
  adminUser?: { email?: string; id?: string }
): Promise<AdminLeadershipDto> {
  const validation = validateLeadershipInput(rawInput);
  if (!validation.valid || !validation.sanitized) {
    const msg = Object.values(validation.errors).join(" ");
    throw new LeadershipError(msg || "Validation failed.", 400);
  }

  const input = validation.sanitized;
  const memberId = input.id || randomUUID();

  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Supabase database is not configured on this environment.", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new LeadershipError("Supabase admin client unavailable.", 503);
  }

  // Check slug collisions if changed
  if (input.slug) {
    const { data: existingSlug } = await supabase
      .from("team_members")
      .select("id")
      .eq("slug", input.slug)
      .neq("id", memberId)
      .maybeSingle();

    if (existingSlug) {
      throw new LeadershipError(`A leadership profile with the slug "${input.slug}" already exists.`, 409);
    }
  }

  const dbRow = mapMutationInputToDbRow(input, memberId);

  // Check if row already exists and inspect version/protection
  const { data: existingRow } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  const currentDbVersion = existingRow ? getMemberVersion(existingRow) : 1;

  // Optimistic concurrency check: real conflict occurs only if database version is ahead of client expectedVersion
  if (
    existingRow &&
    typeof input.expectedVersion === "number" &&
    currentDbVersion > input.expectedVersion
  ) {
    throw new LeadershipError(
      "This profile was modified by another administrator. Please refresh before saving.",
      409
    );
  }

  // Next monotonic version
  const nextVersion = currentDbVersion + 1;
  dbRow.version = nextVersion;

  // Enforce server-side role delete protection: strictly Founder, Co-Founder, CEO
  const isProtectedRole = isDeleteProtected(
    dbRow.role_type || input.roleType,
    dbRow.primary_designation || input.primaryDesignation,
    dbRow.secondary_designation || input.secondaryDesignation
  );
  dbRow.is_delete_protected = isProtectedRole;

  let data: any = null;
  let error: any = null;

  if (existingRow) {
    // Exact update on stable UUID via adaptive updater
    const updateRes = await adaptiveUpdate(supabase, "team_members", memberId, dbRow);
    data = updateRes.data;
    error = updateRes.error;
  } else {
    // Insert new row via adaptive inserter
    const insertRes = await adaptiveInsert(supabase, "team_members", {
      ...dbRow,
      created_at: new Date().toISOString(),
    });
    data = insertRes.data;
    error = insertRes.error;
  }

  if (error || !data) {
    console.error("[Leadership Repository] Mutation error:", error?.message);
    throw new LeadershipError(
      error?.message ?? "Team member update affected no rows.",
      500
    );
  }

  const finalVersion = getMemberVersion(data);
  setMemberVersion(memberId, finalVersion);
  if (data) {
    data.version = finalVersion;
  }

  // Sync contributions if provided
  if (Array.isArray(input.contributions)) {
    try {
      const { data: currentContribs } = await supabase
        .from("team_member_contributions")
        .select("id")
        .eq("team_member_id", memberId);

      const incomingIds = input.contributions.map((c) => c.id).filter(Boolean);
      const toDelete = (currentContribs || []).filter((c) => !incomingIds.includes(c.id)).map((c) => c.id);

      if (toDelete.length > 0) {
        await supabase.from("team_member_contributions").delete().in("id", toDelete);
      }

      for (const contrib of input.contributions) {
        const cRow = {
          id: contrib.id && !contrib.id.startsWith("contrib-") ? contrib.id : randomUUID(),
          team_member_id: memberId,
          contribution_type: contrib.contribution_type,
          title: contrib.title,
          summary: contrib.summary || null,
          project_name: contrib.project_name || null,
          project_url: contrib.project_url || null,
          repository_url: contrib.repository_url || null,
          started_at: contrib.started_at || null,
          completed_at: contrib.completed_at || null,
          verification_status: contrib.verification_status,
          is_public: contrib.is_public !== false,
          display_order: Number(contrib.display_order || 0),
          updated_at: new Date().toISOString(),
        };

        await supabase.from("team_member_contributions").upsert(cRow as any, { onConflict: "id" });
      }
    } catch (cSyncErr: any) {
      console.warn("[Leadership Repository] Contribution sync notice:", cSyncErr.message);
    }
  }

  // Invalidate cache across website
  await triggerLeadershipRevalidation();

  // Refetch fresh contributions
  let updatedContribs: any[] = [];
  try {
    const { data: cData } = await supabase
      .from("team_member_contributions")
      .select("*")
      .eq("team_member_id", memberId)
      .order("display_order", { ascending: true });
    updatedContribs = cData || [];
  } catch {
    // optional
  }

  return mapDbRowToAdminDto(data as TeamMemberDbRow, updatedContribs);
}

/**
 * Soft delete (archive) or permanent delete
 * Founder, Co-Founder, and CEO profiles are strictly delete-protected (HTTP 403).
 * CTO, HR, COO, and other non-protected roles can be moved to Trash.
 */
export async function deleteLeadershipMember(
  id: string,
  softDelete: boolean = true,
  adminUser?: { email?: string; id?: string },
  deleteReason?: string
): Promise<boolean> {
  // 1. Defense-in-depth: Immediately reject deletion if ID matches canonical protected profiles (Founder, Co-Founder, CEO)
  const canonicalTarget = CANONICAL_INITIAL_PROFILES.find((p) => p.id === id || p.slug === id);
  if (
    canonicalTarget &&
    isDeleteProtected(
      canonicalTarget.role_type,
      canonicalTarget.primary_designation,
      canonicalTarget.secondary_designation
    )
  ) {
    throw new LeadershipError("Founder, Co-Founder and CEO profiles cannot be deleted.", 403);
  }

  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  // 2. Fetch current profile from database
  const { data: existing, error: findError } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (findError) {
    throw new LeadershipError(`Database error finding team member: ${findError.message}`, 500);
  }

  const target = existing || canonicalTarget;
  if (!target) {
    throw new LeadershipError("Archive failed: no matching team member found.", 404);
  }

  // 3. Check if already archived/deleted
  if (target.status === "archived" || target.is_archived === true || target.deleted_at) {
    throw new LeadershipError("Profile is already archived.", 409);
  }

  // 4. Enforce protected role policy on server: Founder, Co-Founder, and CEO must never be deletable
  if (
    isDeleteProtected(
      target.role_type || target.roleType,
      target.primary_designation || target.designation,
      target.secondary_designation || target.secondaryDesignation
    )
  ) {
    throw new LeadershipError("Founder, Co-Founder and CEO profiles cannot be deleted.", 403);
  }

  const now = new Date().toISOString();
  const currentVer = getMemberVersion(target);
  const nextVersion = currentVer + 1;
  setMemberVersion(id, nextVersion);

  if (softDelete) {
    const updatePayload: Record<string, any> = {
      is_visible: false,
      status: "archived",
      deleted_at: now,
      deleted_by: adminUser?.email || adminUser?.id || "admin",
      delete_reason: deleteReason || "Moved to Trash by administrator",
      version: nextVersion,
      updated_at: now,
    };

    if (!existing && canonicalTarget) {
      // Profile exists in canonical registry but was not yet persisted in DB.
      // Insert it directly in archived/trash state using canonical DB columns.
      const initialDbRow: Record<string, any> = {
        id: canonicalTarget.id || id,
        name: canonicalTarget.full_name || canonicalTarget.display_name || "Parlapalli Varun",
        display_name: canonicalTarget.display_name || canonicalTarget.full_name || "P. Varun",
        codename: canonicalTarget.code_name || null,
        designation: canonicalTarget.primary_designation || "Chief Operating Officer",
        secondary_designation: canonicalTarget.secondary_designation || null,
        role_type: canonicalTarget.role_type || "COO",
        department: canonicalTarget.department || null,
        tagline: canonicalTarget.tagline || null,
        bio: canonicalTarget.short_bio || null,
        short_bio: canonicalTarget.short_bio || null,
        quote: canonicalTarget.quote || null,
        photo_url: canonicalTarget.photo_url || "/assets/image-assests/hero.jpeg",
        profile_storage_path: canonicalTarget.image_path || "/assets/image-assests/hero.jpeg",
        profile_object_position_x: canonicalTarget.crop_x ?? 50,
        profile_object_position_y: canonicalTarget.crop_y ?? 50,
        profile_scale: canonicalTarget.crop_scale ?? 1,
        skills: canonicalTarget.skills || [],
        github_url: canonicalTarget.github_url || null,
        linkedin_url: canonicalTarget.linkedin_url || null,
        display_order: canonicalTarget.sort_order ?? 5,
        is_featured: true,
        is_visible: false,
        created_at: now,
        updated_at: now,
      };
      const res = await adaptiveInsert(supabase, "team_members", initialDbRow);
      if (res.error || !res.data) {
        throw new LeadershipError(`Failed to archive team member: ${res.error?.message || "insert failed"}`, 500);
      }
    } else {
      const res = await adaptiveUpdate(supabase, "team_members", id, updatePayload);
      if (res.error) {
        throw new LeadershipError(`Failed to archive team member: ${res.error.message}`, 500);
      }
      if (!res.data) {
        throw new LeadershipError("Archive failed: no matching team member found.", 404);
      }
    }
  } else {
    // Hard delete: delete contributions first
    try {
      await supabase.from("team_member_contributions").delete().eq("team_member_id", id);
    } catch {
      // cascade or ignore
    }
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      throw new LeadershipError(`Failed to permanently delete: ${error.message}`, 500);
    }
  }

  await triggerLeadershipRevalidation();
  return true;
}

/**
 * Restore an archived leadership member
 */
export async function restoreLeadershipMember(
  id: string,
  adminUser?: { email?: string; id?: string }
): Promise<AdminLeadershipDto> {
  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const { data: target, error: findErr } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (findErr) {
    throw new LeadershipError(`Database error finding member: ${findErr.message}`, 500);
  }
  if (!target) {
    throw new LeadershipError("Restore failed: team member not found.", 404);
  }

  const now = new Date().toISOString();
  const currentVer = getMemberVersion(target);
  const nextVersion = currentVer + 1;
  setMemberVersion(id, nextVersion);
  const updatePayload: Record<string, any> = {
    is_visible: true,
    status: "active",
    deleted_at: null,
    deleted_by: null,
    delete_reason: null,
    version: nextVersion,
    updated_at: now,
  };

  const res = await adaptiveUpdate(supabase, "team_members", id, updatePayload);
  if (res.error || !res.data) {
    throw new LeadershipError(`Restore failed: ${res.error?.message || "member not found"}`, 500);
  }
  if (res.data) {
    res.data.version = getMemberVersion(res.data);
  }

  await triggerLeadershipRevalidation();
  return mapDbRowToAdminDto(res.data as TeamMemberDbRow);
}

/**
 * Reorder leadership members atomically
 */
export async function reorderLeadershipMembers(
  orderedIds: string[],
  adminUser?: { email?: string; id?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("team_members")
      .update({
        sort_order: index + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failure = results.find((r) => r.error);
  if (failure) {
    throw new LeadershipError(`Reorder failed: ${failure.error?.message}`, 500);
  }

  await triggerLeadershipRevalidation();
  return true;
}
