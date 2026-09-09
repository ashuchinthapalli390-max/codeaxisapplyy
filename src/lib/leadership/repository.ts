import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  TeamMemberDbRow,
  PublicLeadershipDto,
  AdminLeadershipDto,
  LeadershipMutationInput,
  validateLeadershipInput,
} from "./schema";
import {
  mapDbRowToPublicDto,
  mapDbRowToAdminDto,
  mapMutationInputToDbRow,
} from "./mapper";
import { randomUUID } from "node:crypto";

export class LeadershipError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "LeadershipError";
  }
}

/**
 * 4 Canonical Leadership profiles representing CodeXa's real organizational leadership
 */
export const CANONICAL_INITIAL_PROFILES: Partial<TeamMemberDbRow>[] = [
  {
    id: "team-01",
    slug: "ch-arshad",
    full_name: "CH. Arshad",
    display_name: "CH. Arshad",
    code_name: "SOUTH DEVELOPER",
    role_type: "Founder",
    primary_designation: "Founder & Technical Director",
    secondary_designation: "Full-Stack Architect & AI Systems",
    department: "Engineering Architecture & Core Platform",
    tagline: "Building resilient production systems, high-velocity developer tools, and engineering leadership.",
    short_bio: "Founder & Technical Director driving CodeXa Agency architecture, production systems, and developer mentorship.",
    full_bio: "CH. Arshad (SOUTH DEVELOPER) is the Founder of CodeXa Agency. He oversees system architecture, Next.js full-stack pipelines, AI agent workflows, and core technical direction. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.",
    quote: "Build with purpose, architect for resilience, and always ship production-grade code.",
    focus_areas: ["System Architecture", "Next.js & React", "AI Engineering", "Database Systems", "Developer Tooling"],
    photo_url: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    image_path: "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 1,
    is_featured: true,
  },
  {
    id: "team-02",
    slug: "b-sanjay",
    full_name: "B. Sanjay",
    display_name: "B. Sanjay",
    code_name: "Spideyy !!",
    role_type: "Co-Founder",
    primary_designation: "Co-Founder & Platform Lead",
    secondary_designation: "Developer Platform & Distributed Workflows",
    department: "Platform Engineering & Student Operations",
    tagline: "Empowering developers to bridge theory and live production deployment.",
    short_bio: "Co-Founder & Platform Lead directing candidate onboarding, developer workflows, and team operations.",
    full_bio: "B. Sanjay (Spideyy !!) is the Co-Founder of CodeXa Agency. He focuses on platform operations, engineering workflows, code review pipelines, and developer team enablement across all cohorts.",
    quote: "Great software is built by teams who care about every single line of code.",
    focus_areas: ["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript"],
    photo_url: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    image_path: "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    email: "boddukurisanjay@gmail.com",
    whatsapp: "7075920852",
    whatsapp_url: "https://wa.me/917075920852",
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 2,
    is_featured: true,
  },
  {
    id: "team-03",
    slug: "kishore",
    full_name: "Kishore",
    display_name: "Kishore",
    code_name: null,
    role_type: "CEO",
    primary_designation: "Chief Executive Officer",
    secondary_designation: "Strategic Operations & Organizational Growth",
    department: "Executive Leadership & Strategic Execution",
    tagline: "Accelerating technical talent and scaling innovative agency solutions.",
    short_bio: "CEO at CodeXa Agency driving strategic operations, partnerships, and developer program scalability.",
    full_bio: "Kishore serves as Chief Executive Officer of CodeXa Agency, driving operational strategy, talent partnerships, and scaling internship cohorts into production-ready software talent.",
    quote: "Execution turns ambitious vision into undeniable reality.",
    focus_areas: ["Strategic Leadership", "Tech Operations", "Partnerships", "Product Delivery", "Growth"],
    photo_url: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    image_path: "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 3,
    is_featured: true,
  },
  {
    id: "team-04",
    slug: "g-bhanu-prasad",
    full_name: "G. Bhanu Prasad",
    display_name: "G. Bhanu Prasad",
    code_name: "Hakai",
    role_type: "CEO",
    primary_designation: "Chief Executive Officer",
    secondary_designation: "Technology Strategy & Engineering Growth",
    department: "Executive Leadership & Technology Direction",
    tagline: "Engineering transformative technology solutions and cultivating exceptional developers.",
    short_bio: "CEO at CodeXa Agency leading technology strategy, developer acceleration, and industry alliances.",
    full_bio: "G. Bhanu Prasad (Hakai) serves as Chief Executive Officer at CodeXa Agency, spearheading tech direction, advanced technical screening, and engineering capability programs.",
    quote: "Master the fundamentals, embrace modern tools, and always keep shipping.",
    focus_areas: ["Executive Leadership", "Technology Strategy", "Recruitment Pipelines", "Full-Stack Dev", "Talent Mentorship"],
    photo_url: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    image_path: "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    image_bucket: "leadership",
    crop_x: 50,
    crop_y: 50,
    crop_scale: 1,
    image_crop_x: 50,
    image_crop_y: 50,
    image_zoom: 1,
    status: "active",
    is_active: true,
    is_archived: false,
    sort_order: 4,
    is_featured: true,
  },
];

