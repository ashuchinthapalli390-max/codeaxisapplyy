export interface TeamMember {
  id: string;
  name: string;
  displayName?: string;
  codename?: string;
  designation: string;
  secondaryDesignation?: string;
  roleType: string; // "Founder" | "Co-Founder" | "CEO" | "CTO" | "COO" | "Core Team" | "Mentor" | "Lead Developer" | custom
  department?: string;
  tagline?: string;
  bio: string;
  shortBio?: string;
  fullBio?: string;
  professionalSummary?: string;
  quote?: string;
  photoUrl: string;
  profileStoragePath?: string;
  profileObjectPositionX?: number; // 0 to 100, default 50
  profileObjectPositionY?: number; // 0 to 100, default 50
  profileScale?: number; // 1.0 to 1.5, default 1
  backgroundAssetUrl?: string;
  backgroundType?: string;
  responsibilities?: string[];
  roles?: string[]; // Alias/compatibility with responsibilities
  skills: string[];
  email?: string;
  secondaryEmail?: string;
  whatsapp?: string;
  phone?: string;
  location?: string;
  preferredContact?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  portfolioUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  discordUsername?: string;
  otherLinks?: { label: string; url: string }[];
  showPhone?: boolean;
  showEmail?: boolean;
  showWhatsapp?: boolean;
  showSocials?: boolean;
  showContact: boolean;
  isFeatured: boolean;
  isVisible?: boolean;
  isArchived?: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
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

export interface InterviewData {
  id?: string;
  application_id?: number | string;
  reference_id: string;
  applicant_name: string;
  applicant_email: string;
  interview_round: string;
  interview_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  timezone: string; // "Asia/Kolkata"
  duration_minutes: number;
  platform: "Google Meet" | "Zoom" | "Microsoft Teams" | "Other";
  meeting_link: string;
  interviewer_name: string;
  instructions?: string;
  admin_notes?: string;
  status: "Scheduled" | "Rescheduled" | "Completed" | "Absent" | "Cancelled";
  invitation_sent: boolean;
  reminder_sent_24h?: boolean;
  reminder_sent_1h?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OfferData {
  id?: string;
  application_id?: number | string;
  reference_id: string;
  applicant_name: string;
  applicant_email: string;
  internship_role: string;
  department: string;
  batch_code: string;
  joining_date: string;
  duration: string;
  work_mode: "Remote" | "Hybrid" | "In-Office";
  work_location?: string;
  working_hours?: string;
  reporting_person?: string;
  stipend_status: string;
  acceptance_deadline: string;
  terms_and_conditions?: string;
  authorized_person: string;
  designation: string;
  token: string;
  status: "Offer Sent" | "Offer Viewed" | "Offer Accepted" | "Offer Declined" | "Offer Expired";
  decline_reason?: string;
  responded_at?: string;
  version: number;
  pdf_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteModule {
  id: string;
  module_number: number;
  module_code: string;
  title: string;
  subtitle?: string;
  description: string;
  week_label?: string;
  duration?: string;
  image_url: string;
  topics?: string[];
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
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
  actionType: string;
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
