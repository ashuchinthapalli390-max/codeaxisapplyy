import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { updateApplicationStatus, addApplicationNote } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { id, manual_status, status, admin_notes, note } = body;

    const targetId = id;
    const targetStatus = manual_status || status;
    const targetNotes = admin_notes || note;

    if (!targetId) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    if (targetStatus) {
      await updateApplicationStatus(targetId, targetStatus, targetNotes, "Master Admin");
    } else if (targetNotes) {
      await addApplicationNote(targetId, targetNotes);
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully.",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
