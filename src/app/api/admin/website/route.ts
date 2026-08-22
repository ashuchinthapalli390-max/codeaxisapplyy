import { NextRequest, NextResponse } from "next/server";
import { getWebsiteSettings, saveWebsiteSettings, getFaqs, saveFaq, deleteFaq } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "faqs") {
      const faqs = await getFaqs();
      return NextResponse.json({ success: true, data: faqs });
    }

    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    console.error("Website CMS fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch website settings." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "faq") {
      if (body.action === "delete" && body.id) {
        await deleteFaq(body.id);
        return NextResponse.json({ success: true, message: "FAQ removed." });
      }
      await saveFaq(body.faq);
      return NextResponse.json({ success: true, message: "FAQ saved." });
    }

    // Default: update site settings
    await saveWebsiteSettings(body.settings);
    return NextResponse.json({ success: true, message: "Website CMS settings updated." });
  } catch (err) {
    console.error("Website CMS save error:", err);
    return NextResponse.json({ success: false, error: "Failed to save website settings." }, { status: 500 });
  }
}
