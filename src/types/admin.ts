export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  roleType: "Founder" | "Co-Founder" | "CEO" | "Core Team" | "Mentor" | "Lead Developer" | "CTO" | "COO";
  photoUrl: string;
  bio: string;
  fullBio?: string;
  quote?: string;
  roles: string[];
  skills: string[];
  email?: string;
  whatsapp?: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  backgroundAsset?: string;
  showContact: boolean;
  isFeatured: boolean;
  isVisible?: boolean;
  displayOrder: number;
}

export type ApplicationWindowStatus = "AUTO" | "OPEN" | "OPENING_SOON" | "CLOSED";

export interface InternshipRound {
  id: string;
  title: string;
  batch_code: string;
  status: ApplicationWindowStatus;
  opens_at: string; // ISO 8601 timestamp with offset
  closes_at: string; // ISO 8601 timestamp with offset
  next_opens_at?: string | null;
  timezone: string; // e.g. "Asia/Kolkata"
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VoiceGuideSettings {
  enabled: boolean;
  title: string;
  teluguScript: string;
  provider: "google" | "elevenlabs" | "azure" | "browser";
  voiceName: string;
  speechSpeed: number; // 0.8 to 1.2, default 0.95
  scrollTriggerPx: number; // default 350
  showOncePerSession: boolean;
  showTranscript: boolean;
  defaultVolume: number; // 0.0 to 1.0
  lastRegeneratedAt?: string;
}

export interface WebsiteSettings {
  applicationStatus: ApplicationWindowStatus;
  batchCode?: string;
  openDate: string; // e.g. "2026-08-20"
  openTime?: string; // e.g. "09:00"
  closeDate: string; // e.g. "2026-09-07"
  closeTime?: string; // e.g. "23:59"
  nextOpenDate?: string; // e.g. "2026-09-15"
  nextOpenTime?: string; // e.g. "09:00"
  timezone?: string; // default "Asia/Kolkata"
  
  heroHeading: string;
  heroSubtitle: string;
  heroDescription: string;
  
  agencyName: string;
  agencyDescription: string;
  agencyUrl: string;

  whatsappSupportNumber: string;
  founderEmail: string;
  
  whatsappOnboardingLink: string;
  discordOnboardingLink: string;
  sessionDurationDays?: number; // e.g. 30

  voiceGuide?: VoiceGuideSettings;
}

export interface VoiceGuideCacheEntry {
  id: string;
  guide_key: string;
  content_hash: string;
  language: string;
  provider: string;
  voice_name: string;
  script_text: string;
  audio_base64: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "General" | "Eligibility" | "Technical" | "Selection" | "Commitment";
  displayOrder: number;
}

export interface QuestionBankItem {
  id: string;
  category: "C" | "Python" | "Java" | "HTML" | "Vibe Coding" | "Mindset";
  level: "Learner" | "Basic" | "Average" | "Expert";
  question: string;
  options: { key: string; text: string }[];
  correctKey: string;
  explanation?: string;
  scoreWeight: number;
  isActive: boolean;
}

export interface EmailTemplate {
  id: string;
  templateType: "ApplicationReceived" | "Shortlisted" | "Selected" | "Waitlisted" | "Rejected";
  subject: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaLink?: string;
  footerText?: string;
  includeOnboardingLinks?: boolean;
}

export interface EmailLog {
  id: string;
  referenceId: string;
  recipientEmail: string;
  recipientName: string;
  templateType: string;
  status: "Delivered" | "Failed" | "Pending";
  sentAt: string;
  error?: string;
}

export interface AdminAuditLog {
  id: string;
  actionType: "LOGIN" | "STATUS_UPDATE" | "NOTE_ADDED" | "DUPLICATE_FLAGGED" | "DELETE" | "RESTORE" | "EXPORT" | "SETTINGS_UPDATE" | "TEAM_UPDATE" | "EMAIL_SENT" | "SESSION_REVOKED" | "ASSET_UPDATE" | "VOICE_GUIDE_UPDATE";
  adminUser: string;
  targetId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminSession {
  id: string;
  token: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  isCurrent?: boolean;
}

export interface SiteAsset {
  id: string;
  assetKey: string;
  name: string;
  assetUrl: string;
  assetType: "image" | "gif" | "video" | "svg";
  section: string;
  altText: string;
  isActive: boolean;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  category: "Hero" | "Background" | "Foreground" | "Agency" | "Coding" | "AI" | "Leadership" | "Internship" | "Application" | "Footer" | "Admin";
  url: string;
  fileType: "image" | "gif" | "video" | "svg";
  sizeBytes?: number;
  createdAt: string;
}
