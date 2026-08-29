import { NextRequest, NextResponse } from "next/server";
import { getSiteModules } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const modules = await getSiteModules(false);
    return NextResponse.json(
      { success: true, data: modules },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("[Modules Public API Error]:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch modules." }, { status: 500 });
  }
}
