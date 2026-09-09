/**
 * Canonical Leadership CMS Schema & Types
 * Provides unified typing for Supabase team_members table, Public DTO, Admin DTO, and validation.
 */

export type LeadershipStatus = "active" | "hidden" | "archived";

export interface TeamMemberDbRow {
  id: string;
  slug: string;
  full_name: string;
  display_name: string;
  code_name: string | null;
  role_type: string;
  primary_designation: string;
  secondary_designation: string | null;
  department: string | null;
  tagline: string | null;
  short_tagline: string | null;
  short_bio: string | null;
  full_bio: string | null;
  quote: string | null;
  focus_areas: string[] | null;
  email: string | null;
  whatsapp: string | null;
  whatsapp_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  external_url: string | null;
  image_bucket: string | null;
  image_path: string | null;
  image_alt: string | null;
  photo_url?: string | null;
  crop_x: number;
  crop_y: number;
  crop_scale: number;
  image_crop_x: number;
  image_crop_y: number;
  image_zoom: number;
  status: LeadershipStatus;
  sort_order: number;
  is_featured: boolean;
  is_active?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  archived_by: string | null;
}

export interface PublicLeadershipDto {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  codename: string;
  roleType: string;
  designation: string;
  primaryDesignation: string;
  secondaryDesignation: string;
  department: string;
  tagline: string;
  bio: string;
  shortBio: string;
  fullBio: string;
  quote: string;
  skills: string[];
  focus_areas: string[];
  photoUrl: string;
  image_path: string;
  profileObjectPositionX: number;
  profileObjectPositionY: number;
  profileScale: number;
  sort_order: number;
  displayOrder: number;
  isFeatured: boolean;
  status: "active";
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
}

export interface AdminLeadershipDto {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  displayName: string;
  codename: string;
  roleType: string;
  designation: string;
  primaryDesignation: string;
  secondaryDesignation: string;
  department: string;
  tagline: string;
  bio: string;
  shortBio: string;
  fullBio: string;
  professionalSummary?: string;
  quote: string;
  skills: string[];
  focus_areas: string[];
  responsibilities: string[];
  roles: string[];
  photoUrl: string;
  image_path: string;
  profileStoragePath?: string;
  profileObjectPositionX: number;
  profileObjectPositionY: number;
  profileScale: number;
  crop_x: number;
  crop_y: number;
  crop_scale: number;
  email: string;
  phone: string;
  whatsapp: string;
  whatsapp_url: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  websiteUrl: string;
  external_url: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  discordUsername?: string;
  showPhone: boolean;
  showEmail: boolean;
  showWhatsapp: boolean;
  showSocials: boolean;
  showContact: boolean;
  sort_order: number;
  displayOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  isArchived: boolean;
  status: LeadershipStatus;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  archivedBy?: string | null;
}

export interface LeadershipMutationInput {
  id?: string;
  slug?: string;
  name: string;
  fullName?: string;
  displayName?: string;
  codename?: string;
  roleType?: string;
  designation: string;
  primaryDesignation?: string;
  secondaryDesignation?: string;
  department?: string;
  tagline?: string;
  shortBio?: string;
  fullBio?: string;
  quote?: string;
  skills?: string[];
  focus_areas?: string[];
  responsibilities?: string[];
  roles?: string[];
  photoUrl?: string;
  image_path?: string;
  profileStoragePath?: string;
  crop_x?: number;
  crop_y?: number;
  crop_scale?: number;
  profileObjectPositionX?: number;
  profileObjectPositionY?: number;
  profileScale?: number;
  email?: string;
  phone?: string;
  whatsapp?: string;
  whatsapp_url?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  websiteUrl?: string;
  external_url?: string;
  status?: LeadershipStatus;
  sort_order?: number;
  displayOrder?: number;
  isFeatured?: boolean;
  isVisible?: boolean;
  isArchived?: boolean;
  updatedAt?: string;
}

