import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { deleteApplication, permanentDeleteApplication } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const adminIdentifier = (admin as any)?.email || (admin as any)?.id || "admin";

    const body = (await req.json()) as {
      id?: string;
      permanent?: boolean;
      reason?: string;
      confirmation?: string;
    };
    const { id, permanent, reason, confirmation } = body;

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Application ID or Reference is required." },
        { status: 400 }
      );
    }

    const inputId = id.trim();

    // Permanent Hard Deletion (Requires explicit strong confirmation)
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

      const ok = await permanentDeleteApplication(inputId);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: `Application "${inputId}" not found or could not be permanently deleted.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Application permanently deleted along with all associated records.",
      });
    }

    // Standard Protected Soft Delete via resilient storage helper
    try {
      const ok = await deleteApplication(inputId, reason, adminIdentifier);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: `Application "${inputId}" not found.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Application moved to Trash.",
      });
    } catch (delErr: any) {
      if (delErr?.statusCode === 409 || delErr?.message?.includes("already in Trash")) {
        return NextResponse.json(
          { success: false, error: delErr.message || `Application "${inputId}" is already in Trash.` },
          { status: 409 }
        );
      }
      if (delErr?.message?.includes("not found")) {
        return NextResponse.json(
          { success: false, error: delErr.message || `Application "${inputId}" not found.` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: delErr?.message || "Unable to move application to Trash." },
        { status: 500 }
      );
    }
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
