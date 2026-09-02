import { NextRequest, NextResponse } from "next/server";
import { trackApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref")?.trim();
    const email = searchParams.get("email")?.trim();

    // Tracking strictly requires both reference ID and email to prevent unauthorized data enumeration
    if (!ref || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Both Reference ID and registered email address are required to track application status.",
        },
        { status: 400 }
      );
    }

    const application = await trackApplication(ref, email);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "No application found matching that Reference ID and Email address.",
        },
        { status: 404 }
      );
    }

    // Return only non-sensitive public status fields
    const { getInterviewByRef, getOfferByRef } = await import("@/lib/storage");
    const [interview, offer] = await Promise.all([
      getInterviewByRef(application.reference_id || ""),
      getOfferByRef(application.reference_id || ""),
    ]);

    const safeData: any = {
      reference_id: application.reference_id,
      full_name: application.full_name,
      email: application.email,
      college_name: application.college_name,
      course: application.course,
      branch: application.branch,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
    };

    if (interview && (application.status === "Interview Scheduled" || interview.status === "Scheduled")) {
      safeData.interview = {
        interview_round: interview.interview_round,
        interview_date: interview.interview_date,
        start_time: interview.start_time,
        timezone: interview.timezone,
        duration_minutes: interview.duration_minutes,
        platform: interview.platform,
        meeting_link: interview.meeting_link,
        interviewer_name: interview.interviewer_name,
        instructions: interview.instructions,
        status: interview.status,
      };
    }

    if (offer && ["Selected", "Offer Sent", "Offer Accepted", "Offer Declined"].includes(application.status || "")) {
      safeData.offer = {
        internship_role: offer.internship_role,
        department: offer.department,
        batch_code: offer.batch_code,
        joining_date: offer.joining_date,
        duration: offer.duration,
        work_mode: offer.work_mode,
        stipend_status: offer.stipend_status,
        acceptance_deadline: offer.acceptance_deadline,
        status: offer.status,
      };
    }

    return NextResponse.json({
      success: true,
      data: safeData,
    });
  } catch (err) {
    console.error("[Track Application API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Database error querying application status." },
      { status: 500 }
    );
  }
}
