-- ==============================================================================
-- CODEXA APPLY V2 — AUTHORITATIVE CANONICAL PRODUCTION SCHEMA
-- Single Source of Truth for Internship Timing, Applications, Leadership,
-- Assets, Sessions, Interviews, Emails, Offers, and Security Audit Logs.
-- ==============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. INTERNSHIP ROUNDS (Application Timing & Dynamic State Engine)
CREATE TABLE IF NOT EXISTS public.internship_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'CodeXa Developer Internship 2026',
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  next_opens_at TIMESTAMPTZ NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status_override TEXT NOT NULL DEFAULT 'AUTO',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_internship_rounds_dates CHECK (closes_at > opens_at),
  CONSTRAINT chk_internship_rounds_next CHECK (next_opens_at IS NULL OR next_opens_at > opens_at),
  CONSTRAINT chk_internship_rounds_override CHECK (status_override IN ('AUTO', 'OPEN', 'CLOSED', 'PAUSED')),
  CONSTRAINT chk_internship_rounds_batch CHECK (batch_code != '' AND batch_code = UPPER(TRIM(batch_code)))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_internship_rounds_batch ON public.internship_rounds (batch_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_internship_rounds_single_active ON public.internship_rounds (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_internship_rounds_active ON public.internship_rounds (is_active);
CREATE INDEX IF NOT EXISTS idx_internship_rounds_dates ON public.internship_rounds (opens_at, closes_at);

DROP TRIGGER IF EXISTS trg_internship_rounds_updated_at ON public.internship_rounds;
CREATE TRIGGER trg_internship_rounds_updated_at
  BEFORE UPDATE ON public.internship_rounds
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. APPLICATIONS TABLE (Full 8-Round Dossier & Score Matrix)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,

  -- Round 1: Personal Profile
  full_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  preferred_name TEXT NULL,
  discord_username TEXT NULL,
  instagram_handle TEXT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'English',
  hobbies JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Round 2: Academic Verification
  college_name TEXT NOT NULL,
  university_name TEXT NOT NULL,
  degree TEXT NULL,
  course TEXT NOT NULL,
  branch TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  graduation_year TEXT NULL,
  expected_graduation TEXT NOT NULL,
  cgpa TEXT NULL,
  percentage TEXT NULL,
  cgpa_percentage TEXT NULL,
  certifications TEXT NULL,
  achievements TEXT NULL,
  backlogs TEXT NULL,

  -- Round 3: Developer Presence & Optional Resume
  coding_start_timeline TEXT NOT NULL,
  has_built_projects TEXT NOT NULL,
  hackathon_experience TEXT NOT NULL DEFAULT 'None',
  internship_experience TEXT NOT NULL DEFAULT 'None',
  freelancing_experience TEXT NOT NULL DEFAULT 'None',
  open_source_experience TEXT NOT NULL DEFAULT 'None',
  team_project_experience TEXT NOT NULL DEFAULT 'None',
  developer_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  projects JSONB NOT NULL DEFAULT '[]'::jsonb,
  github_profile TEXT NULL,
  linkedin_profile TEXT NULL,
  portfolio_website TEXT NULL,
  resume_storage_path TEXT NULL,
  resume_file_name TEXT NULL,
  resume_file_size INT NULL,
  resume_file_type TEXT NULL,

  -- Round 4: Availability & Hardware
  daily_availability TEXT NOT NULL,
  available_days JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_timing JSONB NOT NULL DEFAULT '[]'::jsonb,
  can_attend_meetings TEXT NOT NULL,
  can_meet_deadlines TEXT NOT NULL,
  can_communicate_if_unavailable TEXT NOT NULL,
  academic_constraints TEXT NULL,
  exam_periods TEXT NULL,
  laptop_status TEXT NOT NULL,
  operating_system TEXT NOT NULL,
  ram_capacity TEXT NOT NULL,
  internet_stability TEXT NOT NULL,
  can_run_dev_tools TEXT NOT NULL,
  processor TEXT NULL,
  gpu TEXT NULL,
  storage_type TEXT NULL,
  laptop_model TEXT NULL,
  webcam_available TEXT NOT NULL DEFAULT 'Yes',
  mic_available TEXT NOT NULL DEFAULT 'Yes',

  -- Round 5: Technical Awareness
  c_level TEXT NOT NULL DEFAULT 'I Don''t Know',
  c_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  python_level TEXT NOT NULL DEFAULT 'I Don''t Know',
  python_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  java_level TEXT NOT NULL DEFAULT 'I Don''t Know',
  java_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  html_level TEXT NOT NULL DEFAULT 'I Don''t Know',
  html_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  vibe_coding_level TEXT NOT NULL DEFAULT 'Never Used',
  vibe_coding_answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Round 6: Mindset Assessment
  mindset_answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Round 7: Thought-Process Interview Responses
  interview_q1_why_codexa TEXT NOT NULL,
  interview_q2_why_select TEXT NOT NULL,
  interview_q3_expectations TEXT NOT NULL,
  interview_q4_strongest_skills TEXT NOT NULL,
  interview_q5_weakest_area TEXT NOT NULL,
  interview_q6_describe_project TEXT NOT NULL,
  interview_q7_difficult_problem TEXT NOT NULL,
  interview_q8_ai_coding_usage TEXT NOT NULL,
  interview_q9_college_balance TEXT NOT NULL,
  interview_q10_future_goal TEXT NOT NULL,

  -- Round 8: Commitments & Declarations
  commitment_accurate_info BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_independent_work BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_responsible_communication BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_team_rules BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_confidentiality BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_assigned_duties BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_no_guaranteed_employment BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_accept_policies BOOLEAN NOT NULL DEFAULT TRUE,

  -- Integrity Signals
  copy_paste_warnings_count INT NOT NULL DEFAULT 0,
  tab_switch_count INT NOT NULL DEFAULT 0,

  -- 100-Point Scoring Matrix
  genuineness_integrity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  commitment_continuity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  mindset_habits_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  technical_knowledge_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  learning_potential_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  interview_communication_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  score_band TEXT NOT NULL DEFAULT 'Review',
  commitment_signal TEXT NOT NULL DEFAULT 'Moderate',
  skill_authenticity JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Administration & Status
  status TEXT NOT NULL DEFAULT 'Submitted',
  admin_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Soft Delete & Dummy Flagging
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  deleted_by TEXT NULL,
  deletion_reason TEXT NULL,
  is_test BOOLEAN NOT NULL DEFAULT false,

  -- Snapshot Backup
  raw_submission JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_ref ON public.applications (reference_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications (email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_deleted ON public.applications (is_deleted);
CREATE INDEX IF NOT EXISTS idx_applications_is_test ON public.applications (is_test);

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. APPLICATION STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_status_hist_app ON public.application_status_history (application_id);
CREATE INDEX IF NOT EXISTS idx_app_status_hist_ref ON public.application_status_history (reference_id);

-- 4. TEAM MEMBERS (Leadership CMS)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  codename TEXT NULL,
  short_bio TEXT NULL,
  photo_url TEXT NULL,
  photo_asset_id UUID NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_order ON public.team_members (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members (is_active);

DROP TRIGGER IF EXISTS trg_team_members_updated_at ON public.team_members;
CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. WEBSITE ASSETS METADATA
CREATE TABLE IF NOT EXISTS public.website_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_bucket TEXT NOT NULL DEFAULT 'website-assets',
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  alt_text TEXT NULL,
  mime_type TEXT NOT NULL,
  file_size INT NOT NULL,
  width INT NULL,
  height INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by TEXT DEFAULT 'Master Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_assets_category ON public.website_assets (category);
CREATE INDEX IF NOT EXISTS idx_website_assets_active ON public.website_assets (is_active);

DROP TRIGGER IF EXISTS trg_website_assets_updated_at ON public.website_assets;
CREATE TRIGGER trg_website_assets_updated_at
  BEFORE UPDATE ON public.website_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. ADMIN SESSIONS (Persistent & Revocable)
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  device_label TEXT,
  user_agent TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  remember_me BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_revoked ON public.admin_sessions (revoked_at);

-- 7. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  interview_round TEXT NOT NULL DEFAULT 'Technical & Mindset Review',
  interview_date DATE NOT NULL,
  start_time TIME NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  duration_minutes INT NOT NULL DEFAULT 30,
  platform TEXT NOT NULL DEFAULT 'Google Meet',
  meeting_link TEXT NOT NULL,
  interviewer_name TEXT NOT NULL DEFAULT 'Ashu Chinthapalli',
  applicant_instructions TEXT NULL,
  internal_notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  invitation_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_ref ON public.interviews (reference_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON public.interviews (interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews (status);

DROP TRIGGER IF EXISTS trg_interviews_updated_at ON public.interviews;
CREATE TRIGGER trg_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  provider_message_id TEXT NULL,
  idempotency_key TEXT UNIQUE NULL,
  status TEXT NOT NULL,
  error_message TEXT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_app ON public.email_logs (application_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_idempotency ON public.email_logs (idempotency_key);

-- 9. OFFER LETTERS TABLE
CREATE TABLE IF NOT EXISTS public.offer_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  internship_role TEXT NOT NULL DEFAULT 'Full-Stack Developer Intern',
  batch_code TEXT NOT NULL DEFAULT '2026-SEP',
  joining_date DATE NOT NULL,
  duration TEXT NOT NULL DEFAULT '12 Weeks',
  work_mode TEXT NOT NULL DEFAULT 'Remote',
  work_location TEXT DEFAULT 'Online / Remote',
  working_hours TEXT DEFAULT 'Flexible / 3-4 Hours Daily',
  reporting_person TEXT DEFAULT 'CodeXa Technical Leadership',
  stipend_status TEXT DEFAULT 'Performance-Based Stipend & Project Incentives',
  acceptance_deadline DATE NOT NULL,
  terms_and_conditions TEXT NULL,
  authorized_person TEXT DEFAULT 'CH. Arshad',
  designation TEXT DEFAULT 'Founder & Technical Director',
  pdf_storage_path TEXT NULL,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Offer Sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_letters_ref ON public.offer_letters (reference_id);
CREATE INDEX IF NOT EXISTS idx_offer_letters_status ON public.offer_letters (status);

DROP TRIGGER IF EXISTS trg_offer_letters_updated_at ON public.offer_letters;
CREATE TRIGGER trg_offer_letters_updated_at
  BEFORE UPDATE ON public.offer_letters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. OFFER RESPONSES TABLE (Email-Driven Token Security)
CREATE TABLE IF NOT EXISTS public.offer_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offer_letters(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  action TEXT NOT NULL, -- 'ACCEPT' or 'REJECT'
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  decline_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_resp_token ON public.offer_responses (token_hash);
CREATE INDEX IF NOT EXISTS idx_offer_resp_offer ON public.offer_responses (offer_id);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  admin_user TEXT NOT NULL DEFAULT 'Master Admin',
  target_type TEXT NULL,
  target_id TEXT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

-- 12. SITE SETTINGS TABLE (Agency CMS)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_heading TEXT DEFAULT 'BUILD. LEARN. DEBUG. SHIP.',
  hero_subtitle TEXT DEFAULT 'DEVELOPER INTERNSHIP 2026',
  hero_description TEXT DEFAULT 'A practical developer recruitment experience and internship built for students and aspiring engineers who want to build real-world software, master AI-assisted workflows, and ship production applications.',
  agency_name TEXT DEFAULT 'CodeXa Agency',
  agency_url TEXT DEFAULT 'https://www.codxa-agency.online',
  agency_description TEXT DEFAULT 'Building Technology. Building Developers. We build full-stack web platforms, AI solutions, developer tools, and automation systems.',
  whatsapp_support_number TEXT DEFAULT '+91 88979 01413',
  founder_email TEXT DEFAULT 'ashuchinthapalli3900@gmail.com',
  raw_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Active September 2026 Round
INSERT INTO public.internship_rounds (
  batch_code,
  title,
  opens_at,
  closes_at,
  next_opens_at,
  timezone,
  status_override,
  is_active
) VALUES (
  '2026-SEP',
  'CodeXa Developer Internship 2026',
  '2026-09-01T09:00:00+05:30'::timestamptz,
  '2026-09-07T23:59:00+05:30'::timestamptz,
  '2026-09-15T09:00:00+05:30'::timestamptz,
  'Asia/Kolkata',
  'AUTO',
  true
)
ON CONFLICT (batch_code) DO UPDATE SET
  opens_at = EXCLUDED.opens_at,
  closes_at = EXCLUDED.closes_at,
  next_opens_at = EXCLUDED.next_opens_at,
  timezone = EXCLUDED.timezone,
  status_override = EXCLUDED.status_override,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Seed Canonical Leadership Team Members
-- CH. Arshad (Founder), B. Sanjay (Co-Founder), Kishore (CEO), G. Bhanu Prasad (CEO)
INSERT INTO public.team_members (id, name, role, codename, short_bio, photo_url, sort_order, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'CH. Arshad',
    'Founder & Technical Director',
    'SOUTH DEVELOPER',
    'Founder of CodeXa Agency. Focuses on full-stack architecture, AI agent systems, developer tooling, and engineering mentorship.',
    '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg',
    1,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'B. Sanjay',
    'Co-Founder & Platform Lead',
    'Spideyy !!',
    'Co-Founder of CodeXa Agency. Directs developer platform workflows, client integrations, team coordination, and student developer support.',
    '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg',
    2,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Kishore',
    'Chief Executive Officer',
    NULL,
    'CEO at CodeXa Agency. Drives organizational execution, strategic partnerships, operational scalability, and career acceleration for interns.',
    '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg',
    3,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'G. Bhanu Prasad',
    'Chief Executive Officer',
    'Hakai',
    'CEO at CodeXa Agency. Leads growth strategy, technology direction, talent recruitment pipelines, and industry collaboration.',
    '/assets/image-assests/4e56a0c0bb365775c6bf2e89d6e5a40e.jpg',
    4,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  codename = EXCLUDED.codename,
  short_bio = EXCLUDED.short_bio,
  photo_url = EXCLUDED.photo_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.internship_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read visible team members
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
CREATE POLICY "Public can view active team members"
  ON public.team_members FOR SELECT
  USING (is_active = true);

-- Public can read active website assets
DROP POLICY IF EXISTS "Public can view active website assets" ON public.website_assets;
CREATE POLICY "Public can view active website assets"
  ON public.website_assets FOR SELECT
  USING (is_active = true);

-- Server-side role (service_role) has unrestricted access through Data API
-- Note: Service role automatically bypasses RLS in Supabase.
-- Public anon cannot write to any table directly.
