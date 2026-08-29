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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("archived") === "true";
    const publicOnly = searchParams.get("public") === "true";

    if (!publicOnly) {
      await requireAdmin(req);
    }

    const allMembers = await getTeamMembers(includeArchived);

    if (publicOnly) {
      const publicMembers = allMembers.filter((m) => m.isVisible !== false && !m.isArchived);
      return NextResponse.json({ success: true, data: publicMembers });
    }

    return NextResponse.json({ success: true, data: allMembers });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin(req);

    const body = await req.json();

    // 1. Reorder Action
    if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
      await reorderTeamMembers(body.orderedIds);
      await addAuditLog("TEAM_UPDATE", "Updated team leadership display order.");
      return NextResponse.json({ success: true, message: "Display order saved." });
    }

    // 2. Duplicate Action
    if (body.action === "duplicate" && body.id) {
      const duplicated = await duplicateTeamMember(body.id);
      if (duplicated) {
        await addAuditLog("TEAM_UPDATE", `Duplicated team profile: ${body.id}`);
        return NextResponse.json({ success: true, data: duplicated });
      }
      return NextResponse.json({ success: false, error: "Original member not found." }, { status: 404 });
    }

    // 3. Restore Action
    if (body.action === "restore" && body.id) {
      await restoreTeamMember(body.id);
      await addAuditLog("TEAM_UPDATE", `Restored archived team profile: ${body.id}`);
      return NextResponse.json({ success: true, message: "Profile restored." });
    }

    // 4. Delete Action (Soft delete by default, or hard delete if specified)
    if (body.action === "delete" && body.id) {
      const hard = body.hardDelete === true;
      await deleteTeamMember(body.id, !hard);
      await addAuditLog(
        "TEAM_UPDATE",
        hard ? `Permanently deleted team member: ${body.id}` : `Archived team member: ${body.id}`
      );
      return NextResponse.json({ success: true, message: hard ? "Team member deleted." : "Team member archived." });
    }

    // 5. Create / Update Member
    if (!body.name?.trim() || !body.designation?.trim()) {
      return NextResponse.json({ success: false, error: "Full name and designation are required." }, { status: 400 });
    }

    const responsibilities = Array.isArray(body.responsibilities)
      ? body.responsibilities
      : Array.isArray(body.roles)
      ? body.roles
      : [];

    const member: TeamMember = {
      id: body.id || `team-${Date.now()}`,
      name: body.name.trim(),
      displayName: body.displayName?.trim() || body.name.trim(),
      designation: body.designation.trim(),
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
      profileStoragePath: body.profileStoragePath?.trim() || "",
      profileObjectPositionX: body.profileObjectPositionX != null ? Number(body.profileObjectPositionX) : 50,
      profileObjectPositionY: body.profileObjectPositionY != null ? Number(body.profileObjectPositionY) : 50,
      profileScale: body.profileScale != null ? Number(body.profileScale) : 1,
      backgroundAssetUrl: body.backgroundAssetUrl?.trim() || "",
      backgroundType: body.backgroundType || "none",
      responsibilities,
      roles: responsibilities,
      skills: Array.isArray(body.skills) ? body.skills : [],
      email: body.email?.trim() || "",
      secondaryEmail: body.secondaryEmail?.trim() || "",
      phone: body.phone?.trim() || "",
      whatsapp: body.whatsapp?.trim() || "",
      location: body.location?.trim() || "",
      preferredContact: body.preferredContact?.trim() || "",
      githubUrl: body.githubUrl?.trim() || "",
      linkedinUrl: body.linkedinUrl?.trim() || "",
      instagramUrl: body.instagramUrl?.trim() || "",
      portfolioUrl: body.portfolioUrl?.trim() || "",
      websiteUrl: body.websiteUrl?.trim() || "",
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
      isVisible: body.isVisible !== false,
      isArchived: body.isArchived === true,
      displayOrder: body.displayOrder != null ? Number(body.displayOrder) : 0,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveTeamMember(member);
    await addAuditLog("TEAM_UPDATE", `Saved leadership member: ${member.name} (${member.designation})`);

    return NextResponse.json({ success: true, data: member });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
