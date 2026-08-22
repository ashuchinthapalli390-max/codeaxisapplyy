import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplates, saveEmailTemplate, getEmailLogs } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    if (view === "logs") {
      const logs = await getEmailLogs();
      return NextResponse.json({ success: true, data: logs });
    }

    const templates = await getEmailTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (err) {
    console.error("Email fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch email data." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || !body.subject) {
      return NextResponse.json({ success: false, error: "Template ID and subject are required." }, { status: 400 });
    }

    await saveEmailTemplate(body);
    return NextResponse.json({ success: true, message: "Email template saved successfully." });
  } catch (err) {
    console.error("Save email template error:", err);
    return NextResponse.json({ success: false, error: "Failed to save template." }, { status: 500 });
  }
}
