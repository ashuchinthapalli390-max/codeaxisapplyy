-- =============================================================================
-- CODEXA APPLY — AUTHORITATIVE CANONICAL PRODUCTION SCHEMA
-- File: database/supabase_schema.sql
-- Synchronized with: supabase/migrations/20260909000000_canonical_production_stabilization.sql
-- =============================================================================

-- Extensions
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

-- -----------------------------------------------------------------------------
-- 1. REFERENCE ID SEQUENCE & ATOMIC GENERATOR
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.application_ref_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_reference_id(p_batch_code TEXT DEFAULT '2026-SEP')
RETURNS TEXT AS $$
DECLARE
  v_clean_batch TEXT;
  v_seq_val BIGINT;
  v_ref TEXT;
BEGIN
  v_clean_batch := UPPER(REGEXP_REPLACE(COALESCE(p_batch_code, '2026-SEP'), '[^A-Z0-9]', '', 'g'));
  IF v_clean_batch = '' THEN
    v_clean_batch := '2026SEP';
  END IF;
  v_seq_val := nextval('public.application_ref_seq');
  v_ref := 'CXA-' || v_clean_batch || '-' || LPAD(v_seq_val::TEXT, 6, '0');
  RETURN v_ref;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 2. INTERNSHIP ROUNDS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.internship_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INT NOT NULL DEFAULT 1,
  batch_code TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'CodeXa Developer Internship 2026',
  description TEXT NULL,
  opens_at TIMESTAMPTZ NOT NULL DEFAULT '2026-09-01 09:00:00+05:30',
  closes_at TIMESTAMPTZ NOT NULL DEFAULT '2026-09-20 23:59:59+05:30',
  next_opens_at TIMESTAMPTZ NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status_override TEXT NOT NULL DEFAULT 'AUTO',
  status TEXT NOT NULL DEFAULT 'AUTO',
  is_active BOOLEAN NOT NULL DEFAULT false,
  max_applications INT NULL,
  current_applications_count INT NOT NULL DEFAULT 0,
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

