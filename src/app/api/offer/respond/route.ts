import { NextRequest, NextResponse } from "next/server";
import { getOfferByToken, respondToOffer, logAdminAction } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ success: false, error: "Missing offer verification token." }, { status: 400 });
  }

  const offer = await getOfferByToken(token);
  if (!offer) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired offer verification token." },
      { status: 404 }
    );
  }

  // Check if acceptance deadline has passed
  const isExpired = offer.acceptance_deadline
    ? new Date(offer.acceptance_deadline + "T23:59:59+05:30").getTime() < Date.now()
    : false;

  return NextResponse.json({
    success: true,
    data: {
      reference_id: offer.reference_id,
      applicant_name: offer.applicant_name,
      applicant_email: offer.applicant_email,
      internship_role: offer.internship_role,
      department: offer.department,
      batch_code: offer.batch_code,
      joining_date: offer.joining_date,
      duration: offer.duration,
      work_mode: offer.work_mode,
      work_location: offer.work_location,
      working_hours: offer.working_hours,
      reporting_person: offer.reporting_person,
      stipend_status: offer.stipend_status,
      acceptance_deadline: offer.acceptance_deadline,
      authorized_person: offer.authorized_person,
      designation: offer.designation,
      status: offer.status,
      responded_at: offer.responded_at,
      is_expired: isExpired,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, action, decline_reason } = body;

    if (!token || !action) {
      return NextResponse.json(
        { success: false, error: "Token and decision action are required." },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        { success: false, error: "Invalid action. Must be 'accept' or 'decline'." },
        { status: 400 }
      );
    }

    const offerResponse = action === "accept" ? "Offer Accepted" : "Offer Declined";
    const result = await respondToOffer(token, offerResponse, decline_reason);

    if (!result.success || !result.offer) {
      return NextResponse.json({ success: false, error: result.error || "Failed to process offer response." }, { status: 400 });
    }

    await logAdminAction(
      action === "accept" ? "OFFER_ACCEPTED" : "OFFER_DECLINED",
      result.offer.reference_id,
      `Candidate ${result.offer.applicant_name} has officially ${offerResponse} for Role: ${result.offer.internship_role}. Reason: ${decline_reason || "None specified"}`
    );

    return NextResponse.json({
      success: true,
      message: `You have successfully ${action === "accept" ? "accepted" : "declined"} the offer.`,
      status: result.offer.status,
      responded_at: result.offer.responded_at,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit response." },
      { status: 500 }
    );
  }
}
