import { NextRequest, NextResponse } from "next/server";
import { trackApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref")?.trim();
    const email = searchParams.get("email")?.trim();

    if (!ref) {
      return NextResponse.json(
        {
          success: false,
          error: "Reference ID is required to track application status.",
        },
        { status: 400 }
      );
    }

    const { getApplicationByRef } = await import("@/lib/storage");
    const application = email
      ? await trackApplication(ref, email)
      : await getApplicationByRef(ref);

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "No application found matching that Reference ID.",
        },
        { status: 404 }
      );
    }

    // Return complete applicant profile fields required for PDF confirmation
    const { getInterviewByRef, getOfferByRef } = await import("@/lib/storage");
    const [interview, offer] = await Promise.all([
      getInterviewByRef(application.reference_id || ""),
      getOfferByRef(application.reference_id || ""),
    ]);

    const safeData: any = {
      ...application,
      reference_id: application.reference_id,
      full_name: application.full_name,
      email: application.email,
      phone_number: application.phone_number,
      whatsapp_number: application.whatsapp_number,
      date_of_birth: application.date_of_birth,
      city: application.city,
      state: application.state,
      country: application.country,
      preferred_name: application.preferred_name,
      discord_username: application.discord_username,
      hobbies: application.hobbies || [],

      college_name: application.college_name,
      university_name: application.university_name,
      course: application.course || application.degree,
      branch: application.branch,
      academic_year: application.academic_year,
      semester: application.semester,
      roll_number: application.roll_number,
      expected_graduation: application.expected_graduation || application.graduation_year,
      cgpa: application.cgpa || application.percentage,

      coding_start_timeline: application.coding_start_timeline,
      has_built_projects: application.has_built_projects,
      developer_links: application.developer_links || [],
      projects: application.projects || [],
      github_profile: application.github_profile,
      linkedin_profile: application.linkedin_profile,
      portfolio_website: application.portfolio_website,

      daily_availability: application.daily_availability,
      available_days: application.available_days || [],
      preferred_timing: application.preferred_timing || [],
      can_attend_meetings: application.can_attend_meetings,
      can_meet_deadlines: application.can_meet_deadlines,
      can_communicate_if_unavailable: application.can_communicate_if_unavailable,
      laptop_status: application.laptop_status,
      operating_system: application.operating_system,
      ram_capacity: application.ram_capacity,
      internet_stability: application.internet_stability,
      can_run_dev_tools: application.can_run_dev_tools,

      c_level: application.c_level,
      python_level: application.python_level,
      java_level: application.java_level,
      html_level: application.html_level,
      vibe_coding_level: application.vibe_coding_level,

      commitment_accurate_info: application.commitment_accurate_info ?? true,
      commitment_independent_work: application.commitment_independent_work ?? true,
      commitment_accept_policies: application.commitment_accept_policies ?? true,

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