-- Seed Default Active Round if none exists
INSERT INTO public.internship_rounds (
  batch_code,
  title,
  opens_at,
  closes_at,
  next_opens_at,
  timezone,
  status_override,
  status,
  is_active
) VALUES (
  '2026-SEP',
  'CodeXa Developer Internship 2026',
  '2026-09-01 09:00:00+05:30'::timestamptz,
  '2026-09-25 23:59:59+05:30'::timestamptz,
  '2026-10-01 09:00:00+05:30'::timestamptz,
  'Asia/Kolkata',
  'AUTO',
  'AUTO',
  true
)
ON CONFLICT (batch_code) DO UPDATE SET
  title = EXCLUDED.title,
  opens_at = EXCLUDED.opens_at,
  closes_at = EXCLUDED.closes_at,
  next_opens_at = EXCLUDED.next_opens_at,
  timezone = EXCLUDED.timezone,
  status_override = EXCLUDED.status_override,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 3. APPLICATIONS TABLE (Canonical 8-Round Dossier & Score Matrix)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  reference_id TEXT NOT NULL,
  round_id UUID REFERENCES public.internship_rounds(id) ON DELETE SET NULL,

  -- Applicant Profile
  applicant_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  phone TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  whatsapp_number TEXT NULL,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'India',
  preferred_name TEXT NULL,
  discord_username TEXT NULL,
  instagram_handle TEXT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'English',
  hobbies JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Academic Information
  college_name TEXT NOT NULL DEFAULT '',
  university_name TEXT NOT NULL DEFAULT '',
  degree TEXT NULL,
  course TEXT NOT NULL DEFAULT '',
  branch TEXT NOT NULL DEFAULT '',
  academic_year TEXT NOT NULL DEFAULT '',
  semester TEXT NOT NULL DEFAULT '',
  roll_number TEXT NOT NULL DEFAULT '',
  graduation_year TEXT NULL,
  expected_graduation TEXT NOT NULL DEFAULT '',
  cgpa TEXT NULL,
  percentage TEXT NULL,
  cgpa_percentage TEXT NULL,
  certifications TEXT NULL,
  achievements TEXT NULL,
  backlogs TEXT NULL,

  -- Developer Presence & Portfolio
  coding_start_timeline TEXT NOT NULL DEFAULT '',
  has_built_projects TEXT NOT NULL DEFAULT '',
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

  -- Resume Metadata
  resume_path TEXT NULL,
  resume_storage_path TEXT NULL,
  resume_file_name TEXT NULL,
  resume_file_size INT NULL,
  resume_file_type TEXT NULL,

  -- Availability & Hardware
  daily_availability TEXT NOT NULL DEFAULT '',
  available_days JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_timing JSONB NOT NULL DEFAULT '[]'::jsonb,
  can_attend_meetings TEXT NOT NULL DEFAULT 'Yes',
  can_meet_deadlines TEXT NOT NULL DEFAULT 'Yes',
  can_communicate_if_unavailable TEXT NOT NULL DEFAULT 'Yes, always',
  academic_constraints TEXT NULL,
  exam_periods TEXT NULL,
  laptop_status TEXT NOT NULL DEFAULT '',
  operating_system TEXT NOT NULL DEFAULT '',
  ram_capacity TEXT NOT NULL DEFAULT '',
  internet_stability TEXT NOT NULL DEFAULT '',
  can_run_dev_tools TEXT NOT NULL DEFAULT 'Yes',
  processor TEXT NULL,
  gpu TEXT NULL,
  storage_type TEXT NULL,
  laptop_model TEXT NULL,
  webcam_available TEXT NOT NULL DEFAULT 'Yes',
  mic_available TEXT NOT NULL DEFAULT 'Yes',

  -- Technical Awareness & Answers
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

  -- Mindset Assessment
  mindset_answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Interview Essay Responses
  interview_q1_why_codexa TEXT NOT NULL DEFAULT '',
  interview_q2_why_select TEXT NOT NULL DEFAULT '',
  interview_q3_expectations TEXT NOT NULL DEFAULT '',
  interview_q4_strongest_skills TEXT NOT NULL DEFAULT '',
  interview_q5_weakest_area TEXT NOT NULL DEFAULT '',
  interview_q6_describe_project TEXT NOT NULL DEFAULT '',
  interview_q7_difficult_problem TEXT NOT NULL DEFAULT '',
  interview_q8_ai_coding_usage TEXT NOT NULL DEFAULT '',
  interview_q9_college_balance TEXT NOT NULL DEFAULT '',
  interview_q10_future_goal TEXT NOT NULL DEFAULT '',

  -- Commitments & Integrity
  commitment_accurate_info BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_independent_work BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_responsible_communication BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_team_rules BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_confidentiality BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_assigned_duties BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_no_guaranteed_employment BOOLEAN NOT NULL DEFAULT TRUE,
  commitment_accept_policies BOOLEAN NOT NULL DEFAULT TRUE,
  copy_paste_warnings_count INT NOT NULL DEFAULT 0,
  tab_switch_count INT NOT NULL DEFAULT 0,

  -- Scoring & Signals
  score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  genuineness_integrity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  commitment_continuity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  mindset_habits_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  technical_knowledge_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  learning_potential_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  interview_communication_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  score_band TEXT NOT NULL DEFAULT 'Review',
  commitment_signal TEXT NOT NULL DEFAULT 'Moderate',
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  skill_authenticity JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Complete Raw Answers Backup
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_submission JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Status & Administration
  status TEXT NOT NULL DEFAULT 'Submitted',
  confirmation_email_status TEXT NOT NULL DEFAULT 'pending',
  admin_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Soft Delete & Testing Isolation
  is_test BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  deleted_by TEXT NULL,
  delete_reason TEXT NULL,
  deletion_reason TEXT NULL,

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_token ON public.applications (submission_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_ref ON public.applications (reference_id);
CREATE INDEX IF NOT EXISTS idx_applications_email_norm ON public.applications (email_normalized);
CREATE INDEX IF NOT EXISTS idx_applications_round ON public.applications (round_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_deleted ON public.applications (is_deleted);
CREATE INDEX IF NOT EXISTS idx_applications_is_test ON public.applications (is_test);

-- One submission per email per round (excluding soft-deleted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_email_round
  ON public.applications (email_normalized, round_id)
  WHERE deleted_at IS NULL AND round_id IS NOT NULL;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. APPLICATION STATUS HISTORY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL,
  previous_status TEXT NULL,
  new_status TEXT NOT NULL,
  note TEXT NULL,
  changed_by TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_status_hist_app ON public.application_status_history (application_id);
CREATE INDEX IF NOT EXISTS idx_app_status_hist_ref ON public.application_status_history (reference_id);

-- -----------------------------------------------------------------------------
-- 5. CANONICAL TEAM MEMBERS (Leadership CMS)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  slug TEXT NULL,
  name TEXT NOT NULL,
  full_name TEXT NULL,
  display_name TEXT NULL,
  code_name TEXT NULL,
  codename TEXT NULL,
  role TEXT NOT NULL,
  primary_designation TEXT NULL,
  secondary_designation TEXT NULL,
  role_type TEXT NOT NULL DEFAULT 'Core Team',
  department TEXT NULL,
  tagline TEXT NULL,
  short_bio TEXT NULL,
  full_bio TEXT NULL,
  quote TEXT NULL,
  focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_bucket TEXT NOT NULL DEFAULT 'leadership',
  image_path TEXT NULL,
  image_alt TEXT NULL,
  photo_url TEXT NULL,
  photo_asset_id UUID NULL,
  crop_x NUMERIC NOT NULL DEFAULT 50,
  crop_y NUMERIC NOT NULL DEFAULT 50,
  crop_scale NUMERIC NOT NULL DEFAULT 1,
  image_crop_x NUMERIC NOT NULL DEFAULT 50,
  image_crop_y NUMERIC NOT NULL DEFAULT 50,
  image_zoom NUMERIC NOT NULL DEFAULT 1,
  email TEXT NULL,
  whatsapp TEXT NULL,
  whatsapp_url TEXT NULL,
  linkedin_url TEXT NULL,
  github_url TEXT NULL,
  portfolio_url TEXT NULL,
  external_url TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ NULL,
  archived_by TEXT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_slug ON public.team_members (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_order ON public.team_members (sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members (status);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON public.team_members (is_active, is_archived);

DROP TRIGGER IF EXISTS trg_team_members_updated_at ON public.team_members;
CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the 4 Canonical Leadership Profiles
INSERT INTO public.team_members (
  id, name, role, codename, short_bio, photo_url, sort_order, is_active, is_archived, details, updated_at
) VALUES
(
  'team-01',
  'CH. Arshad',
  'Founder & Technical Director',
  'SOUTH DEVELOPER',
  'Founder of CodeXa Agency and Creator of the Developer Recruitment Universe. Oversees architecture, full-stack systems, and core recruitment tracks.',
  '/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg',
  1,
  true,
  false,
  '{
    "displayName": "CH. Arshad",
    "designation": "Founder & Technical Director",
    "roleType": "Founder",
    "department": "Engineering Architecture & Core Platform",
    "tagline": "Building resilient production systems, high-velocity developer tools, and engineering leadership.",
    "codename": "SOUTH DEVELOPER",
    "bio": "Founder of CodeXa Agency. Directs full-stack architecture, AI engineering pipelines, and core engineering standards across the agency.",
    "shortBio": "Founder & Technical Director driving CodeXa Agency architecture, production systems, and developer mentorship.",
    "fullBio": "CH. Arshad (SOUTH DEVELOPER) is the Founder of CodeXa Agency. He oversees system architecture, Next.js full-stack pipelines, AI agent workflows, and core technical direction. He founded the CodeXa Developer Internship to build production-grade developers capable of shipping real-world software.",
    "professionalSummary": "Extensive background in scalable system architecture, full-stack web platforms, and engineering team leadership.",
    "quote": "Build with purpose, architect for resilience, and always ship production-grade code.",
    "photoUrl": "/assets/image-assests/128acbeb739b3eb8bc4d1d9ae15fcfb2.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 25,
    "profileScale": 1.05,
    "skills": ["Full-Stack Architecture", "Next.js", "TypeScript", "Vibe Coding", "Database Systems", "Developer Mentorship"],
    "responsibilities": ["System Architecture & Cloud Engineering", "Recruitment Standards & Curriculum", "Agency Strategy & Technical Direction"],
    "email": "ch.arshad.codexa@gmail.com",
    "phone": "+91 99890 00000",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 1
  }'::jsonb,
  NOW()
),
(
  'team-02',
  'B. Sanjay',
  'Co-Founder & Platform Lead',
  'Spideyy !!',
  'Co-Founder of CodeXa Agency. Directs developer platform workflows, candidate onboarding, and team coordination.',
  '/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg',
  2,
  true,
  false,
  '{
    "displayName": "B. Sanjay",
    "designation": "Co-Founder & Platform Lead",
    "roleType": "Co-Founder",
    "department": "Platform Operations & Coordination",
    "tagline": "Empowering engineering cohorts with modern tooling and ironclad team discipline.",
    "codename": "Spideyy !!",
    "bio": "Co-Founder of CodeXa Agency. Directs developer platform workflows, candidate onboarding, and team coordination.",
    "shortBio": "Co-Founder & Platform Lead directing candidate onboarding, developer workflows, and team operations.",
    "fullBio": "B. Sanjay (Spideyy !!) is the Co-Founder of CodeXa Agency. He focuses on platform operations, engineering workflows, code review pipelines, and developer team enablement across all cohorts.",
    "professionalSummary": "Specialist in platform operations, developer workflow optimization, and distributed team coordination.",
    "quote": "Great software is built by teams who care about every single line of code.",
    "photoUrl": "/assets/image-assests/2299fdd2a1d01339a71af61a2c7e9cac.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Platform Engineering", "Developer Operations", "Team Coordination", "CI/CD", "TypeScript"],
    "responsibilities": ["Platform Operations & Developer Tooling", "Cohort Onboarding & Progress Tracking", "Code Quality & Delivery Reviews"],
    "email": "boddukurisanjay@gmail.com",
    "phone": "7075920852",
    "whatsapp": "7075920852",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 2
  }'::jsonb,
  NOW()
),
(
  'team-03',
  'Kishore',
  'Chief Executive Officer',
  '',
  'Chief Executive Officer at CodeXa Agency. Directs executive operations, external enterprise collaborations, and strategic scaling.',
  '/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg',
  3,
  true,
  false,
  '{
    "displayName": "Kishore",
    "designation": "Chief Executive Officer",
    "roleType": "CEO",
    "department": "Executive Leadership & Strategy",
    "tagline": "Scaling modern digital agency solutions and cultivating developer excellence.",
    "codename": "",
    "bio": "Chief Executive Officer at CodeXa Agency. Directs executive operations, external enterprise collaborations, and strategic scaling.",
    "shortBio": "CEO overseeing agency growth, client delivery governance, and strategic developer partnerships.",
    "fullBio": "Kishore serves as Chief Executive Officer at CodeXa Agency. He oversees executive growth, corporate governance, client partnerships, and large-scale developer cohort placement.",
    "professionalSummary": "Executive leadership background in software delivery governance, operational excellence, and enterprise expansion.",
    "quote": "Discipline and consistent execution turn ambitious concepts into world-class digital products.",
    "photoUrl": "/assets/image-assests/ed14ea822462d93c926056fcfd9db4c5 (1).jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Executive Leadership", "Strategic Expansion", "Operations Governance", "Client Partnerships", "Product Strategy"],
    "responsibilities": ["Agency Operations & Corporate Governance", "Strategic Industry Partnerships", "Cohort Placement & Ecosystem Growth"],
    "email": "kishore.codexa@gmail.com",
    "phone": "+91 99000 00000",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 3
  }'::jsonb,
  NOW()
),
(
  'team-04',
  'G. Bhanu Prasad',
  'Chief Executive Officer',
  'Hakai',
  'Chief Executive Officer at CodeXa Agency. Spearheads enterprise technology strategy, developer operations, and product scaling.',
  '/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg',
  4,
  true,
  false,
  '{
    "displayName": "G. Bhanu Prasad",
    "designation": "Chief Executive Officer",
    "roleType": "CEO",
    "department": "Executive Technology & Engineering",
    "tagline": "Transforming engineering potential into high-velocity product execution.",
    "codename": "Hakai",
    "bio": "Chief Executive Officer at CodeXa Agency. Spearheads enterprise technology strategy, developer operations, and product scaling.",
    "shortBio": "CEO directing enterprise technology strategy, technical leadership, and engineering delivery.",
    "fullBio": "G. Bhanu Prasad (Hakai) is Chief Executive Officer at CodeXa Agency. He leads executive technical strategy, agency infrastructure, client product engineering, and developer talent development.",
    "professionalSummary": "Engineering leadership specialist in modern web technologies, AI agent workflows, and product scaling.",
    "quote": "Speed without quality is fragile; quality with speed is unbeatable.",
    "photoUrl": "/assets/image-assests/4e56a053e3ee0019b13c19c5b3f614fe.jpg",
    "profileObjectPositionX": 50,
    "profileObjectPositionY": 20,
    "profileScale": 1.0,
    "skills": ["Technology Strategy", "Full-Stack Development", "AI Integration", "Product Scaling", "Team Leadership"],
    "responsibilities": ["Executive Technical Direction", "Client Solution Engineering", "Engineering Talent Acceleration"],
    "email": "bhanugorantla18@gmail.com",
    "phone": "8135533212",
    "whatsapp": "8135533212",
    "location": "Hyderabad, Telangana, India",
    "preferredContact": "Email",
    "githubUrl": "https://github.com",
    "linkedinUrl": "https://linkedin.com",
    "showPhone": false,
    "showEmail": false,
    "showWhatsapp": false,
    "showSocials": true,
    "isFeatured": true,
    "isVisible": true,
    "isArchived": false,
    "displayOrder": 4
  }'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  codename = EXCLUDED.codename,
  short_bio = EXCLUDED.short_bio,
  photo_url = EXCLUDED.photo_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  is_archived = EXCLUDED.is_archived,
  details = EXCLUDED.details,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 6. ADMIN SESSIONS (Cryptographic Token Storage)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  device_label TEXT NULL,
  user_agent TEXT NULL,
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

