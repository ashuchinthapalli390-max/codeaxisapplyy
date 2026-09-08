import { NextRequest, NextResponse } from "next/server";
import { ApplicationData } from "@/types/application";
import { calculateApplicationScores } from "@/lib/scoring";
import { saveApplication, getActiveInternshipRound } from "@/lib/storage";
import { validateAllRounds } from "@/lib/validation";
import { resolveApplicationAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ApplicationData> & { submission_key?: string };

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid submission payload." },
        { status: 400 }
      );
    }

    // 1. Authoritative Server Availability Gate
    const activeRound = await getActiveInternshipRound();
    const serverTimeMs = Date.now();
    const availability = resolveApplicationAvailability(activeRound, serverTimeMs);

    if (!availability.canApply) {
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
        },
        { status: 403 }
      );
    }

    // 2. Server-side validation of screening questions
    const validation = validateAllRounds(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Please complete all mandatory screening questions before submitting.",
          errors: validation.errors,
          firstInvalidRound: validation.firstInvalidRound,
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

    // 5. Asynchronously dispatch Resend confirmation email
    // (Email failure is non-blocking and NEVER deletes or rolls back a saved submission)
    let emailStatus: "sent" | "failed" | "queued" = "queued";
    try {
      const { sendApplicationReceivedEmail } = await import("@/lib/email/send-application-received");
      const emailResult = await sendApplicationReceivedEmail({
        name: fullApplicationData.full_name,
        email: fullApplicationData.email,
        referenceId: saved.reference_id,
      });
      emailStatus = emailResult ? "sent" : "failed";
    } catch (emailErr) {
      emailStatus = "failed";
      console.warn("[Resend Email Notice]: Application submission saved successfully, but notification email failed to dispatch:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted and registered successfully.",
      emailStatus,
      data: {
        id: saved.id,
        reference_id: saved.reference_id,
        total_score: scoreReport.total_score,
        score_band: scoreReport.score_band,
      },
    });
  } catch (error: any) {
    console.error("[Application Submission Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process application. Your draft has been preserved. Please retry.",
      },
      { status: 500 }
    );
  }
}
