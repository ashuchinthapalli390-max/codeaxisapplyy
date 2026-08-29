import { NextRequest, NextResponse } from "next/server";
import {
  getApplicationByRef,
  updateApplicationStatus,
  addApplicationNote,
  deleteApplication,
  restoreApplication,
} from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const application = await getApplicationByRef(id);

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { action, status, note, adminUser } = body;

    if (action === "update_status" && status) {
      const ok = await updateApplicationStatus(id, status, note, adminUser || "Master Admin");

      // If status is changed to "Selected", trigger automated onboarding email with private Discord/WhatsApp invites
      if (ok && status.toLowerCase() === "selected") {
        try {
          const app = await getApplicationByRef(id);
          if (app && app.email) {
            const { sendSelectedEmail } = await import("@/lib/email/send-selected");
            await sendSelectedEmail({
              name: app.full_name,
              email: app.email,
              referenceId: app.reference_id || id,
            });
          }
        } catch (selEmailErr) {
          console.warn("Selected email notification error:", selEmailErr);
        }
      }

      return NextResponse.json({ success: ok, message: `Status updated to ${status}.` });
    }

    if (action === "add_note" && note) {
      const ok = await addApplicationNote(id, note);
      return NextResponse.json({ success: ok, message: "Note appended." });
    }

    if (action === "restore") {
      const ok = await restoreApplication(id);
      return NextResponse.json({ success: ok, message: "Application restored." });
    }

    return NextResponse.json({ success: false, error: "Invalid action specified." }, { status: 400 });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const ok = await deleteApplication(id);
    return NextResponse.json({ success: ok, message: "Application archived / soft-deleted." });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
