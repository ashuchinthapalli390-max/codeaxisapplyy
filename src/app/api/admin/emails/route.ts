import { NextRequest, NextResponse } from "next/server";
import { getEmailTemplates, saveEmailTemplate, getEmailLogs } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    if (view === "logs") {
      const logs = await getEmailLogs();
      return NextResponse.json({ success: true, data: logs });
    }

    const templates = await getEmailTemplates();
    return NextResponse.json({ success: true, data: templates });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    if (!body.id || !body.subject) {
      return NextResponse.json({ success: false, error: "Template ID and subject are required." }, { status: 400 });
    }

    await saveEmailTemplate(body);
    return NextResponse.json({ success: true, message: "Email template saved successfully." });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
