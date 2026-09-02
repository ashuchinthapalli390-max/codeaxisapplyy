import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminSession } from "@/lib/admin/session";
import { getApplicationByRef, getOfferByRef, saveOffer, logAdminAction } from "@/lib/storage";
import { sendOfferLetterEmail } from "@/lib/email";
import { OfferData } from "@/types/admin";

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
  const offer = await getOfferByRef(id);

  return NextResponse.json({
    success: true,
    data: offer || null,
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

    const existingOffer = await getOfferByRef(id);
    const version = existingOffer ? (existingOffer.version || 1) + 1 : 1;
    const token = crypto.randomBytes(32).toString("hex");

    const offerData: OfferData = {
      reference_id: id,
      application_id: application.id,
      applicant_name: application.full_name,
      applicant_email: application.email,
      internship_role: body.internship_role || "Full-Stack Developer Intern",
      department: body.department || "Engineering & Product Development",
      batch_code: body.batch_code || "2026-SEP",
      joining_date: body.joining_date || "2026-09-15",
      duration: body.duration || "12 Weeks",
      work_mode: body.work_mode || "Remote",
      work_location: body.work_location || "Online / Remote",
      working_hours: body.working_hours || "Flexible / 3-4 Hours Daily",
      reporting_person: body.reporting_person || "Ashu Chinthapalli (Founder & CEO)",
      stipend_status: body.stipend_status || "Performance-Based Project Stipends",
      acceptance_deadline: body.acceptance_deadline || "2026-09-10",
      terms_and_conditions: body.terms_and_conditions || "",
      authorized_person: body.authorized_person || "Ashu Chinthapalli",
      designation: body.designation || "Founder & Chief Executive Officer",
      token,
      status: "Offer Sent",
      version,
    };

    const saved = await saveOffer(offerData);

    // Dispatch official Congratulations Offer Letter Email
    let emailResult = { success: true };
    if (body.send_email !== false) {
      emailResult = await sendOfferLetterEmail(saved);
    }

    await logAdminAction(
      "OFFER_GENERATED",
      id,
      `Official Offer Letter generated for ${application.full_name} (Role: ${saved.internship_role}, Version: ${version}). Email dispatched: ${emailResult.success}`
    );

    return NextResponse.json({
      success: true,
      data: saved,
      email_sent: emailResult.success,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate offer letter" },
      { status: 500 }
    );
  }
}
