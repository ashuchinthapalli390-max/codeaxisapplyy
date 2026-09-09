import {
  TeamMemberDbRow,
  PublicLeadershipDto,
  AdminLeadershipDto,
  LeadershipMutationInput,
  LeadershipStatus,
} from "./schema";

/**
 * Resolves the displayable image URL from database storage path or fallback asset
 */
export function resolveLeadershipImageUrl(row: Partial<TeamMemberDbRow>): string {
  if (row.image_path && row.image_path.trim()) {
    const path = row.image_path.trim();
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
      return path;
    }
    // Form Supabase Storage URL if supabase project is known, or fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const bucket = row.image_bucket || "leadership";
    if (supabaseUrl) {
      const cleanUrl = supabaseUrl.replace(/\/+$/, "");
      return `${cleanUrl}/storage/v1/object/public/${bucket}/${path}`;
    }
    return `/storage/v1/object/public/${bucket}/${path}`;
  }

  if (row.photo_url && row.photo_url.trim()) {
    return row.photo_url.trim();
  }

  return "/assets/image-assests/hero.jpeg";
}

/**
 * Maps a canonical Supabase database row to a public-safe DTO
 */
export function mapDbRowToPublicDto(row: TeamMemberDbRow): PublicLeadershipDto {
  const photoUrl = resolveLeadershipImageUrl(row);
  const cropX = Number(row.image_crop_x ?? row.crop_x ?? 50);
  const cropY = Number(row.image_crop_y ?? row.crop_y ?? 50);
  const cropScale = Number(row.image_zoom ?? row.crop_scale ?? 1);
  const sortOrder = Number(row.sort_order ?? 0);

  const focusAreas = Array.isArray(row.focus_areas) ? row.focus_areas : [];

  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.full_name || row.display_name || "Team Member",
    displayName: row.display_name || row.full_name || "Team Member",
    codename: row.code_name || "",
    roleType: row.role_type || "Core Team",
    designation: row.primary_designation || "Core Team",
    primaryDesignation: row.primary_designation || "Core Team",
    secondaryDesignation: row.secondary_designation || "",
    department: row.department || "",
    tagline: row.tagline || row.short_tagline || "",
    bio: row.short_bio || "",
    shortBio: row.short_bio || "",
    fullBio: row.full_bio || "",
    quote: row.quote || "",
    skills: focusAreas,
    focus_areas: focusAreas,
    photoUrl,
    image_path: row.image_path || "",
    profileObjectPositionX: cropX,
    profileObjectPositionY: cropY,
    profileScale: cropScale,
    sort_order: sortOrder,
    displayOrder: sortOrder,
    isFeatured: row.is_featured !== false,
    status: "active",
    linkedinUrl: row.linkedin_url || undefined,
    githubUrl: row.github_url || undefined,
    portfolioUrl: row.portfolio_url || undefined,
    websiteUrl: row.external_url || undefined,
  };
}

/**
 * Maps a canonical Supabase database row to an editable Admin DTO
 */
