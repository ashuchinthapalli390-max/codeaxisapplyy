/**
 * Canonical Leadership CMS Schema & Types
 * Provides unified typing for Supabase team_members table, Public DTO, Admin DTO, and validation.
 */

import { ContributionType, TeamMemberContribution } from "../../types/admin";

export type LeadershipStatus = "active" | "hidden" | "archived";
export type LeadershipVerificationStatus = "draft" | "needs_verification" | "verified" | "published";

export interface TeamMemberContributionDbRow {
  id: string;
  team_member_id: string;
  contribution_type: ContributionType;
  title: string;
  summary: string | null;
  project_name: string | null;
  project_url: string | null;
  repository_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  verification_status: LeadershipVerificationStatus;
  is_public: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

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
  leadership_summary: string | null;
  quote: string | null;
  responsibilities: string[] | null;
  focus_areas: string[] | null;
  skills: string[] | null;
  education_summary: string | null;
  experience_summary: string | null;
  verification_status: LeadershipVerificationStatus;
  profile_completeness: number;
  source_notes: string | null;
  last_verified_at: string | null;
  is_public: boolean;
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
  is_delete_protected?: boolean;
  version?: number;
  deleted_at?: string | null;
  deleted_by?: string | null;
  delete_reason?: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  archived_by: string | null;
}

