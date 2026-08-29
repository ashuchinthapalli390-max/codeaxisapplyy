import { NextRequest, NextResponse } from "next/server";
import { getSiteModules, saveSiteModule, addAuditLog } from "@/lib/storage";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import { SiteModule } from "@/types/admin";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const modules = await getSiteModules(true);
    return NextResponse.json({ success: true, data: modules });
  } catch (err) {
    console.error("[Admin Modules Fetch Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch modules." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionCheck = await validateSession(token);
    if (!sessionCheck.isValid) {
      return NextResponse.json({ success: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const body = (await req.json()) as SiteModule;
    if (!body || !body.title?.trim()) {
      return NextResponse.json({ success: false, error: "Module title is required." }, { status: 400 });
    }

    const saved = await saveSiteModule(body);
    await addAuditLog("MODULES_UPDATE" as any, `Saved module ${saved.module_code}: ${saved.title}`);

    try {
      revalidateTag("site-modules", "max-age=0" as any);
    } catch {
      // non-blocking cache invalidation
    }

    return NextResponse.json({
      success: true,
      message: "Module saved successfully.",
      data: saved,
    });
  } catch (err) {
    console.error("[Admin Modules Save Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to save module." }, { status: 500 });
  }
}
