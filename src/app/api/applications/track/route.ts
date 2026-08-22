import { NextRequest, NextResponse } from "next/server";
import { getApplicationByRef, trackApplication } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");
    const email = searchParams.get("email");

    if (!ref) {
      return NextResponse.json({ success: false, error: "Reference ID is required." }, { status: 400 });
    }

    let application = null;
    if (email) {
      application = await trackApplication(ref, email);
    } else {
      application = await getApplicationByRef(ref);
    }

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found with provided credentials." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });
  } catch (err) {
    console.error("Track error:", err);
    return NextResponse.json({ success: false, error: "Database error querying application." }, { status: 500 });
  }
}
