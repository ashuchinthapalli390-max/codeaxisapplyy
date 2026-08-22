import { NextRequest, NextResponse } from "next/server";
import { getTeamMembers, saveTeamMember, deleteTeamMember, addAuditLog } from "@/lib/storage";
import { TeamMember } from "@/types/admin";

export async function GET() {
  try {
    const team = await getTeamMembers();
    return NextResponse.json({ success: true, data: team });
  } catch (err) {
    console.error("Team fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch team data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TeamMember & { action?: string };

    if (body.action === "delete" && body.id) {
      await deleteTeamMember(body.id);
      await addAuditLog("TEAM_UPDATE", `Deleted team member: ${body.id}`);
      return NextResponse.json({ success: true, message: "Team member removed." });
    }

    if (!body.name?.trim() || !body.designation?.trim()) {
      return NextResponse.json({ success: false, error: "Name and designation are required." }, { status: 400 });
    }

    const member: TeamMember = {
      id: body.id || `team-${Date.now()}`,
      name: body.name.trim(),
      designation: body.designation.trim(),
      roleType: body.roleType || "Core Team",
      photoUrl: body.photoUrl || "/logo.jpeg",
      bio: body.bio || "",
      quote: body.quote || "",
      roles: body.roles || [],
      skills: body.skills || [],
      email: body.email,
      whatsapp: body.whatsapp,
      githubUrl: body.githubUrl,
      linkedinUrl: body.linkedinUrl,
      instagramUrl: body.instagramUrl,
      websiteUrl: body.websiteUrl,
      showContact: body.showContact ?? true,
      isFeatured: body.isFeatured ?? true,
      displayOrder: body.displayOrder || 1,
    };

    await saveTeamMember(member);
    await addAuditLog("TEAM_UPDATE", `Saved leadership member: ${member.name} (${member.designation})`);

    return NextResponse.json({ success: true, data: member });
  } catch (err) {
    console.error("Save team error:", err);
    return NextResponse.json({ success: false, error: "Failed to update team." }, { status: 500 });
  }
}
