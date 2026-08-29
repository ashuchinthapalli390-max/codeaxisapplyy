import { NextRequest, NextResponse } from "next/server";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import { getTeamMemberById, saveTeamMember, addAuditLog } from "@/lib/storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { randomBytes } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Verify Admin Session
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const sessionValidation = await validateSession(token);
    if (!sessionValidation.isValid) {
      return NextResponse.json({ success: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const member = await getTeamMemberById(id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const posX = formData.get("positionX") ? Number(formData.get("positionX")) : undefined;
    const posY = formData.get("positionY") ? Number(formData.get("positionY")) : undefined;
    const scale = formData.get("scale") ? Number(formData.get("scale")) : undefined;

    if (!file) {
      // Just updating position/scale without replacing file
      if (posX != null || posY != null || scale != null) {
        member.profileObjectPositionX = posX ?? member.profileObjectPositionX ?? 50;
        member.profileObjectPositionY = posY ?? member.profileObjectPositionY ?? 50;
        member.profileScale = scale ?? member.profileScale ?? 1;
        await saveTeamMember(member);
        return NextResponse.json({ success: true, member });
      }
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP, AVIF.",
        },
        { status: 400 }
      );
    }

    // 3. Validate size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Image is too large. Maximum size is 8 MB.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = "webp";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/jpeg") ext = "jpg";
    else if (file.type === "image/avif") ext = "avif";

    const safeFilename = `profile-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
    const storagePath = `leadership/${id}/${safeFilename}`;
    let finalUrl = "";
    let uploadedToSupabase = false;

    // 4. Try Supabase Storage
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Ensure bucket exists or attempt upload
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("leadership")
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage.from("leadership").getPublicUrl(storagePath);
          if (publicUrlData?.publicUrl) {
            finalUrl = publicUrlData.publicUrl;
            uploadedToSupabase = true;
          }
        } else if (uploadError) {
          console.warn("[Supabase Storage Upload Warning]:", uploadError.message);
        }
      }
    } catch (supabaseErr) {
      console.warn("[Supabase Storage Upload Exception]:", supabaseErr);
    }

    // 5. Fallback to Local Public Directory if Supabase Storage is not active
    if (!uploadedToSupabase || !finalUrl) {
      try {
        const uploadDir = join(process.cwd(), "public", "uploads", "leadership", id);
        await mkdir(uploadDir, { recursive: true });
        const filePath = join(uploadDir, safeFilename);
        await writeFile(filePath, buffer);
        finalUrl = `/uploads/leadership/${id}/${safeFilename}`;
      } catch (localErr) {
        console.warn("[Local File Write Warning]:", localErr);
        // Fallback to data URI
        finalUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    }

    // 6. Clean up old Supabase storage object if replaced successfully
    const oldStoragePath = member.profileStoragePath;
    if (uploadedToSupabase && oldStoragePath && oldStoragePath !== storagePath) {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          await supabase.storage.from("leadership").remove([oldStoragePath]);
        }
      } catch {
        // Non-blocking cleanup failure
      }
    }

    // 7. Update Team Member Record
    member.photoUrl = finalUrl;
    member.profileStoragePath = storagePath;
    if (posX != null) member.profileObjectPositionX = posX;
    if (posY != null) member.profileObjectPositionY = posY;
    if (scale != null) member.profileScale = scale;

    await saveTeamMember(member);
    await addAuditLog(
      "PROFILE_PHOTO_UPDATED" as any,
      `Updated profile photo for ${member.name} (${member.designation})`
    );

    return NextResponse.json({
      success: true,
      url: finalUrl,
      storagePath,
      member,
    });
  } catch (err) {
    console.error("Team photo upload error:", err);
    return NextResponse.json({ success: false, error: "Internal server error during image upload." }, { status: 500 });
  }
}
