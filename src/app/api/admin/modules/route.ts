import { NextRequest, NextResponse } from "next/server";
import { getSiteModules, saveSiteModule, addAuditLog } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { SiteModule } from "@/types/admin";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const modules = await getSiteModules(true);
    return NextResponse.json({ success: true, data: modules });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    await requireAdmin(req);

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
    return handleAdminAuthError(err);
  }
}
