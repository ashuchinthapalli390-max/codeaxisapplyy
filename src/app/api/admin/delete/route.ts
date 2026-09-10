import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { permanentDeleteApplication, addAuditLog } from "@/lib/storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

    // Standard Protected Soft Delete
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // Memory fallback strictly for offline development without Supabase configured
      const { deleteApplication } = await import("@/lib/storage");
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
    }

    // Resolve application UUID if caller passed a reference_id or numeric ID
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

      if (foundRow.deleted_at !== null) {
        return NextResponse.json(
          { success: false, error: `Application "${foundRow.reference_id || inputId}" is already in Trash.` },
          { status: 409 }
        );
      }

      applicationId = foundRow.id;
    }

    // Perform canonical soft-delete update required by architecture
    const { data, error } = await supabase
      .from("applications")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: adminIdentifier,
        delete_reason: reason || null,
      })
      .eq("id", applicationId)
      .is("deleted_at", null)
      .select("id, deleted_at, deleted_by, delete_reason")
      .single();

    if (error) {
      // Handle 0 rows updated or conflict
      if (error.code === "PGRST116") {
        // Query to distinguish 404 (doesn't exist) from 409 (already deleted)
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

        if (checkApp.deleted_at !== null) {
          return NextResponse.json(
            { success: false, error: `Application "${inputId}" is already in Trash.` },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { success: false, error: "Application could not be updated." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: `Database error moving application to Trash: ${error.message}` },
        { status: 500 }
      );
    }

    // Return success ONLY when exactly one updated row is returned
    if (!data || !data.id) {
      return NextResponse.json(
        { success: false, error: `Application "${inputId}" not found or already in Trash.` },
        { status: 404 }
      );
    }

    await addAuditLog(
      "APPLICATION_DELETED",
      `Application ${data.id} moved to Trash by ${adminIdentifier}. Reason: ${reason || "None specified"}`
    );

    return NextResponse.json({
      success: true,
      data,
      message: "Application moved to Trash successfully.",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