async function triggerLeadershipRevalidation() {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/api/team");
  } catch {
    // Non-blocking in non-Next runtime
  }
}

/**
 * Reconciles canonical records: ensures the 4 canonical records exist,
 * archives stale/demo duplicates (such as legacy 'Deepak' or 'Ashu'),
 * without overwriting newer admin changes.
 */
export async function reconcileLeadershipDatabase(): Promise<{
  inserted: number;
  archivedStale: number;
  existing: number;
}> {
  if (!isSupabaseConfigured()) {
    return { inserted: 0, archivedStale: 0, existing: 0 };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { inserted: 0, archivedStale: 0, existing: 0 };

  let inserted = 0;
  let archivedStale = 0;

  // 1. Fetch current rows in team_members using plain select to avoid failing on missing columns
  const { data: existingRows, error: fetchErr } = await supabase
    .from("team_members")
    .select("*");

  if (fetchErr) {
    console.warn("[Leadership Reconcile Warning] Could not inspect table:", fetchErr.message);
    return { inserted: 0, archivedStale: 0, existing: 0 };
  }

  const existingList = existingRows || [];

  // 2. Identify and archive stale demo profiles that are not part of canonical team
  // Specifically: any record whose name or display_name is 'Deepak' or 'Ashu'
  for (const row of existingList) {
    const rowName = (row.full_name || row.display_name || (row as any).name || "").toLowerCase().trim();
    const isStaleDemo = rowName === "deepak" || rowName === "ashu";
    const alreadyArchived = row.status === "archived" || row.is_archived === true;

    if (isStaleDemo && !alreadyArchived) {
      console.log(`[Leadership Reconcile] Archiving stale profile: ${row.id} (${rowName})`);
      const updatePayload: Record<string, any> = {
        is_active: false,
        archived_at: new Date().toISOString(),
        archived_by: "reconciliation_archiver",
      };
      if (row.status !== undefined) updatePayload.status = "archived";
      if (row.is_archived !== undefined) updatePayload.is_archived = true;
      await supabase
        .from("team_members")
        .update(updatePayload)
        .eq("id", row.id);
      archivedStale++;
    }
  }

  // 3. Ensure each canonical profile exists (matched by stable ID or slug)
  for (const canonical of CANONICAL_INITIAL_PROFILES) {
    const match = existingList.find(
      (r) => r.id === canonical.id || (canonical.slug && r.slug === canonical.slug)
    );

    if (!match) {
      console.log(`[Leadership Reconcile] Inserting canonical profile: ${canonical.full_name} (${canonical.id})`);
      const now = new Date().toISOString();
      const insertRow = {
        ...canonical,
        created_at: now,
        updated_at: now,
      };

      const { error: insertErr } = await supabase.from("team_members").insert(insertRow);
      if (!insertErr) {
        inserted++;
      } else {
        console.warn(`[Leadership Reconcile] Could not insert ${canonical.id}:`, insertErr.message);
      }
    }
  }

  return {
    inserted,
    archivedStale,
    existing: existingList.length,
  };
}

/**
 * Public Query: Returns only active, featured members ordered by sort_order
 * Adaptively handles database schema differences and falls back cleanly to canonical profiles
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
          .select("*")
          .or("status.eq.active,is_active.eq.true")
          .is("archived_at", null)
          .order("sort_order", { ascending: true });
        data = queryRes.data;
        error = queryRes.error;
      } catch (err: any) {
        error = err;
      }

      // Adaptive retry if column mismatch (e.g. status or archived_at does not exist in legacy schema)
      if (error && error.message?.includes("does not exist")) {
        console.warn("[Leadership Repository] Column mismatch in team_members filter, retrying adaptive select:", error.message);
        try {
          const fallbackRes = await supabase.from("team_members").select("*");
          if (!fallbackRes.error && fallbackRes.data) {
            data = fallbackRes.data.filter((row: any) => {
              if (row.archived_at) return false;
              if (row.is_archived === true) return false;
              if (row.status && row.status !== "active") return false;
              if (row.is_active === false) return false;
              if (row.is_visible === false) return false;
              return true;
            });
            data.sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
            error = null;
          }
        } catch (fbErr) {
          console.warn("[Leadership Repository] Adaptive select failed:", fbErr);
        }
      }

      if (!error && data && data.length > 0) {
        return (data as TeamMemberDbRow[]).map(mapDbRowToPublicDto);
      }

      // If database is configured but empty, run self-healing reconciliation once
      try {
        const rec = await reconcileLeadershipDatabase();
        if (rec.inserted > 0) {
          const { data: refetched } = await supabase.from("team_members").select("*");
          if (refetched && refetched.length > 0) {
            const valid = refetched.filter((row: any) => !row.archived_at && row.status !== "archived" && row.is_active !== false);
            valid.sort((a: any, b: any) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
            return (valid as TeamMemberDbRow[]).map(mapDbRowToPublicDto);
          }
        }
      } catch (recErr) {
        console.warn("[Leadership Repository] Reconciliation notice:", recErr);
      }

      if (error) {
        console.warn("[Leadership Repository] Falling back to canonical profiles due to database error:", error.message);
        return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map(mapDbRowToPublicDto);
      }
    }
  }

  // Fallback ONLY to the 4 canonical profiles if DB is unconfigured or temporarily unavailable
  return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map(mapDbRowToPublicDto);
}

/**
 * Admin Query: Returns all members (active, hidden, archived) with full editable fields
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
          .select("*")
          .order("sort_order", { ascending: true });
        data = queryRes.data;
        error = queryRes.error;
      } catch (err: any) {
        error = err;
      }

      if (!error && data && data.length > 0) {
        return (data as TeamMemberDbRow[]).map(mapDbRowToAdminDto);
      }

      if (error && error.message?.includes("does not exist")) {
        console.warn("[Leadership Repository] Admin fallback select due to column mismatch:", error.message);
        try {
          const retryRes = await supabase.from("team_members").select("*");
          if (!retryRes.error && retryRes.data && retryRes.data.length > 0) {
            return (retryRes.data as TeamMemberDbRow[]).map(mapDbRowToAdminDto);
          }
        } catch (retryErr) {
          console.warn("[Leadership Repository] Admin retry failed:", retryErr);
        }
      }

      // Self-healing seed if completely empty
      try {
        await reconcileLeadershipDatabase();
        const { data: refetched } = await supabase.from("team_members").select("*");
        if (refetched && refetched.length > 0) {
          return (refetched as TeamMemberDbRow[]).map(mapDbRowToAdminDto);
        }
      } catch (recErr) {
        console.warn("[Leadership Repository] Admin reconciliation notice:", recErr);
      }

      if (error) {
        console.warn("[Leadership Repository] Falling back to canonical admin profiles:", error.message);
        return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map(mapDbRowToAdminDto);
      }
    }
  }

  return (CANONICAL_INITIAL_PROFILES as TeamMemberDbRow[]).map(mapDbRowToAdminDto);
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
        return mapDbRowToAdminDto(data as TeamMemberDbRow);
      }
    }
  }

  const match = CANONICAL_INITIAL_PROFILES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return match ? mapDbRowToAdminDto(match as TeamMemberDbRow) : null;
}

/**
 * Create or Update leadership member with full verification & cache invalidation
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

  // Check optimistic concurrency if updatedAt provided
  if (input.updatedAt && input.id) {
    const { data: currentRow } = await supabase
      .from("team_members")
      .select("updated_at")
      .eq("id", memberId)
      .maybeSingle();

    if (currentRow && currentRow.updated_at && input.updatedAt) {
      const currentMs = new Date(currentRow.updated_at).getTime();
      const clientMs = new Date(input.updatedAt).getTime();
      // If server row is noticeably newer (> 2s difference), reject stale overwrite
      if (currentMs - clientMs > 2000) {
        throw new LeadershipError(
          "This profile was modified by another administrator. Please refresh before saving.",
          409
        );
      }
    }
  }

  // Perform canonical mutation with returned row verification
  const { data, error } = await supabase
    .from("team_members")
    .upsert(dbRow, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("[Leadership Repository] Mutation error:", error.message);
    throw new LeadershipError(`Database mutation failed: ${error.message}`, 500);
  }

  if (!data) {
    throw new LeadershipError("Supabase updated zero rows. Persistence failed.", 500);
  }

  // Invalidate cache across website
  await triggerLeadershipRevalidation();

  return mapDbRowToAdminDto(data as TeamMemberDbRow);
}

/**
 * Soft delete (archive) or permanent delete
 */
export async function deleteLeadershipMember(
  id: string,
  softDelete: boolean = true,
  adminUser?: { email?: string; id?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    throw new LeadershipError("Database not configured", 503);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const now = new Date().toISOString();

  if (softDelete) {
    const { data, error } = await supabase
      .from("team_members")
      .update({
        status: "archived",
        is_active: false,
        is_archived: true,
        archived_at: now,
        archived_by: adminUser?.email || adminUser?.id || "admin",
        updated_at: now,
      })
      .eq("id", id)
      .select();

    if (error) throw new LeadershipError(error.message, 500);
    if (!data || data.length === 0) throw new LeadershipError(`Member ${id} not found.`, 404);
  } else {
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) throw new LeadershipError(error.message, 500);
  }

  await triggerLeadershipRevalidation();
  return true;
}

/**
 * Restore archived member to active
 */
export async function restoreLeadershipMember(
  id: string,
  adminUser?: { email?: string; id?: string }
): Promise<AdminLeadershipDto> {
  if (!isSupabaseConfigured()) throw new LeadershipError("Database not configured", 503);

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("team_members")
    .update({
      status: "active",
      is_active: true,
      is_archived: false,
      archived_at: null,
      archived_by: null,
      updated_at: now,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new LeadershipError(error.message, 500);
  if (!data) throw new LeadershipError(`Member ${id} not found.`, 404);

  await triggerLeadershipRevalidation();
  return mapDbRowToAdminDto(data as TeamMemberDbRow);
}

/**
 * Persist reordered profile IDs deterministically in database
 */
export async function reorderLeadershipMembers(
  orderedIds: string[],
  adminUser?: { email?: string; id?: string }
): Promise<boolean> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return true;
  if (!isSupabaseConfigured()) throw new LeadershipError("Database not configured", 503);

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new LeadershipError("Supabase unavailable", 503);

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("team_members")
      .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  for (const res of results) {
    if (res.error) {
      throw new LeadershipError(`Failed to update display order: ${res.error.message}`, 500);
    }
  }

  await triggerLeadershipRevalidation();
  return true;
}
