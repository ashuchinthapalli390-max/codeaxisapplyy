import { NextRequest, NextResponse } from "next/server";
import {
  getTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  restoreTeamMember,
  duplicateTeamMember,
  reorderTeamMembers,
  addAuditLog,
} from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { TeamMember } from "@/types/admin";
import { randomBytes } from "node:crypto";

export async function GET(req: NextRequest) {
  const requestId = randomBytes(4).toString("hex");
  try {
    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("public") === "true";

    if (!publicOnly) {
      await requireAdmin(req);
    }

    if (publicOnly) {
      const { getPublicTeam } = await import("@/lib/storage");
      const publicMembers = await getPublicTeam();
      console.log(`[Leadership API][${requestId}] Public query returned ${publicMembers.length} active members.`);
      return NextResponse.json(
        { success: true, data: publicMembers, count: publicMembers.length },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          },
        }
      );
    }

    const { getAdminTeam } = await import("@/lib/storage");
    const allMembers = await getAdminTeam();
    console.log(`[Leadership API][${requestId}] Admin query returned ${allMembers.length} members.`);

    return NextResponse.json({ success: true, data: allMembers, count: allMembers.length });
  } catch (err) {
    console.error(`[Leadership API][${requestId}] Query error:`, err);
    return handleAdminAuthError(err);
  }
}

async function triggerTeamCacheInvalidation() {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/api/team");
  } catch {
    // non-blocking
  }
}