export function mapDbRowToAdminDto(row: TeamMemberDbRow): AdminLeadershipDto {
  const photoUrl = resolveLeadershipImageUrl(row);
  const cropX = Number(row.image_crop_x ?? row.crop_x ?? 50);
  const cropY = Number(row.image_crop_y ?? row.crop_y ?? 50);
  const cropScale = Number(row.image_zoom ?? row.crop_scale ?? 1);
  const sortOrder = Number(row.sort_order ?? 0);
  const focusAreas = Array.isArray(row.focus_areas) ? row.focus_areas : [];

  let status: LeadershipStatus = "active";
  if (row.status) {
    status = row.status;
  } else if (row.is_archived || row.archived_at) {
    status = "archived";
  } else if (row.is_active === false) {
    status = "hidden";
  }

  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.full_name || row.display_name || "Team Member",
    fullName: row.full_name || row.display_name || "Team Member",
    displayName: row.display_name || row.full_name || "Team Member",
    codename: row.code_name || "",
    roleType: row.role_type || "Core Team",
    designation: row.primary_designation || "Core Team",
    primaryDesignation: row.primary_designation || "Core Team",
    secondaryDesignation: row.secondary_designation || "",
    department: row.department || "",
    tagline: row.tagline || row.short_tagline || "",
    bio: row.short_bio || "",
    shortBio: row.short_bio || "",
    fullBio: row.full_bio || "",
    quote: row.quote || "",
    skills: focusAreas,
    focus_areas: focusAreas,
    responsibilities: focusAreas,
    roles: focusAreas,
    photoUrl,
    image_path: row.image_path || "",
    profileStoragePath: row.image_path || "",
    profileObjectPositionX: cropX,
    profileObjectPositionY: cropY,
    profileScale: cropScale,
    crop_x: cropX,
    crop_y: cropY,
    crop_scale: cropScale,
    email: row.email || "",
    phone: "",
    whatsapp: row.whatsapp || row.whatsapp_url || "",
    whatsapp_url: row.whatsapp_url || row.whatsapp || "",
    linkedinUrl: row.linkedin_url || "",
    githubUrl: row.github_url || "",
    portfolioUrl: row.portfolio_url || "",
    websiteUrl: row.external_url || "",
    external_url: row.external_url || "",
    showPhone: false,
    showEmail: Boolean(row.email),
    showWhatsapp: Boolean(row.whatsapp || row.whatsapp_url),
    showSocials: true,
    showContact: false,
    sort_order: sortOrder,
    displayOrder: sortOrder,
    isFeatured: row.is_featured !== false,
    isVisible: status === "active",
    isArchived: status === "archived",
    status,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    archivedAt: row.archived_at,
    archivedBy: row.archived_by,
  };
}

/**
 * Maps validated mutation input to database row for Supabase insert / update
 */
export function mapMutationInputToDbRow(
  input: LeadershipMutationInput,
  id: string
): Partial<TeamMemberDbRow> {
  const now = new Date().toISOString();
  const cropX = input.crop_x ?? input.profileObjectPositionX ?? 50;
  const cropY = input.crop_y ?? input.profileObjectPositionY ?? 50;
  const cropScale = input.crop_scale ?? input.profileScale ?? 1;
  const sortOrder = input.sort_order ?? input.displayOrder ?? 0;

  const status: LeadershipStatus = input.status || (input.isArchived ? "archived" : (input.isVisible === false ? "hidden" : "active"));

  return {
    id,
    slug: input.slug,
    full_name: input.fullName || input.name,
    display_name: input.displayName || input.name,
    code_name: input.codename || null,
    role_type: input.roleType || "Core Team",
    primary_designation: input.primaryDesignation || input.designation,
    secondary_designation: input.secondaryDesignation || null,
    department: input.department || null,
    tagline: input.tagline || null,
    short_tagline: input.tagline || null,
    short_bio: input.shortBio || null,
    full_bio: input.fullBio || null,
    quote: input.quote || null,
    focus_areas: input.focus_areas || input.skills || [],
    email: input.email || null,
    whatsapp: input.whatsapp || input.whatsapp_url || null,
    whatsapp_url: input.whatsapp_url || input.whatsapp || null,
    linkedin_url: input.linkedinUrl || null,
    github_url: input.githubUrl || null,
    portfolio_url: input.portfolioUrl || null,
    external_url: input.external_url || input.websiteUrl || null,
    image_path: input.image_path || input.profileStoragePath || null,
    image_bucket: "leadership",
    photo_url: input.photoUrl || null,
    crop_x: cropX,
    crop_y: cropY,
    crop_scale: cropScale,
    image_crop_x: cropX,
    image_crop_y: cropY,
    image_zoom: cropScale,
    status,
    is_active: status === "active",
    is_archived: status === "archived",
    sort_order: sortOrder,
    is_featured: input.isFeatured !== false,
    updated_at: now,
  };
}
