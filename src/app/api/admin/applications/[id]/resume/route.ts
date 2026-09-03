import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { getApplicationByRef } from "@/lib/storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;

    const app = await getApplicationByRef(id);
    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found." }, { status: 404 });
    }

    const storagePath = (app as any).resume_storage_path || app.resume_url;
    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: "No resume was provided for this applicant." },
        { status: 404 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Storage service is not configured." },
        { status: 500 }
      );
    }

    // Clean storage path if it's already full url or bucket prefixed
    let cleanPath = storagePath;
    if (cleanPath.startsWith("resumes/")) {
      cleanPath = cleanPath.slice("resumes/".length);
    }

    // Generate short-lived signed URL (valid for 15 minutes)
    const { data: signed, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(cleanPath.startsWith("resumes/") ? cleanPath : `resumes/${cleanPath}`, 900);

    if (error || !signed?.signedUrl) {
      // Try direct path
      const { data: directSigned, error: directErr } = await supabase.storage
        .from("resumes")
        .createSignedUrl(cleanPath, 900);

      if (directErr || !directSigned?.signedUrl) {
        return NextResponse.json(
          { success: false, error: `Failed to generate secure URL: ${error?.message || directErr?.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        signedUrl: directSigned.signedUrl,
        fileName: app.resume_file_name || "Resume.pdf",
      });
    }

    return NextResponse.json({
      success: true,
      signedUrl: signed.signedUrl,
      fileName: app.resume_file_name || "Resume.pdf",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
