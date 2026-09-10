import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { addAuditLog } from "@/lib/storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      // Memory fallback for offline local dev without Supabase
      const { restoreApplication } = await import("@/lib/storage");
      const ok = await restoreApplication(inputId, adminIdentifier);
      if (!ok) {
        return NextResponse.json({ success: false, error: `Application "${inputId}" not found.` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: "Application restored successfully.",
      });
    }

    // Resolve UUID if reference_id or numeric ID was supplied
    let applicationId = inputId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(inputId);

    if (!isUuid) {
      const { data: foundRow, error: lookupErr } = await supabase
        .from("applications")
        .select("id, reference_id, deleted_at")
        .or(`reference_id.ilike.${inputId},id.eq.${inputId}`)
        .maybeSingle();

      if (lookupErr || !foundRow) {
        return NextResponse.json(
          { success: false, error: `Application "${inputId}" not found in database.` },
          { status: 404 }
        );
      }

      if (foundRow.deleted_at === null) {
        return NextResponse.json(
          { success: false, error: `Application "${foundRow.reference_id || inputId}" is already active (not in Trash).` },
          { status: 409 }
        );
      }

      applicationId = foundRow.id;
    }

    // Restore: reset deleted_at, deleted_by, and delete_reason to NULL where deleted_at IS NOT NULL
    const { data, error } = await supabase
      .from("applications")
      .update({
        deleted_at: null,
        deleted_by: null,
        delete_reason: null,
      })
      .eq("id", applicationId)
      .not("deleted_at", "is", null)
      .select("id, deleted_at, deleted_by, delete_reason")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Query to check if record exists or is already active
        const { data: checkApp } = await supabase
          .from("applications")
          .select("id, deleted_at")
          .eq("id", applicationId)
          .maybeSingle();

        if (!checkApp) {
          return NextResponse.json(
            { success: false, error: `Application "${inputId}" not found.` },
            { status: 404 }
          );
        }

        if (checkApp.deleted_at === null) {
          return NextResponse.json(
            { success: false, error: `Application "${inputId}" is already active (not in Trash).` },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { success: false, error: "Application could not be restored." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: `Database error restoring application from Trash: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || !data.id) {
      return NextResponse.json(
        { success: false, error: `Application "${inputId}" could not be restored from Trash.` },
        { status: 404 }
      );
    }

    await addAuditLog(
      "APPLICATION_RESTORED",
      `Application ${data.id} restored from Trash by ${adminIdentifier}.`
    );

    return NextResponse.json({
      success: true,
      data,
      message: "Application restored to Active pipeline successfully.",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
