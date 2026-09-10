import {
  TeamMemberDbRow,
  PublicLeadershipDto,
  AdminLeadershipDto,
  LeadershipMutationInput,
  LeadershipStatus,
  PublicContributionDto,
  AdminContributionDto,
  TeamMemberContributionDbRow,
  isDeleteProtected,
} from "./schema";
import {
  findMatchingCanonicalProfile,
  INITIAL_VERIFIED_CONTRIBUTIONS,
} from "./canonical";

const MEMBER_VERSIONS = new Map<string, number>();

export function getMemberVersion(row: any): number {
  if (typeof row?.version === "number" && !isNaN(row.version) && row.version > 0) {
    return row.version;
  }
  const id = row?.id;
  if (id && MEMBER_VERSIONS.has(id)) {
    return MEMBER_VERSIONS.get(id)!;
  }
  if (row?.updated_at) {
    const ts = new Date(row.updated_at).getTime();
    if (!isNaN(ts) && ts > 0) {
      return ts;
    }
  }
  return 1;
}

export function setMemberVersion(id: string, version: number): void {
  if (id && typeof version === "number" && version > 0) {
    MEMBER_VERSIONS.set(id, version);
  }
}

/**
 * Resolves the displayable image URL from database storage path or fallback asset.
 * Replaces old placeholder /logo.jpeg with canonical photos or styled assets.
 */
export function resolveLeadershipImageUrl(
  row: Partial<TeamMemberDbRow>,
  canonical?: Partial<TeamMemberDbRow>
): string {
  if (row.image_path && row.image_path.trim()) {
    const path = row.image_path.trim();
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
      return path;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const bucket = row.image_bucket || "leadership";
    if (supabaseUrl) {
      const cleanUrl = supabaseUrl.replace(/\/+$/, "");
      return `${cleanUrl}/storage/v1/object/public/${bucket}/${path}`;
    }
    return `/storage/v1/object/public/${bucket}/${path}`;
  }

  if (row.photo_url && row.photo_url.trim() && row.photo_url.trim() !== "/logo.jpeg") {
    return row.photo_url.trim();
  }

  if (canonical?.photo_url && canonical.photo_url !== "/logo.jpeg") {
    return canonical.photo_url;
  }

  return "/assets/image-assests/hero.jpeg";
}

export function mapDbContributionToPublicDto(row: TeamMemberContributionDbRow | any): PublicContributionDto {
  return {
    id: String(row.id),
    contributionType: row.contribution_type || "project",
    title: row.title || "Contribution",
    summary: row.summary || "",
    projectName: row.project_name || undefined,
    projectUrl: row.project_url || undefined,
    repositoryUrl: row.repository_url || undefined,
    completedAt: row.completed_at || undefined,
  };
}

