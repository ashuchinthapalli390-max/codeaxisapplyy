import { NextRequest, NextResponse } from "next/server";
import { ApplicationData } from "@/types/application";
import { calculateApplicationScores } from "@/lib/scoring";
import { saveApplication } from "@/lib/storage";
import { validateAllRounds } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ApplicationData>;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid submission payload." },
        { status: 400 }
      );
    }

    // 1. Server-side validation of screening questions
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

    // 2. Compute 100-point scoring model and authenticity signals
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

    // 3. Save atomically with collision-safe reference ID
    const saved = await saveApplication(fullApplicationData);

    // 4. Asynchronously dispatch Resend confirmation email
    // (Email failure is non-blocking and NEVER deletes or rolls back a saved submission)
    try {
      const { sendApplicationReceivedEmail } = await import("@/lib/email/send-application-received");
      await sendApplicationReceivedEmail({
        name: fullApplicationData.full_name,
        email: fullApplicationData.email,
        referenceId: saved.reference_id,
      });
    } catch (emailErr) {
      console.warn("[Resend Email Notice]: Application submission saved successfully, but notification email failed to dispatch:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted and registered successfully.",
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
