import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { restoreApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    const ok = await restoreApplication(id);
    return NextResponse.json({
      success: ok,
      message: "Application restored successfully.",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