-- -----------------------------------------------------------------------------
-- 7. INTERVIEWS TABLE
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 8. OFFERS TABLE (Official Appointments & Response Tokens)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
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
  token TEXT NULL UNIQUE,
  token_hash TEXT NULL UNIQUE,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Offer Sent',
  responded_at TIMESTAMPTZ NULL,
  decline_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_ref ON public.offers (reference_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers (status);
CREATE INDEX IF NOT EXISTS idx_offers_token ON public.offers (token);
CREATE INDEX IF NOT EXISTS idx_offers_token_hash ON public.offers (token_hash);

DROP TRIGGER IF EXISTS trg_offers_updated_at ON public.offers;
CREATE TRIGGER trg_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 9. OFFER RESPONSES (Scanner-Protected One-Time Decisions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offer_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  action TEXT NOT NULL, -- 'ACCEPT' or 'DECLINE'
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

-- -----------------------------------------------------------------------------
-- 10. EMAIL EVENTS TABLE (Resend Telemetry & Idempotency)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_events (
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

CREATE INDEX IF NOT EXISTS idx_email_events_app ON public.email_events (application_id);
CREATE INDEX IF NOT EXISTS idx_email_events_idempotency ON public.email_events (idempotency_key);

-- -----------------------------------------------------------------------------
-- 11. AUDIT LOGS TABLE
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 12. SITE SETTINGS & MODULES (Agency CMS)
-- -----------------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS public.site_modules (
  id TEXT PRIMARY KEY,
  module_number INT NOT NULL,
  module_code TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '2 Weeks',
  image_url TEXT NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES & GRANTS
-- -----------------------------------------------------------------------------
ALTER TABLE public.internship_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_modules ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Public can view active rounds" ON public.internship_rounds;
DROP POLICY IF EXISTS "Service role full access on rounds" ON public.internship_rounds;
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
DROP POLICY IF EXISTS "Service role full access on team_members" ON public.team_members;
DROP POLICY IF EXISTS "Public can view active site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Service role full access on site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view active site modules" ON public.site_modules;
DROP POLICY IF EXISTS "Service role full access on site_modules" ON public.site_modules;
DROP POLICY IF EXISTS "Service role full access on applications" ON public.applications;
DROP POLICY IF EXISTS "Service role full access on status_history" ON public.application_status_history;
DROP POLICY IF EXISTS "Service role full access on sessions" ON public.admin_sessions;
DROP POLICY IF EXISTS "Service role full access on interviews" ON public.interviews;
DROP POLICY IF EXISTS "Service role full access on offers" ON public.offers;
DROP POLICY IF EXISTS "Service role full access on offer_responses" ON public.offer_responses;
DROP POLICY IF EXISTS "Service role full access on email_events" ON public.email_events;
DROP POLICY IF EXISTS "Service role full access on audit_logs" ON public.audit_logs;

-- Public read-only policies
CREATE POLICY "Public can view active rounds"
  ON public.internship_rounds FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can view active team members"
  ON public.team_members FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND is_archived = false);

CREATE POLICY "Public can view active site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view active site modules"
  ON public.site_modules FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Service role full access policies
CREATE POLICY "Service role full access on rounds"
  ON public.internship_rounds FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on team_members"
  ON public.team_members FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on site_settings"
  ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on site_modules"
  ON public.site_modules FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on applications"
  ON public.applications FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on status_history"
  ON public.application_status_history FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on sessions"
  ON public.admin_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on interviews"
  ON public.interviews FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on offers"
  ON public.offers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on offer_responses"
  ON public.offer_responses FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on email_events"
  ON public.email_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on audit_logs"
  ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Least privilege grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.internship_rounds TO anon, authenticated;
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.site_modules TO anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
