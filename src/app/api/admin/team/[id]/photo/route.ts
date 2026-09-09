import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { getTeamMemberById, saveTeamMember, addAuditLog } from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { randomBytes } from "node:crypto";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Verify Admin Session
    await requireAdmin(req);

    const member = await getTeamMemberById(id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const posX = formData.get("positionX") ? Number(formData.get("positionX")) : undefined;
    const posY = formData.get("positionY") ? Number(formData.get("positionY")) : undefined;
    const scale = formData.get("scale") ? Number(formData.get("scale")) : undefined;
    const resetCrop = formData.get("resetCrop") === "true";

    // Just resetting or updating crop position/scale without replacing file
    if (!file) {
      if (resetCrop) {
        member.profileObjectPositionX = 50;
        member.profileObjectPositionY = 50;
        member.profileScale = 1;
        member.crop_x = 50;
        member.crop_y = 50;
        member.crop_scale = 1;
        const saved = await saveTeamMember(member);
        return NextResponse.json({ success: true, member: saved, message: "Crop position reset to default." });
      }

      if (posX != null || posY != null || scale != null) {
        member.profileObjectPositionX = posX ?? member.profileObjectPositionX ?? 50;
        member.profileObjectPositionY = posY ?? member.profileObjectPositionY ?? 50;
        member.profileScale = scale ?? member.profileScale ?? 1;
        member.crop_x = member.profileObjectPositionX;
        member.crop_y = member.profileObjectPositionY;
        member.crop_scale = member.profileScale;
        const saved = await saveTeamMember(member);
        return NextResponse.json({ success: true, member: saved });
      }
      return NextResponse.json({ success: false, error: "No image file or crop parameters provided." }, { status: 400 });
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

    // 4. Supabase Storage must be configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase Storage is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize Supabase admin client.",
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let ext = "webp";
    if (file.type === "image/png") ext = "png";
    else if (file.type === "image/jpeg") ext = "jpg";
    else if (file.type === "image/avif") ext = "avif";

    const timestamp = Date.now();
    const safeFilename = `profile-${timestamp}-${randomBytes(6).toString("hex")}.${ext}`;
    const storagePath = `leadership/${id}/${safeFilename}`;

    console.log(`[Leadership Photo] Uploading to Supabase Storage: ${storagePath} (${buffer.length} bytes)`);

    // 5. Upload strictly to Supabase Storage bucket 'leadership'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("leadership")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error("[Supabase Storage Upload Error]:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to upload photo to Supabase Storage: ${uploadError?.message || "Unknown error"}`,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage.from("leadership").getPublicUrl(storagePath);
    if (!publicUrlData?.publicUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not retrieve public URL for uploaded photo from Supabase Storage.",
        },
        { status: 500 }
      );
    }

    // Cache-busting URL with timestamp
    const finalUrl = `${publicUrlData.publicUrl}?v=${timestamp}`;
    const oldStoragePath = member.profileStoragePath || member.image_path;

    // 6. Update Team Member Record in Supabase
    member.photoUrl = finalUrl;
    member.image_path = storagePath;
    member.profileStoragePath = storagePath;
    if (posX != null) {
      member.profileObjectPositionX = posX;
      member.crop_x = posX;
    }
    if (posY != null) {
      member.profileObjectPositionY = posY;
      member.crop_y = posY;
    }
    if (scale != null) {
      member.profileScale = scale;
      member.crop_scale = scale;
    }

    const savedMember = await saveTeamMember(member);

    // 7. Clean up old Supabase storage object ONLY AFTER successful database update
    if (oldStoragePath && oldStoragePath !== storagePath && oldStoragePath.startsWith("leadership/")) {
      try {
        await supabase.storage.from("leadership").remove([oldStoragePath]);
        console.log(`[Leadership Photo] Removed old photo from storage: ${oldStoragePath}`);
      } catch (cleanErr) {
        console.warn("[Leadership Photo Old Cleanup Warning]:", cleanErr);
      }
    }

    await addAuditLog(
      "PROFILE_PHOTO_UPDATED" as any,
      `Updated profile photo for ${member.name} (${member.designation})`
    );

    return NextResponse.json({
      success: true,
      url: finalUrl,
      storagePath,
      member: savedMember,
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await requireAdmin(req);

    const member = await getTeamMemberById(id);
    if (!member) {
      return NextResponse.json({ success: false, error: "Team member not found." }, { status: 404 });
    }

    const oldStoragePath = member.profileStoragePath || member.image_path;
    const defaultPlaceholder = "/assets/image-assests/hero.jpeg";

    member.photoUrl = defaultPlaceholder;
    member.image_path = "";
    member.profileStoragePath = "";
    member.profileObjectPositionX = 50;
    member.profileObjectPositionY = 50;
    member.profileScale = 1;
    member.crop_x = 50;
    member.crop_y = 50;
    member.crop_scale = 1;

    const savedMember = await saveTeamMember(member);

    // Clean up Supabase storage object
    if (oldStoragePath && oldStoragePath.startsWith("leadership/")) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          await supabase.storage.from("leadership").remove([oldStoragePath]);
        } catch (e) {
          console.warn("[Leadership Photo Remove Storage Warning]:", e);
        }
      }
    }

    await addAuditLog(
      "PROFILE_PHOTO_DELETED" as any,
      `Removed profile photo for ${member.name} (${member.designation})`
    );

    return NextResponse.json({
      success: true,
      message: "Profile photo removed.",
      member: savedMember,
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
