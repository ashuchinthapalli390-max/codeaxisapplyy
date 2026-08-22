import { NextRequest, NextResponse } from "next/server";
import { getWebsiteSettings, saveWebsiteSettings } from "@/lib/storage";

export async function GET() {
  try {
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    console.error("Settings fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await saveWebsiteSettings(body);
    return NextResponse.json({ success: true, message: "Settings updated successfully." });
  } catch (err) {
    console.error("Save settings error:", err);
    return NextResponse.json({ success: false, error: "Failed to save settings." }, { status: 500 });
  }
}
