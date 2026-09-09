import { NextRequest, NextResponse } from "next/server";
import { ApplicationData } from "@/types/application";
import { calculateApplicationScores } from "@/lib/scoring";
import { saveApplication, getActiveInternshipRound } from "@/lib/storage";
import { validateAllRounds } from "@/lib/validation";
import { resolveApplicationAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get("x-request-id") || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const body = (await req.json()) as Partial<ApplicationData> & { submission_key?: string; submission_token?: string };

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid submission payload.", requestId },
        { status: 400 }
      );
    }

    const safeTokenPrefix = String(body.submission_token || body.submission_key || "unknown").slice(0, 12);
    console.info(JSON.stringify({
      event: "APPLICATION_SUBMISSION_ATTEMPT",
      requestId,
      submissionTokenPrefix: safeTokenPrefix,
      timestamp: new Date().toISOString(),
    }));

    // 1. Authoritative Server Availability Gate
    const activeRound = await getActiveInternshipRound();
    const serverTimeMs = Date.now();
    const availability = resolveApplicationAvailability(activeRound, serverTimeMs);

    if (!availability.canApply) {
      console.warn(`[${requestId}] Submission blocked by availability gate. Effective status: ${availability.effectiveStatus}`);
      const isSoon = availability.effectiveStatus === "OPENING_SOON";
      return NextResponse.json(
        {
          success: false,
          error: isSoon
            ? "Applications are not open yet. Please check back when the application window begins."
            : "Applications are currently closed for this round.",
          reasonCode: availability.reasonCode,
          effectiveStatus: availability.effectiveStatus,
          roundId: availability.roundId,
          requestId,
        },
        { status: 403 }
      );
    }

    // 2. Server-side validation of screening questions
    const validation = validateAllRounds(body);
    if (!validation.isValid) {
      console.warn(`[${requestId}] Submission failed validation: ${validation.errors.length} errors, first invalid round: ${validation.firstInvalidRound}`);
      return NextResponse.json(
        {
          success: false,
          error: "Please complete all mandatory screening questions before submitting.",
          errors: validation.errors,
          firstInvalidRound: validation.firstInvalidRound,
          requestId,
        },
        { status: 422 }
      );
    }

    // 3. Compute 100-point scoring model and authenticity signals
    const scoreReport = calculateApplicationScores(body);

    const fullApplicationData: ApplicationData = {
      ...(body as ApplicationData),
      genuineness_integrity_score: scoreReport.genuineness_integrity_score,
      commitment_continuity_score: scoreReport.commitment_continuity_score,
      mindset_habits_score: scoreReport.mindset_habits_score,
      technical_knowledge_score: scoreReport.technical_knowledge_score,
      learning_potential_score: scoreReport.learning_potential_score,
      interview_communication_score: scoreReport.interview_communication_score,
      total_score: scoreReport.total_score,
      score_band: scoreReport.score_band,
      commitment_signal: scoreReport.commitment_signal,
      skill_authenticity: scoreReport.skill_authenticity,
      status: "Submitted",
      admin_notes: [],
      admin_tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 4. Save atomically with collision-safe reference ID
    const saved = await saveApplication(fullApplicationData);
    console.info(`[${requestId}] Application registered successfully with reference_id: ${saved.reference_id}, ID: ${saved.id}`);

    // 5. Asynchronously dispatch Resend confirmation email
    // (Email failure is non-blocking and NEVER deletes or rolls back a saved submission)
    let emailStatus: "sent" | "failed" | "queued" = "queued";
    let emailError: string | null = null;
    let providerMessageId: string | null = null;

    try {
      const { sendApplicationReceivedEmail } = await import("@/lib/email/send-application-received");
      const emailResult: any = await sendApplicationReceivedEmail({
        name: fullApplicationData.full_name,
        email: fullApplicationData.email,
        referenceId: saved.reference_id,
      });
      emailStatus = emailResult ? "sent" : "failed";
      providerMessageId = emailResult?.data?.id || null;
      console.info(`[${requestId}] Confirmation email dispatch status: ${emailStatus}`);
    } catch (emailErr: any) {
      emailStatus = "failed";
      emailError = emailErr?.message || String(emailErr);
      console.warn(`[${requestId}] [Resend Email Notice]: Notification email failed to dispatch (submission preserved):`, emailErr);
    }

    // Record delivery metadata tied strictly to newly inserted application UUID
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const supabase = getSupabaseAdmin();
      if (supabase && saved.id) {
        await supabase.from("email_logs").insert({
          application_id: saved.id,
          email_type: "APPLICATION_CONFIRMATION",
          recipient: fullApplicationData.email,
          provider_message_id: providerMessageId,
          status: emailStatus,
          error_message: emailError,
          sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
        });
      }
    } catch (logErr) {
      console.warn(`[${requestId}] Email log record notice:`, logErr);
    }

    const durationMs = Date.now() - startTime;
    console.info(JSON.stringify({
      event: "APPLICATION_SUBMITTED_SUCCESS",
      requestId,
      submissionTokenPrefix: String(body?.submission_token || body?.submission_key || "unknown").slice(0, 12),
      applicationUuid: saved.id,
      referenceCode: saved.reference_id,
      roundId: availability.roundId,
      resultStatus: "SUCCESS",
      emailStatus,
      durationMs,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted and registered successfully.",
        requestId,
        emailStatus,
        data: {
          id: saved.id,
          reference_id: saved.reference_id,
          applicant_name: fullApplicationData.full_name,
          submitted_at: saved.submitted_at || new Date().toISOString(),
          total_score: scoreReport.total_score,
          score_band: scoreReport.score_band,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error(JSON.stringify({
      event: "APPLICATION_SUBMISSION_ERROR",
      requestId,
      resultStatus: error?.statusCode === 409 ? "CONFLICT" : "ERROR",
      supabaseErrorCode: error?.code || null,
      errorMessage: error?.message || String(error),
      durationMs,
    }));

    if (error?.statusCode === 409 || error?.code === "ALREADY_SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error: error.message || "An application has already been submitted for this email address in this round.",
          code: "ALREADY_SUBMITTED",
          requestId,
        },
        { status: 409, headers: { "Cache-Control": "private, no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process application. Your draft has been preserved. Please retry.",
        requestId,
      },
      { status: 500, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}

