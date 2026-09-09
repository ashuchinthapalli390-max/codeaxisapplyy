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
    const admin = await requireAdmin(req);
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

    if (action === "resend_confirmation") {
      const app = await getApplicationByRef(id);
      if (!app || !app.email) {
        return NextResponse.json({ success: false, error: "Application record or email not found." }, { status: 404 });
      }

      const { sendApplicationReceivedEmail } = await import("@/lib/email/send-application-received");
      let emailStatus = "sent";
      let emailError: string | null = null;
      let providerMessageId: string | null = null;

      try {
        const emailResult: any = await sendApplicationReceivedEmail({
          name: app.full_name,
          email: app.email,
          referenceId: app.reference_id || id,
        });
        emailStatus = emailResult ? "sent" : "failed";
        providerMessageId = emailResult?.data?.id || null;
      } catch (err: any) {
        emailStatus = "failed";
        emailError = err?.message || String(err);
      }

      try {
        const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
        const supabase = getSupabaseAdmin();
        if (supabase && app.id) {
          await supabase.from("email_logs").insert({
            application_id: app.id,
            email_type: "APPLICATION_CONFIRMATION_RETRY",
            recipient: app.email,
            provider_message_id: providerMessageId,
            status: emailStatus,
            error_message: emailError,
            sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
          });
        }
      } catch (logErr) {
        console.warn("Failed to log retry email:", logErr);
      }

      return NextResponse.json({
        success: emailStatus === "sent",
        message: emailStatus === "sent" ? "Confirmation email successfully resent." : `Failed to resend email: ${emailError}`,
      });
    }

    if (action === "restore") {
      const adminIdentifier = (admin as any)?.email || (admin as any)?.id || "admin";
      const ok = await restoreApplication(id, adminIdentifier);
      return NextResponse.json({ success: ok, message: "Application restored from Trash." });
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
    const admin = await requireAdmin(req);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";
    const reason = searchParams.get("reason") || undefined;
    const adminIdentifier = (admin as any)?.email || (admin as any)?.id || "admin";

    if (permanent) {
      const { permanentDeleteApplication } = await import("@/lib/storage");
      const ok = await permanentDeleteApplication(id);
      return NextResponse.json({ success: ok, message: "Application permanently deleted." });
    }

    const ok = await deleteApplication(id, reason, adminIdentifier);
    return NextResponse.json({ success: ok, message: "Application moved to Trash." });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
