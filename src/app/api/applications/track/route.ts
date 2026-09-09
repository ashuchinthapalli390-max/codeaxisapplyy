import { NextRequest, NextResponse } from "next/server";
import { trackApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// Rate limiter: max 40 tracking requests per 1-minute window per IP
const trackRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = trackRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    trackRateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > 40;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many tracking requests. Please wait a moment before querying again.",
        },
        { status: 429, headers: NO_CACHE_HEADERS }
      );
    }
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref")?.trim();
    const email = searchParams.get("email")?.trim();

    // Privacy rule: BOTH Reference ID AND Applicant Email are strictly mandatory
    if (!ref || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Both Reference Code and Applicant Email are required to securely check application status.",
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const application = await trackApplication(ref, email);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "No application found matching that Reference Code and Email combination.",
        },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Retrieve optional interview or offer metadata for approved status updates
    const { getInterviewByRef, getOfferByRef } = await import("@/lib/storage");
    const [interview, offer] = await Promise.all([
      getInterviewByRef(application.reference_id || ""),
      getOfferByRef(application.reference_id || ""),
    ]);

    // SAFE PUBLIC DTO: Never expose answers, phone, address, resumes, notes, or raw evaluation scores
    const safeStatusDto: Record<string, unknown> = {
      reference_id: application.reference_id,
      applicant_name: application.full_name,
      full_name: application.full_name,
      college_name: application.college_name || "Applicant College",
      course: application.course || (application as any).degree || "Engineering",
      branch: application.branch || "Computer Science",
      status: application.status,
      created_at: application.created_at,
      submitted_at: (application as any).submitted_at || application.created_at,
      updated_at: application.updated_at,
    };

    if (interview && (application.status === "Interview Scheduled" || interview.status === "Scheduled" || interview.status === "Rescheduled")) {
      safeStatusDto.interview = {
        interview_round: interview.interview_round,
        interview_date: interview.interview_date,
        start_time: interview.start_time,
        timezone: interview.timezone,
        duration_minutes: interview.duration_minutes,
        platform: interview.platform,
        meeting_link: interview.meeting_link,
        status: interview.status,
      };
    }

    if (offer && ["Selected", "Offer Sent", "Offer Accepted", "Offer Declined"].includes(application.status || "")) {
      safeStatusDto.offer = {
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

    return NextResponse.json(
      {
        success: true,
        data: safeStatusDto,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("[Track Application API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Database error querying application status." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
