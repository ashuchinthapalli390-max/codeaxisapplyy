import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { deleteApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    const ok = await deleteApplication(id);
    return NextResponse.json({
      success: ok,
      message: "Application moved to Trash.",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
