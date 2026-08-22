import { NextResponse } from "next/server";
import { getApplications } from "@/lib/storage";

export async function GET() {
  try {
    const { applications } = await getApplications({ limit: 10000 });

    const total = applications.length;
    const underReview = applications.filter((a) => a.status === "Under Review" || a.status === "Submitted").length;
    const shortlisted = applications.filter((a) => a.status === "Shortlisted").length;
    const selected = applications.filter((a) => a.status === "Selected").length;
    const rejected = applications.filter((a) => a.status === "Not Selected").length;

    // Score calculations
    const scores = applications.map((a) => a.total_score || 0);
    const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Score distribution
    const bands = {
      exceptional: applications.filter((a) => (a.total_score || 0) >= 85).length,
      strong: applications.filter((a) => (a.total_score || 0) >= 75 && (a.total_score || 0) < 85).length,
      good: applications.filter((a) => (a.total_score || 0) >= 65 && (a.total_score || 0) < 75).length,
      needsReview: applications.filter((a) => (a.total_score || 0) < 65).length,
    };

    // Commitment breakdown
    const commitment = {
      strong: applications.filter((a) => a.commitment_signal === "Strong").length,
      moderate: applications.filter((a) => a.commitment_signal === "Moderate").length,
      needsReview: applications.filter((a) => a.commitment_signal === "Needs Review").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        total,
        underReview,
        shortlisted,
        selected,
        rejected,
        avgScore,
        maxScore,
        bands,
        commitment,
      },
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to generate analytics." }, { status: 500 });
  }
}
