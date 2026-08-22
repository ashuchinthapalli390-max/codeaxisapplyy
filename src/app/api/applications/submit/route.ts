import { NextRequest, NextResponse } from "next/server";
import { ApplicationData } from "@/types/application";
import { calculateApplicationScores } from "@/lib/scoring";
import { saveApplication } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ApplicationData>;

    if (!body.full_name?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Full name and email are mandatory." },
        { status: 400 }
      );
    }

    // Compute comprehensive 100-point scoring model
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
    };

    const saved = await saveApplication(fullApplicationData);

    // Asynchronously dispatch confirmation emails if RESEND_API_KEY is configured
    try {
      const { sendApplicantConfirmationEmail } = await import("@/lib/email");
      await sendApplicantConfirmationEmail({
        ...fullApplicationData,
        id: saved.id,
        reference_id: saved.reference_id,
      });
    } catch (emailErr) {
      console.warn("Email notification skipped/failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        reference_id: saved.reference_id,
        total_score: scoreReport.total_score,
        score_band: scoreReport.score_band,
      },
    });
  } catch (error) {
    console.error("Application submission failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process application. Please try again." },
      { status: 500 }
    );
  }
}