export interface PublicContributionDto {
  id: string;
  contributionType: ContributionType;
  title: string;
  summary: string;
  projectName?: string;
  projectUrl?: string;
  repositoryUrl?: string;
  completedAt?: string;
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
  leadershipSummary: string;
  quote: string;
  responsibilities: string[];
  skills: string[];
  focus_areas: string[];
  educationSummary?: string;
  experienceSummary?: string;
  verificationStatus: LeadershipVerificationStatus;
  contributions: PublicContributionDto[];
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

export interface AdminContributionDto {
  id: string;
  team_member_id: string;
  contribution_type: ContributionType;
  title: string;
  summary?: string;
  project_name?: string;
  project_url?: string;
  repository_url?: string;
  started_at?: string;
  completed_at?: string;
  verification_status: LeadershipVerificationStatus;
  is_public: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
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
  leadershipSummary: string;
  professionalSummary?: string;
  educationSummary: string;
  experienceSummary: string;
  verificationStatus: LeadershipVerificationStatus;
  profileCompleteness: number;
  sourceNotes?: string;
  lastVerifiedAt?: string;
  isPublic: boolean;
  quote: string;
  skills: string[];
  focus_areas: string[];
  responsibilities: string[];
  roles: string[];
  contributions: AdminContributionDto[];
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
  canDelete: boolean;
  canEdit?: boolean;
  canRestore?: boolean;
  is_delete_protected?: boolean;
  version?: number;
  deleted_at?: string | null;
  deleted_by?: string | null;
  delete_reason?: string | null;
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
  leadershipSummary?: string;
  quote?: string;
  skills?: string[];
  focus_areas?: string[];
  responsibilities?: string[];
  roles?: string[];
  educationSummary?: string;
  experienceSummary?: string;
  verificationStatus?: LeadershipVerificationStatus;
  profileCompleteness?: number;
  sourceNotes?: string;
  lastVerifiedAt?: string;
  isPublic?: boolean;
  contributions?: AdminContributionDto[];
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
  is_delete_protected?: boolean;
  version?: number;
  expectedVersion?: number;
  updatedAt?: string;
}

/**
 * Shared server-side canonical role normalization helper
 */
export function normalizeRole(text?: string | null): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[–—_]/g, "-")
    .replace(/[^\w\s&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Enforces role deletion protection policy:
 * - Founder => protected
 * - Co-Founder => protected
 * - CEO => protected
 *
 * Deletable roles:
 * - CTO, HR, COO, CFO, CMO, Developer, Designer, Operations, Intern, Advisor, Recruiter, etc.
 */
export function isDeleteProtected(
  roleType?: string | null,
  primaryDesignation?: string | null,
  secondaryDesignation?: string | null,
  isExplicitlyProtected?: boolean | null
): boolean {
  if (isExplicitlyProtected === true) return true;

  const tokens = [
    normalizeRole(roleType),
    normalizeRole(primaryDesignation),
    normalizeRole(secondaryDesignation),
  ].filter(Boolean);

  for (const t of tokens) {
    // Exact checks and tokenized checks
    if (
      t === "founder" ||
      t.startsWith("founder ") ||
      t.endsWith(" founder") ||
      t.includes("founder &") ||
      t.includes("& founder") ||
      t === "co-founder" ||
      t === "cofounder" ||
      t.startsWith("co-founder") ||
      t.startsWith("cofounder") ||
      t.includes("co-founder &") ||
      t.includes("& co-founder") ||
      t === "ceo" ||
      t.startsWith("ceo ") ||
      t.endsWith(" ceo") ||
      t.includes("ceo ") ||
      t.includes("chief executive officer") ||
      t === "chief executive"
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates profile completeness percentage (0 - 100) based on verified required fields
 */
export function calculateProfileCompleteness(input: Partial<LeadershipMutationInput>): number {
  let score = 0;
  if (input.name || input.fullName) score += 10;
  if (input.primaryDesignation || input.designation) score += 15;
  if (input.roleType) score += 5;
  if (input.department) score += 5;
  if (input.shortBio && input.shortBio.length >= 20) score += 15;
  if (input.fullBio && input.fullBio.length >= 40) score += 10;
  if (input.leadershipSummary && input.leadershipSummary.length >= 20) score += 10;

  const resps = input.responsibilities || input.roles || [];
  if (resps.length >= 3) score += 10;
  else if (resps.length >= 1) score += 5;

  const focus = input.focus_areas || input.skills || [];
  if (focus.length >= 3) score += 10;
  else if (focus.length >= 1) score += 5;

  if (input.quote && input.quote.length >= 10) score += 5;
  if (input.linkedinUrl || input.githubUrl || input.portfolioUrl || input.websiteUrl) score += 5;

  return Math.min(100, score);
}

function stripUnsafeHtml(str: string): string {
  return str.replace(/<[^>]*>?/gm, "").trim();
}

export function validateLeadershipInput(raw: any): {
  valid: boolean;
  errors: Record<string, string>;
  warnings?: string[];
  sanitized?: LeadershipMutationInput;
} {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: { form: "Invalid request payload." } };
  }

  const name = stripUnsafeHtml(String(raw.fullName || raw.name || ""));
  if (!name) {
    errors.name = "Full name is required.";
  } else if (name.length > 100) {
    errors.name = "Full name must be 100 characters or fewer.";
  }

  const designation = stripUnsafeHtml(String(raw.primaryDesignation || raw.designation || ""));
  if (!designation) {
    errors.designation = "Primary designation is required.";
  } else if (designation.length > 120) {
    errors.designation = "Primary designation must be 120 characters or fewer.";
  }

  const shortBio = stripUnsafeHtml(String(raw.shortBio || raw.bio || ""));
  if (shortBio.length > 400) {
    errors.shortBio = "Short bio must be 400 characters or fewer.";
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
      errors[fieldName] = "Must be a valid URL starting with https://, http://, or /";
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

  // Status & Verification Status
  let status: LeadershipStatus = "active";
  if (raw.status === "hidden" || raw.status === "archived") {
    status = raw.status;
  } else if (raw.isArchived === true) {
    status = "archived";
  } else if (raw.isVisible === false) {
    status = "hidden";
  }

  let verificationStatus: LeadershipVerificationStatus = "draft";
  const rawVerif = String(raw.verificationStatus || raw.verification_status || "").toLowerCase().trim();
  if (rawVerif === "draft" || rawVerif === "needs_verification" || rawVerif === "verified" || rawVerif === "published") {
    verificationStatus = rawVerif as LeadershipVerificationStatus;
  } else if (raw.isPublishing) {
    verificationStatus = "published";
  }

  const focusAreas = Array.isArray(raw.focus_areas)
    ? raw.focus_areas.map((s: any) => stripUnsafeHtml(String(s))).filter(Boolean)
    : Array.isArray(raw.skills)
    ? raw.skills.map((s: any) => stripUnsafeHtml(String(s))).filter(Boolean)
    : [];

  const responsibilities = Array.isArray(raw.responsibilities)
    ? raw.responsibilities.map((s: any) => stripUnsafeHtml(String(s))).filter(Boolean)
    : Array.isArray(raw.roles)
    ? raw.roles.map((s: any) => stripUnsafeHtml(String(s))).filter(Boolean)
    : [];

  const skills = Array.isArray(raw.skills)
    ? raw.skills.map((s: any) => stripUnsafeHtml(String(s))).filter(Boolean)
    : focusAreas;

  // Publishing strict checks
  if ((raw.isPublishing === true || rawVerif === "published") && status === "active") {
    if (focusAreas.length < 3) {
      errors.focus_areas = "At least three focus areas are required to publish a leadership profile.";
    }
    if (responsibilities.length === 0) {
      errors.responsibilities = "Responsibilities must not be empty for published leadership.";
    }
  }

  // Parse contributions if present
  const contributions: AdminContributionDto[] = [];
  if (Array.isArray(raw.contributions)) {
    for (const c of raw.contributions) {
      if (!c || typeof c !== "object") continue;
      const title = stripUnsafeHtml(String(c.title || ""));
      if (!title) continue;

      let cVerif: LeadershipVerificationStatus = "draft";
      const rawCVerif = String(c.verification_status || c.verificationStatus || "").toLowerCase();
      if (rawCVerif === "published" || rawCVerif === "verified" || rawCVerif === "needs_verification" || rawCVerif === "draft") {
        cVerif = rawCVerif as LeadershipVerificationStatus;
      }

      if (cVerif !== "published") {
        warnings.push(`Contribution "${title}" is marked ${cVerif} and will remain hidden from the public website.`);
      }

      contributions.push({
        id: c.id ? String(c.id) : `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        team_member_id: String(raw.id || ""),
        contribution_type: c.contribution_type || c.contributionType || "project",
        title,
        summary: c.summary ? stripUnsafeHtml(String(c.summary)) : undefined,
        project_name: c.project_name || c.projectName ? stripUnsafeHtml(String(c.project_name || c.projectName)) : undefined,
        project_url: c.project_url || c.projectUrl ? String(c.project_url || c.projectUrl).trim() : undefined,
        repository_url: c.repository_url || c.repositoryUrl ? String(c.repository_url || c.repositoryUrl).trim() : undefined,
        started_at: c.started_at || c.startedAt ? String(c.started_at || c.startedAt).trim() : undefined,
        completed_at: c.completed_at || c.completedAt ? String(c.completed_at || c.completedAt).trim() : undefined,
        verification_status: cVerif,
        is_public: c.is_public !== false && c.isPublic !== false,
        display_order: Number(c.display_order ?? c.displayOrder ?? 0),
      });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors, warnings };
  }

  const completeness = calculateProfileCompleteness({
    name,
    designation,
    primaryDesignation: designation,
    roleType: String(raw.roleType || "Core Team").trim(),
    department: stripUnsafeHtml(String(raw.department || "")),
    shortBio,
    fullBio: stripUnsafeHtml(String(raw.fullBio || "")),
    leadershipSummary: stripUnsafeHtml(String(raw.leadershipSummary || raw.leadership_summary || "")),
    responsibilities,
    focus_areas: focusAreas,
    quote: stripUnsafeHtml(String(raw.quote || "")),
    linkedinUrl: String(raw.linkedinUrl || "").trim(),
    githubUrl: String(raw.githubUrl || "").trim(),
  });

  return {
    valid: true,
    errors: {},
    warnings,
    sanitized: {
      id: raw.id ? String(raw.id).trim() : undefined,
      slug,
      name,
      fullName: name,
      displayName: stripUnsafeHtml(String(raw.displayName || name)),
      codename: stripUnsafeHtml(String(raw.codename || raw.code_name || "")),
      roleType: stripUnsafeHtml(String(raw.roleType || "Core Team")),
      designation,
      primaryDesignation: designation,
      secondaryDesignation: stripUnsafeHtml(String(raw.secondaryDesignation || raw.secondary_designation || "")),
      department: stripUnsafeHtml(String(raw.department || "")),
      tagline: stripUnsafeHtml(String(raw.tagline || raw.shortTagline || raw.short_tagline || "")),
      shortBio,
      fullBio: stripUnsafeHtml(String(raw.fullBio || "")),
      leadershipSummary: stripUnsafeHtml(String(raw.leadershipSummary || raw.leadership_summary || "")),
      quote: stripUnsafeHtml(String(raw.quote || "")),
      skills,
      focus_areas: focusAreas,
      responsibilities,
      roles: responsibilities,
      educationSummary: stripUnsafeHtml(String(raw.educationSummary || raw.education_summary || "")),
      experienceSummary: stripUnsafeHtml(String(raw.experienceSummary || raw.experience_summary || "")),
      verificationStatus,
      profileCompleteness: completeness,
      sourceNotes: stripUnsafeHtml(String(raw.sourceNotes || raw.source_notes || "")),
      lastVerifiedAt: new Date().toISOString(),
      isPublic: raw.isPublic !== false && raw.is_public !== false,
      contributions,
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
