import { NextRequest, NextResponse } from "next/server";
import {
  getAdminLeadership,
  getPublicLeadership,
  saveLeadershipMember,
  deleteLeadershipMember,
  restoreLeadershipMember,
  reorderLeadershipMembers,
  reconcileLeadershipDatabase,
  LeadershipError,
} from "@/lib/leadership/repository";
import { addAuditLog, duplicateTeamMember } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { randomBytes } from "node:crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const requestId = randomBytes(4).toString("hex");
  try {
    const { searchParams } = new URL(req.url);
    const publicOnly = searchParams.get("public") === "true";

    if (!publicOnly) {
      await requireAdmin(req);
    }

    if (publicOnly) {
      const publicMembers = await getPublicLeadership();
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

    const allMembers = await getAdminLeadership();
    console.log(`[Leadership API][${requestId}] Admin query returned ${allMembers.length} members.`);

    return NextResponse.json(
      { success: true, data: allMembers, count: allMembers.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error(`[Leadership API][${requestId}] Query error:`, err);
    if (err instanceof LeadershipError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
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
    // Non-blocking in non-Next runtime
  }
}

export async function POST(req: NextRequest) {
  const requestId = randomBytes(4).toString("hex");
  try {
    // Verify admin authentication
    const admin = await requireAdmin(req);
    const adminIdentity = {
      email: (admin as any).email,
      id: (admin as any).id,
    };

    const body = await req.json();
    const action = body.action || "save";

    // 1. Reconcile Action (Manual or self-healing trigger)
    if (action === "reconcile") {
      console.log(`[Leadership API][${requestId}] Reconcile triggered by admin.`);
      const result = await reconcileLeadershipDatabase();
      await addAuditLog(
        "TEAM_UPDATE",
        `Reconciled leadership records: ${result.inserted} inserted, ${result.archivedStale} stale archived.`
      );
      await triggerTeamCacheInvalidation();
      return NextResponse.json({ success: true, ...result });
    }

    // 2. Reorder Action
    if (action === "reorder" && Array.isArray(body.orderedIds)) {
      console.log(`[Leadership API][${requestId}] Reorder started: ${body.orderedIds.length} profiles.`);
      await reorderLeadershipMembers(body.orderedIds, adminIdentity);
      await addAuditLog("TEAM_UPDATE", `Reordered ${body.orderedIds.length} leadership profiles.`);
      await triggerTeamCacheInvalidation();
      console.log(`[Leadership API][${requestId}] Reorder completed successfully.`);
      return NextResponse.json({ success: true, message: "Display order saved." });
    }

    // 3. Duplicate Action
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

    // 4. Restore Action
    if (action === "restore" && body.id) {
      console.log(`[Leadership API][${requestId}] Restore started for ID: ${body.id}`);
      const restored = await restoreLeadershipMember(body.id, adminIdentity);
      await addAuditLog("TEAM_UPDATE", `Restored archived team profile: ${body.id}`);
      await triggerTeamCacheInvalidation();
      console.log(`[Leadership API][${requestId}] Restore completed for ID: ${body.id}`);
      return NextResponse.json({ success: true, message: "Profile restored.", data: restored });
    }

    // 5. Delete Action (Soft delete by default, or hard delete if specified)
    if (action === "delete" && body.id) {
      const hard = body.hardDelete === true;
      console.log(`[Leadership API][${requestId}] Delete started for ID: ${body.id} (hard=${hard})`);
      await deleteLeadershipMember(body.id, !hard, adminIdentity);
      await addAuditLog(
        "TEAM_UPDATE",
        hard ? `Permanently deleted team member: ${body.id}` : `Archived team member: ${body.id}`
      );
      await triggerTeamCacheInvalidation();
      console.log(`[Leadership API][${requestId}] Delete completed for ID: ${body.id}`);
      return NextResponse.json({ success: true, message: hard ? "Team member deleted." : "Team member archived." });
    }

    // 6. Create / Update Member
    const memberId = body.id || `team-${Date.now()}`;
    console.log(`[Leadership API][${requestId}] Leadership update started: memberId = ${memberId}`);

    const savedMember = await saveLeadershipMember(body, adminIdentity);

    await addAuditLog(
      "TEAM_UPDATE",
      `Saved leadership member: ${savedMember.name} (${savedMember.designation}) by ${adminIdentity.email || adminIdentity.id || "admin"}`
    );
    await triggerTeamCacheInvalidation();

    console.log(`[Leadership API][${requestId}] Leadership update completed successfully: memberId = ${savedMember.id}`);
    return NextResponse.json({ success: true, data: savedMember });
  } catch (err: any) {
    console.error(`[Leadership API][${requestId}] Leadership update failed:`, err.message || err);
    if (err instanceof LeadershipError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode });
    }
    return handleAdminAuthError(err);
  }
}
