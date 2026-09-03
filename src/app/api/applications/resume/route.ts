import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload." },
        { status: 400 }
      );
    }

    // 1. Validate File Size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 5 MB limit (file is ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    const mimeType = file.type || "application/octet-stream";
    const extension = file.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = extension === "pdf" || extension === "doc" || extension === "docx";

    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !isAllowedExt) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only PDF, DOC, and DOCX documents are accepted.",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate collision-resistant unique path
    const randomId = crypto.randomUUID();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `resumes/${Date.now()}_${randomId}_${cleanFileName}`;

    if (supabase) {
      // Ensure bucket exists
      const { data: bucket } = await supabase.storage.getBucket("resumes");
      if (!bucket) {
        await supabase.storage.createBucket("resumes", {
          public: false,
          fileSizeLimit: MAX_FILE_SIZE,
        });
      }

      // Upload to private resumes bucket
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error("[Resume Storage Upload Error]:", uploadError);
        return NextResponse.json(
          { success: false, error: `Failed to upload resume: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        storagePath,
        fileName: file.name,
        fileSize: file.size,
        fileType: extension?.toUpperCase() || "PDF",
      },
    });
  } catch (err: any) {
    console.error("[Resume Upload Exception]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process resume upload." },
      { status: 500 }
    );
  }
}