export function mapDbContributionToAdminDto(row: TeamMemberContributionDbRow | any): AdminContributionDto {
  return {
    id: String(row.id),
    team_member_id: String(row.team_member_id),
    contribution_type: row.contribution_type || "project",
    title: row.title || "Contribution",
    summary: row.summary || undefined,
    project_name: row.project_name || undefined,
    project_url: row.project_url || undefined,
    repository_url: row.repository_url || undefined,
    started_at: row.started_at || undefined,
    completed_at: row.completed_at || undefined,
    verification_status: row.verification_status || "draft",
    is_public: row.is_public !== false,
    display_order: Number(row.display_order || 0),
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Maps a canonical Supabase database row to a public-safe DTO.
 * Seamlessly overlays verified baseline values when existing database row contains
 * null/placeholder designations, empty responsibilities, quotes, or missing photos.
 */
export function mapDbRowToPublicDto(
  row: TeamMemberDbRow | any,
  contributions: (TeamMemberContributionDbRow | any)[] = []
): PublicLeadershipDto {
  const canonical = findMatchingCanonicalProfile(row);
  const photoUrl = resolveLeadershipImageUrl(row, canonical);

  const cropX = Number(row.image_crop_x ?? row.crop_x ?? canonical?.crop_x ?? 50);
  const cropY = Number(row.image_crop_y ?? row.crop_y ?? canonical?.crop_y ?? 50);
  const cropScale = Number(row.image_zoom ?? row.crop_scale ?? canonical?.crop_scale ?? 1);
  const sortOrder = Number(row.sort_order ?? canonical?.sort_order ?? 0);

  const focusAreas =
    Array.isArray(row.focus_areas) && row.focus_areas.length > 0
      ? row.focus_areas
      : Array.isArray(row.skills) && row.skills.length > 0
      ? row.skills
      : (canonical?.focus_areas || []);

  const skills =
    Array.isArray(row.skills) && row.skills.length > 0
      ? row.skills
      : focusAreas;

  const responsibilities =
    Array.isArray(row.responsibilities) && row.responsibilities.length > 0
      ? row.responsibilities
      : Array.isArray(row.roles) && row.roles.length > 0
      ? row.roles
      : (canonical?.responsibilities || []);

  // Use DB contributions if present, else fallback to initial verified contributions
  let rawContribs = contributions;
  if (rawContribs.length === 0 && canonical?.id) {
    rawContribs = INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === canonical.id);
  }

  const publicContribs = rawContribs
    .filter((c) => c.is_public !== false && (c.verification_status === "published" || !c.verification_status))
    .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
    .map(mapDbContributionToPublicDto);

  let primaryDesignation = row.primary_designation || row.designation;
  if (!primaryDesignation || primaryDesignation === "Core Team") {
    primaryDesignation = canonical?.primary_designation || "Core Team";
  }

  const secondaryDesignation = row.secondary_designation || canonical?.secondary_designation || "";
  const department = row.department || canonical?.department || "";
  const tagline = row.tagline || row.short_tagline || canonical?.tagline || canonical?.short_tagline || "";
  const shortBio = row.short_bio || row.bio || canonical?.short_bio || "";
  const fullBio = row.full_bio || canonical?.full_bio || shortBio;
  const leadershipSummary =
    row.leadership_summary ||
    row.full_bio ||
    row.short_bio ||
    row.bio ||
    canonical?.leadership_summary ||
    "";
  const quote = row.quote || canonical?.quote || "";
  const codename = row.code_name || row.codename || canonical?.code_name || "";
  const roleType = row.role_type || canonical?.role_type || "Core Team";

  return {
    id: row.id || canonical?.id || "member",
    slug: row.slug || canonical?.slug || row.id || "member",
    name: row.full_name || row.display_name || canonical?.full_name || "Team Member",
    displayName: row.display_name || row.full_name || canonical?.display_name || "Team Member",
    codename,
    roleType,
    designation: primaryDesignation,
    primaryDesignation,
    secondaryDesignation,
    department,
    tagline,
    bio: shortBio,
    shortBio,
    fullBio,
    leadershipSummary,
    quote,
    responsibilities,
    skills,
    focus_areas: focusAreas,
    educationSummary: row.education_summary || canonical?.education_summary || undefined,
    experienceSummary: row.experience_summary || canonical?.experience_summary || undefined,
    verificationStatus: row.verification_status || canonical?.verification_status || "published",
    contributions: publicContribs,
    photoUrl,
    image_path: row.image_path || canonical?.image_path || "",
    profileObjectPositionX: cropX,
    profileObjectPositionY: cropY,
    profileScale: cropScale,
    sort_order: sortOrder,
    displayOrder: sortOrder,
    isFeatured: row.is_featured !== false,
    status: "active",
    linkedinUrl: row.linkedin_url || canonical?.linkedin_url || undefined,
    githubUrl: row.github_url || canonical?.github_url || undefined,
    portfolioUrl: row.portfolio_url || canonical?.portfolio_url || undefined,
    websiteUrl: row.external_url || canonical?.external_url || undefined,
  };
}

/**
 * Maps a canonical Supabase database row to an editable Admin DTO.
 * Overlays verified baseline values for incomplete records.
 */
export function mapDbRowToAdminDto(
  row: TeamMemberDbRow | any,
  contributions: (TeamMemberContributionDbRow | any)[] = []
): AdminLeadershipDto {
  const canonical = findMatchingCanonicalProfile(row);
  const photoUrl = resolveLeadershipImageUrl(row, canonical);

  const cropX = Number(row.image_crop_x ?? row.crop_x ?? canonical?.crop_x ?? 50);
  const cropY = Number(row.image_crop_y ?? row.crop_y ?? canonical?.crop_y ?? 50);
  const cropScale = Number(row.image_zoom ?? row.crop_scale ?? canonical?.crop_scale ?? 1);
  const sortOrder = Number(row.sort_order ?? canonical?.sort_order ?? 0);

  const focusAreas =
    Array.isArray(row.focus_areas) && row.focus_areas.length > 0
      ? row.focus_areas
      : Array.isArray(row.skills) && row.skills.length > 0
      ? row.skills
      : (canonical?.focus_areas || []);

  const skills =
    Array.isArray(row.skills) && row.skills.length > 0
      ? row.skills
      : focusAreas;

  const responsibilities =
    Array.isArray(row.responsibilities) && row.responsibilities.length > 0
      ? row.responsibilities
      : Array.isArray(row.roles) && row.roles.length > 0
      ? row.roles
      : (canonical?.responsibilities || []);

  let status: LeadershipStatus = "active";
  if (row.deleted_at || row.archived_at || row.is_archived || row.is_visible === false) {
    status = "archived";
  } else if (row.status) {
    status = row.status;
  } else if (row.is_active === false) {
    status = "hidden";
  }

  let rawContribs = contributions;
  if (rawContribs.length === 0 && canonical?.id) {
    rawContribs = INITIAL_VERIFIED_CONTRIBUTIONS.filter((c) => c.team_member_id === canonical.id);
  }

  const adminContribs = rawContribs
    .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
    .map(mapDbContributionToAdminDto);

  let primaryDesignation = row.primary_designation || row.designation;
  if (!primaryDesignation || primaryDesignation === "Core Team") {
    primaryDesignation = canonical?.primary_designation || "Core Team";
  }

  const secondaryDesignation = row.secondary_designation || canonical?.secondary_designation || "";
  const department = row.department || canonical?.department || "";
  const tagline = row.tagline || row.short_tagline || canonical?.tagline || canonical?.short_tagline || "";
  const shortBio = row.short_bio || row.bio || canonical?.short_bio || "";
  const fullBio = row.full_bio || canonical?.full_bio || shortBio;
  const leadershipSummary =
    row.leadership_summary ||
    row.full_bio ||
    row.short_bio ||
    row.bio ||
    canonical?.leadership_summary ||
    "";
  const quote = row.quote || canonical?.quote || "";
  const codename = row.code_name || row.codename || canonical?.code_name || "";
  const roleType = row.role_type || canonical?.role_type || "Core Team";

  return {
    id: row.id || canonical?.id || "member",
    slug: row.slug || canonical?.slug || row.id || "member",
    name: row.full_name || row.display_name || canonical?.full_name || "Team Member",
    fullName: row.full_name || row.display_name || canonical?.full_name || "Team Member",
    displayName: row.display_name || row.full_name || canonical?.display_name || "Team Member",
    codename,
    roleType,
    designation: primaryDesignation,
    primaryDesignation,
    secondaryDesignation,
    department,
    tagline,
    bio: shortBio,
    shortBio,
    fullBio,
    leadershipSummary,
    professionalSummary: leadershipSummary,
    educationSummary: row.education_summary || canonical?.education_summary || "",
    experienceSummary: row.experience_summary || canonical?.experience_summary || "",
    verificationStatus: row.verification_status || canonical?.verification_status || "published",
    profileCompleteness: Number(row.profile_completeness ?? 100),
    sourceNotes: row.source_notes || canonical?.source_notes || undefined,
    lastVerifiedAt: row.last_verified_at || undefined,
    isPublic: row.is_public !== false,
    quote,
    skills,
    focus_areas: focusAreas,
    responsibilities,
    roles: responsibilities,
    contributions: adminContribs,
    photoUrl,
    image_path: row.image_path || canonical?.image_path || "",
    profileStoragePath: row.image_path || canonical?.image_path || "",
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
    linkedinUrl: row.linkedin_url || canonical?.linkedin_url || "",
    githubUrl: row.github_url || canonical?.github_url || "",
    portfolioUrl: row.portfolio_url || "",
    websiteUrl: row.external_url || "",
    external_url: row.external_url || "",
    instagramUrl: undefined,
    youtubeUrl: undefined,
    twitterUrl: undefined,
    discordUsername: undefined,
    showPhone: false,
    showEmail: Boolean(row.email),
    showWhatsapp: Boolean(row.whatsapp || row.whatsapp_url),
    showSocials: true,
    showContact: false,
    sort_order: sortOrder,
    displayOrder: sortOrder,
    isFeatured: row.is_featured !== false,
    isVisible: row.is_visible !== false && status === "active",
    isArchived: status === "archived",
    status,
    canDelete: !isDeleteProtected(
      roleType,
      primaryDesignation,
      secondaryDesignation,
      row.is_delete_protected
    ),
    canEdit: true,
    canRestore: status === "archived" || row.is_visible === false,
    is_delete_protected: isDeleteProtected(
      roleType,
      primaryDesignation,
      secondaryDesignation,
      row.is_delete_protected
    ),
    version: getMemberVersion(row),
    deleted_at: row.deleted_at || row.archived_at || (status === "archived" ? (row.updated_at || new Date().toISOString()) : null),
    deleted_by: row.deleted_by || row.archived_by || null,
    delete_reason: row.delete_reason || null,
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
  const isProtected = isDeleteProtected(
    input.roleType,
    input.primaryDesignation || input.designation,
    input.secondaryDesignation,
    input.is_delete_protected
  );

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
    short_bio: input.shortBio || input.leadershipSummary || null,
    full_bio: input.fullBio || input.leadershipSummary || input.shortBio || null,
    quote: input.quote || null,
    responsibilities: input.responsibilities || input.roles || [],
    focus_areas: input.focus_areas || input.skills || [],
    skills: input.skills || input.focus_areas || [],
    education_summary: input.educationSummary || null,
    experience_summary: input.experienceSummary || null,
    verification_status: input.verificationStatus || "published",
    profile_completeness: input.profileCompleteness ?? 100,
    source_notes: input.sourceNotes || null,
    last_verified_at: input.lastVerifiedAt || now,
    is_public: input.isPublic !== false,
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
    is_delete_protected: isProtected,
    sort_order: sortOrder,
    is_featured: input.isFeatured !== false,
    updated_at: now,
  };
}
