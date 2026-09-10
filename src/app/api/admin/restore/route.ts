import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { restoreApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const adminIdentifier = (admin as any)?.email || (admin as any)?.id || "admin";

    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ success: false, error: "Application ID is required." }, { status: 400 });
    }

    const inputId = id.trim();

    try {
      const ok = await restoreApplication(inputId, adminIdentifier);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: `Application "${inputId}" not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Application restored to Active pipeline successfully.",
      });
    } catch (restoreErr: any) {
      if (restoreErr?.statusCode === 409 || restoreErr?.message?.includes("already active")) {
        return NextResponse.json(
          { success: false, error: restoreErr.message || `Application "${inputId}" is already active.` },
          { status: 409 }
        );
      }
      if (restoreErr?.message?.includes("not found")) {
        return NextResponse.json(
          { success: false, error: restoreErr.message || `Application "${inputId}" not found.` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: restoreErr?.message || "Unable to restore application." },
        { status: 500 }
      );
    }
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