export async function POST(req: NextRequest) {
  const requestId = randomBytes(4).toString("hex");
  try {
    // Verify admin authentication
    const admin = await requireAdmin(req);

    const body = await req.json();
    const action = body.action || "save";

    // 1. Reorder Action
    if (action === "reorder" && Array.isArray(body.orderedIds)) {
      console.log(`[Leadership API][${requestId}] Reorder started: ${body.orderedIds.length} profiles.`);
      await reorderTeamMembers(body.orderedIds);
      await addAuditLog("TEAM_UPDATE", `Reordered ${body.orderedIds.length} leadership profiles.`);
      await triggerTeamCacheInvalidation();
      console.log(`[Leadership API][${requestId}] Reorder completed successfully.`);
      return NextResponse.json({ success: true, message: "Display order saved." });
    }

    // 2. Duplicate Action
    if (action === "duplicate" && body.id) {
      console.log(`[Leadership API][${requestId}] Duplicate started for ID: ${body.id}`);
      const duplicated = await duplicateTeamMember(body.id);
      if (duplicated) {
        await addAuditLog("TEAM_UPDATE", `Duplicated team profile: ${body.id}`);
        await triggerTeamCacheInvalidation();
        console.log(`[Leadership API][${requestId}] Duplicate completed: new ID: ${duplicated.id}`);
        return NextResponse.json({ success: true, data: duplicated });
      }
      return NextResponse.json({ success: false, error: "Original member not found." }, { status: 404 });
    }

    // 3. Restore Action
    if (action === "restore" && body.id) {
      console.log(`[Leadership API][${requestId}] Restore started for ID: ${body.id}`);
      await restoreTeamMember(body.id);
      await addAuditLog("TEAM_UPDATE", `Restored archived team profile: ${body.id}`);
      await triggerTeamCacheInvalidation();
      console.log(`[Leadership API][${requestId}] Restore completed for ID: ${body.id}`);
      return NextResponse.json({ success: true, message: "Profile restored." });
    }

    // 4. Delete Action (Soft delete by default, or hard delete if specified)
    if (action === "delete" && body.id) {
      const hard = body.hardDelete === true;
      console.log(`[Leadership API][${requestId}] Delete started for ID: ${body.id} (hard=${hard})`);
      await deleteTeamMember(body.id, !hard);
      await addAuditLog(
        "TEAM_UPDATE",
        hard ? `Permanently deleted team member: ${body.id}` : `Archived team member: ${body.id}`
      );
      await triggerTeamCacheInvalidation();
      console.log(`[Leadership API][${requestId}] Delete completed for ID: ${body.id}`);
      return NextResponse.json({ success: true, message: hard ? "Team member deleted." : "Team member archived." });
    }

    // 5. Create / Update Member
    const memberId = body.id || `team-${Date.now()}`;
    console.log(`[Leadership API][${requestId}] Leadership update started: memberId = ${memberId}`);

    if (!body.name?.trim() || !body.designation?.trim()) {
      console.warn(`[Leadership API][${requestId}] Validation failed: name and designation required.`);
      return NextResponse.json({ success: false, error: "Full name and designation are required." }, { status: 400 });
    }

    const responsibilities = Array.isArray(body.responsibilities)
      ? body.responsibilities
      : Array.isArray(body.roles)
      ? body.roles
      : [];

    const focusAreas = Array.isArray(body.focus_areas)
      ? body.focus_areas
      : Array.isArray(body.skills)
      ? body.skills
      : [];

    const generatedSlug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const member: TeamMember = {
      id: memberId,
      slug: generatedSlug,
      name: body.name.trim(),
      fullName: body.fullName?.trim() || body.name.trim(),
      displayName: body.displayName?.trim() || body.name.trim(),
      codename: body.codename?.trim() || body.code_name?.trim() || "",
      designation: body.designation.trim(),
      primaryDesignation: body.primaryDesignation?.trim() || body.designation.trim(),
      secondaryDesignation: body.secondaryDesignation?.trim() || "",
      roleType: body.roleType?.trim() || "Core Team",
      department: body.department?.trim() || "",
      tagline: body.tagline?.trim() || "",
      bio: body.shortBio?.trim() || body.bio?.trim() || "",
      shortBio: body.shortBio?.trim() || body.bio?.trim() || "",
      fullBio: body.fullBio?.trim() || "",
      professionalSummary: body.professionalSummary?.trim() || "",
      quote: body.quote?.trim() || "",
      photoUrl: body.photoUrl?.trim() || "/assets/image-assests/hero.jpeg",
      image_path: body.image_path?.trim() || body.profileStoragePath?.trim() || "",
      profileStoragePath: body.profileStoragePath?.trim() || body.image_path?.trim() || "",
      profileObjectPositionX: body.profileObjectPositionX != null ? Number(body.profileObjectPositionX) : (body.crop_x != null ? Number(body.crop_x) : 50),
      profileObjectPositionY: body.profileObjectPositionY != null ? Number(body.profileObjectPositionY) : (body.crop_y != null ? Number(body.crop_y) : 50),
      profileScale: body.profileScale != null ? Number(body.profileScale) : (body.crop_scale != null ? Number(body.crop_scale) : 1),
      crop_x: body.crop_x != null ? Number(body.crop_x) : (body.profileObjectPositionX != null ? Number(body.profileObjectPositionX) : 50),
      crop_y: body.crop_y != null ? Number(body.crop_y) : (body.profileObjectPositionY != null ? Number(body.profileObjectPositionY) : 50),
      crop_scale: body.crop_scale != null ? Number(body.crop_scale) : (body.profileScale != null ? Number(body.profileScale) : 1),
      backgroundAssetUrl: body.backgroundAssetUrl?.trim() || "",
      backgroundType: body.backgroundType || "none",
      responsibilities,
      roles: responsibilities,
      skills: focusAreas,
      focus_areas: focusAreas,
      email: body.email?.trim() || "",
      secondaryEmail: body.secondaryEmail?.trim() || "",
      phone: body.phone?.trim() || "",
      whatsapp: body.whatsapp?.trim() || body.whatsapp_url?.trim() || "",
      whatsapp_url: body.whatsapp_url?.trim() || body.whatsapp?.trim() || "",
      location: body.location?.trim() || "",
      preferredContact: body.preferredContact?.trim() || "",
      githubUrl: body.githubUrl?.trim() || "",
      linkedinUrl: body.linkedinUrl?.trim() || "",
      instagramUrl: body.instagramUrl?.trim() || "",
      portfolioUrl: body.portfolioUrl?.trim() || "",
      websiteUrl: body.websiteUrl?.trim() || body.external_url?.trim() || "",
      external_url: body.external_url?.trim() || body.websiteUrl?.trim() || body.linkedinUrl?.trim() || "",
      youtubeUrl: body.youtubeUrl?.trim() || "",
      twitterUrl: body.twitterUrl?.trim() || "",
      discordUsername: body.discordUsername?.trim() || "",
      otherLinks: Array.isArray(body.otherLinks) ? body.otherLinks : [],
      showPhone: body.showPhone !== false,
      showEmail: body.showEmail !== false,
      showWhatsapp: body.showWhatsapp !== false,
      showSocials: body.showSocials !== false,
      showContact: body.showPhone !== false || body.showWhatsapp !== false || body.showEmail !== false,
      isFeatured: body.isFeatured === true,
      isVisible: body.status ? body.status === "active" : body.isVisible !== false,
      isArchived: body.isArchived === true || body.status === "archived",
      status: body.status || (body.isArchived ? "archived" : (body.isVisible === false ? "hidden" : "active")),
      sort_order: body.sort_order != null ? Number(body.sort_order) : (body.displayOrder != null ? Number(body.displayOrder) : 0),
      displayOrder: body.displayOrder != null ? Number(body.displayOrder) : (body.sort_order != null ? Number(body.sort_order) : 0),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedMember = await saveTeamMember(member);
    await addAuditLog(
      "TEAM_UPDATE",
      `Saved leadership member: ${savedMember.name} (${savedMember.designation}) by ${(admin as any).email || (admin as any).id || "admin"}`
    );
    await triggerTeamCacheInvalidation();

    console.log(`[Leadership API][${requestId}] Leadership update completed: memberId = ${savedMember.id}`);
    return NextResponse.json({ success: true, data: savedMember });
  } catch (err: any) {
    console.error(`[Leadership API][${requestId}] Leadership update failed:`, err.message || err);
    return handleAdminAuthError(err);
  }
}
