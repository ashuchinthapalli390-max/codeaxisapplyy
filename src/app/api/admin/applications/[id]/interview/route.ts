import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { getApplicationByRef, getInterviewByRef, saveInterview, updateInterviewStatus, logAdminAction } from "@/lib/storage";
import { sendInterviewInvitationEmail } from "@/lib/email";
import { InterviewData } from "@/types/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const interview = await getInterviewByRef(id);

  return NextResponse.json({
    success: true,
    data: interview || null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await getApplicationByRef(id);
  if (!application) {
    return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const action = body.action || "schedule";

    if (action === "update_status") {
      const { status, notes } = body;
      await updateInterviewStatus(id, status, notes);
      await logAdminAction(
        "INTERVIEW_STATUS_UPDATE",
        id,
        `Interview status updated to ${status}. Notes: ${notes || "None"}`
      );
      const updated = await getInterviewByRef(id);
      return NextResponse.json({ success: true, data: updated });
    }

    // Scheduling / Rescheduling
    const interviewData: InterviewData = {
      reference_id: id,
      application_id: application.id,
      applicant_name: application.full_name,
      applicant_email: application.email,
      interview_round: body.interview_round || "Technical & Mindset Review",
      interview_date: body.interview_date,
      start_time: body.start_time,
      timezone: body.timezone || "Asia/Kolkata",
      duration_minutes: Number(body.duration_minutes) || 30,
      platform: body.platform || "Google Meet",
      meeting_link: body.meeting_link?.trim(),
      interviewer_name: body.interviewer_name || "Ashu Chinthapalli",
      instructions: body.instructions || "",
      admin_notes: body.admin_notes || "",
      status: action === "reschedule" ? "Rescheduled" : "Scheduled",
      invitation_sent: Boolean(body.send_email ?? true),
    };

    if (!interviewData.interview_date || !interviewData.start_time || !interviewData.meeting_link) {
      return NextResponse.json(
        { success: false, error: "Interview date, start time, and valid meeting link are required." },
        { status: 400 }
      );
    }

    // Save to storage and database
    const saved = await saveInterview(interviewData);

    // Send invitation email if enabled
    let emailResult = { success: true };
    if (body.send_email !== false) {
      emailResult = await sendInterviewInvitationEmail(saved);
    }

    await logAdminAction(
      action === "reschedule" ? "INTERVIEW_RESCHEDULED" : "INTERVIEW_SCHEDULED",
      id,
      `Interview scheduled with ${application.full_name} for ${saved.interview_date} at ${saved.start_time} (${saved.platform}). Email sent: ${emailResult.success}`
    );

    return NextResponse.json({
      success: true,
      data: saved,
      email_sent: emailResult.success,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process interview scheduling" },
      { status: 500 }
    );
  }
}
