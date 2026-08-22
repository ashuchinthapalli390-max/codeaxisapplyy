import { NextRequest, NextResponse } from "next/server";
import {
  getApplicationByRef,
  updateApplicationStatus,
  addApplicationNote,
  deleteApplication,
  restoreApplication,
} from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await getApplicationByRef(id);

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    console.error("Get application detail error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch candidate record." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, status, note, adminUser } = body;

    if (action === "update_status" && status) {
      const ok = await updateApplicationStatus(id, status, note, adminUser || "Master Admin");
      return NextResponse.json({ success: ok, message: `Status updated to ${status}.` });
    }

    if (action === "add_note" && note) {
      const ok = await addApplicationNote(id, note);
      return NextResponse.json({ success: ok, message: "Note appended." });
    }

    if (action === "restore") {
      const ok = await restoreApplication(id);
      return NextResponse.json({ success: ok, message: "Application restored." });
    }

    return NextResponse.json({ success: false, error: "Invalid action specified." }, { status: 400 });
  } catch (err) {
    console.error("Application action error:", err);
    return NextResponse.json({ success: false, error: "Failed to execute candidate action." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteApplication(id);
    return NextResponse.json({ success: ok, message: "Application archived / soft-deleted." });
  } catch (err) {
    console.error("Delete application error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete application." }, { status: 500 });
  }
}
