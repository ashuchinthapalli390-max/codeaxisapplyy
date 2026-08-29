import { NextRequest, NextResponse } from "next/server";
import { getWebsiteSettings, saveWebsiteSettings } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    await saveWebsiteSettings(body);
    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
