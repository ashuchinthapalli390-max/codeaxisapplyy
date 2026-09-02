import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { deleteApplication, permanentDeleteApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = (await req.json()) as {
      id?: string;
      permanent?: boolean;
      reason?: string;
      confirmation?: string;
    };
    const { id, permanent, reason, confirmation } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "Application ID or Reference is required." }, { status: 400 });
    }

    if (permanent) {
      if (confirmation?.trim() !== "DELETE") {
        return NextResponse.json(
          {
            success: false,
            error: 'Strong confirmation required: Type "DELETE" to permanently remove this application.',
          },
          { status: 400 }
        );
      }

      const ok = await permanentDeleteApplication(id);
      return NextResponse.json({
        success: ok,
        message: "Application permanently deleted along with all associated records.",
      });
    }

    const ok = await deleteApplication(id, reason);
    return NextResponse.json({
      success: ok,
      message: "Application moved to Trash.",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
