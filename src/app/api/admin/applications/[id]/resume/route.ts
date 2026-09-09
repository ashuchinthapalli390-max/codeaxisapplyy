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
    if (cleanPath.startsWith("application-resumes/")) {
      cleanPath = cleanPath.slice("application-resumes/".length);
    }

    const candidateBuckets = ["application-resumes", "resumes"];
    let finalSignedUrl: string | null = null;
    let lastError: any = null;

    for (const bucketName of candidateBuckets) {
      // 1. Try with bucket-relative path
      const { data: signed, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(cleanPath.startsWith("resumes/") ? cleanPath : `resumes/${cleanPath}`, 900);

      if (signed?.signedUrl && !error) {
        finalSignedUrl = signed.signedUrl;
        break;
      }

      // 2. Try direct path
      const { data: directSigned, error: directErr } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(cleanPath, 900);

      if (directSigned?.signedUrl && !directErr) {
        finalSignedUrl = directSigned.signedUrl;
        break;
      }
      lastError = error || directErr;
    }

    if (!finalSignedUrl) {
      return NextResponse.json(
        { success: false, error: `Failed to generate secure download URL: ${lastError?.message || "File not found in storage buckets."}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: finalSignedUrl,
      fileName: app.resume_file_name || "Resume.pdf",
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