export function validateLeadershipInput(raw: any): {
  valid: boolean;
  errors: Record<string, string>;
  sanitized?: LeadershipMutationInput;
} {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: { form: "Invalid request payload." } };
  }

  const name = String(raw.fullName || raw.name || "").trim();
  if (!name) {
    errors.name = "Full name is required.";
  } else if (name.length > 100) {
    errors.name = "Full name must be 100 characters or fewer.";
  }

  const designation = String(raw.primaryDesignation || raw.designation || "").trim();
  if (!designation) {
    errors.designation = "Primary designation is required.";
  } else if (designation.length > 120) {
    errors.designation = "Primary designation must be 120 characters or fewer.";
  }

  // Slug validation
  let slug = String(raw.slug || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug && name) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // URL validations
  const validateUrl = (url: string | undefined, fieldName: string) => {
    if (!url || !url.trim()) return;
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      errors[fieldName] = "Must be a valid URL starting with https:// or /";
    }
  };

  validateUrl(raw.linkedinUrl, "linkedinUrl");
  validateUrl(raw.githubUrl, "githubUrl");
  validateUrl(raw.portfolioUrl, "portfolioUrl");
  validateUrl(raw.websiteUrl || raw.external_url, "external_url");

  // Crop ranges (0-100)
  const cropX = Number(raw.crop_x ?? raw.profileObjectPositionX ?? 50);
  const cropY = Number(raw.crop_y ?? raw.profileObjectPositionY ?? 50);
  const cropScale = Number(raw.crop_scale ?? raw.profileScale ?? 1);

  const sanitizedCropX = Math.min(100, Math.max(0, isNaN(cropX) ? 50 : cropX));
  const sanitizedCropY = Math.min(100, Math.max(0, isNaN(cropY) ? 50 : cropY));
  const sanitizedCropScale = Math.min(3, Math.max(0.5, isNaN(cropScale) ? 1 : cropScale));

  // Status
  let status: LeadershipStatus = "active";
  if (raw.status === "hidden" || raw.status === "archived") {
    status = raw.status;
  } else if (raw.isArchived === true) {
    status = "archived";
  } else if (raw.isVisible === false) {
    status = "hidden";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const focusAreas = Array.isArray(raw.focus_areas)
    ? raw.focus_areas.map((s: any) => String(s).trim()).filter(Boolean)
    : Array.isArray(raw.skills)
    ? raw.skills.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  const responsibilities = Array.isArray(raw.responsibilities)
    ? raw.responsibilities.map((s: any) => String(s).trim()).filter(Boolean)
    : Array.isArray(raw.roles)
    ? raw.roles.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  return {
    valid: true,
    errors: {},
    sanitized: {
      id: raw.id ? String(raw.id).trim() : undefined,
      slug,
      name,
      fullName: name,
      displayName: String(raw.displayName || name).trim(),
      codename: String(raw.codename || raw.code_name || "").trim(),
      roleType: String(raw.roleType || "Core Team").trim(),
      designation,
      primaryDesignation: designation,
      secondaryDesignation: String(raw.secondaryDesignation || "").trim(),
      department: String(raw.department || "").trim(),
      tagline: String(raw.tagline || "").trim(),
      shortBio: String(raw.shortBio || raw.bio || "").trim(),
      fullBio: String(raw.fullBio || "").trim(),
      quote: String(raw.quote || "").trim(),
      skills: focusAreas,
      focus_areas: focusAreas,
      responsibilities,
      roles: responsibilities,
      photoUrl: String(raw.photoUrl || "").trim() || "/assets/image-assests/hero.jpeg",
      image_path: String(raw.image_path || raw.profileStoragePath || "").trim(),
      profileStoragePath: String(raw.profileStoragePath || raw.image_path || "").trim(),
      crop_x: sanitizedCropX,
      crop_y: sanitizedCropY,
      crop_scale: sanitizedCropScale,
      profileObjectPositionX: sanitizedCropX,
      profileObjectPositionY: sanitizedCropY,
      profileScale: sanitizedCropScale,
      email: String(raw.email || "").trim(),
      phone: String(raw.phone || "").trim(),
      whatsapp: String(raw.whatsapp || raw.whatsapp_url || "").trim(),
      whatsapp_url: String(raw.whatsapp_url || raw.whatsapp || "").trim(),
      linkedinUrl: String(raw.linkedinUrl || "").trim(),
      githubUrl: String(raw.githubUrl || "").trim(),
      portfolioUrl: String(raw.portfolioUrl || "").trim(),
      websiteUrl: String(raw.websiteUrl || raw.external_url || "").trim(),
      external_url: String(raw.external_url || raw.websiteUrl || "").trim(),
      status,
      sort_order: Number(raw.sort_order ?? raw.displayOrder ?? 0),
      displayOrder: Number(raw.displayOrder ?? raw.sort_order ?? 0),
      isFeatured: raw.isFeatured !== false,
      isVisible: status === "active",
      isArchived: status === "archived",
      updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    },
  };
}
