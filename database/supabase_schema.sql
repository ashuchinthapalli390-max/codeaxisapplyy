-- ============================================================
-- CODEXA APPLY V2 — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Single Source of Truth for Internship Timing, Applications,
-- Sessions, Telemetry, and AI Voice Guides
-- ============================================================

-- 1. INTERNSHIP ROUNDS (Single Source of Truth for Application Timing)
CREATE TABLE IF NOT EXISTS internship_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT 'CodeXa Developer Internship',
  batch_code VARCHAR(100) NOT NULL DEFAULT '2026-AUG',
  status VARCHAR(50) NOT NULL DEFAULT 'AUTO', -- 'AUTO', 'OPEN', 'OPENING_SOON', 'CLOSED'
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  next_opens_at TIMESTAMPTZ NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure only one round is active at a time
CREATE INDEX IF NOT EXISTS idx_internship_rounds_active ON internship_rounds(is_active);

-- 2. APPLICATIONS TABLE (Full 8-Round Screening Dossier)
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reference_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Round 1: Personal
  full_name VARCHAR(255) NOT NULL,
  date_of_birth VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  whatsapp_number VARCHAR(50) NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  preferred_name VARCHAR(100) NULL,
  discord_username VARCHAR(100) NULL,
  instagram_handle VARCHAR(100) NULL,
  preferred_language VARCHAR(100) DEFAULT 'English',
  hobbies JSONB DEFAULT '[]'::jsonb,

  -- Round 2: Academic
  college_name VARCHAR(255) NOT NULL,
  university_name VARCHAR(255) NOT NULL,
  degree VARCHAR(100) NULL,
  course VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  roll_number VARCHAR(100) NOT NULL,
  graduation_year VARCHAR(50) NULL,
  expected_graduation VARCHAR(50) NOT NULL,
  cgpa VARCHAR(50) NULL,
  percentage VARCHAR(50) NULL,
  cgpa_percentage VARCHAR(50) NULL,
  certifications TEXT NULL,
  achievements TEXT NULL,
  backlogs VARCHAR(50) NULL,

  -- Round 3: Developer Presence
  coding_start_timeline VARCHAR(100) NOT NULL,
  has_built_projects VARCHAR(100) NOT NULL,
  hackathon_experience VARCHAR(100) DEFAULT 'None',
  internship_experience VARCHAR(100) DEFAULT 'None',
  freelancing_experience VARCHAR(100) DEFAULT 'None',
  open_source_experience VARCHAR(100) DEFAULT 'None',
  team_project_experience VARCHAR(100) DEFAULT 'None',
  developer_links JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  github_profile VARCHAR(255) NULL,
  linkedin_profile VARCHAR(255) NULL,
  portfolio_website VARCHAR(255) NULL,

  -- Round 4: Availability & Hardware
  daily_availability VARCHAR(100) NOT NULL,
  available_days JSONB DEFAULT '[]'::jsonb,
  preferred_timing JSONB DEFAULT '[]'::jsonb,
  can_attend_meetings VARCHAR(50) NOT NULL,
  can_meet_deadlines VARCHAR(50) NOT NULL,
  can_communicate_if_unavailable VARCHAR(50) NOT NULL,
  academic_constraints TEXT NULL,
  exam_periods TEXT NULL,
  laptop_status VARCHAR(100) NOT NULL,
  operating_system VARCHAR(100) NOT NULL,
  ram_capacity VARCHAR(100) NOT NULL,
  internet_stability VARCHAR(100) NOT NULL,
  can_run_dev_tools VARCHAR(50) NOT NULL,
  processor VARCHAR(100) NULL,
  gpu VARCHAR(100) NULL,
  storage_type VARCHAR(100) NULL,
  laptop_model VARCHAR(100) NULL,
  webcam_available VARCHAR(50) DEFAULT 'Yes',
  mic_available VARCHAR(50) DEFAULT 'Yes',

  -- Round 5: Technical Awareness
  c_level VARCHAR(50) NOT NULL DEFAULT 'I Don''t Know',
  c_answers JSONB DEFAULT '{}'::jsonb,
  python_level VARCHAR(50) NOT NULL DEFAULT 'I Don''t Know',
  python_answers JSONB DEFAULT '{}'::jsonb,
  java_level VARCHAR(50) NOT NULL DEFAULT 'I Don''t Know',
  java_answers JSONB DEFAULT '{}'::jsonb,
  html_level VARCHAR(50) NOT NULL DEFAULT 'I Don''t Know',
  html_answers JSONB DEFAULT '{}'::jsonb,
  vibe_coding_level VARCHAR(50) NOT NULL DEFAULT 'Never Used',
  vibe_coding_answers JSONB DEFAULT '{}'::jsonb,

  -- Round 6: Mindset Assessment
  mindset_answers JSONB DEFAULT '{}'::jsonb,

  -- Round 7: Thought-Process Interview
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

  -- Integrity Telemetry
  copy_paste_warnings_count INT NOT NULL DEFAULT 0,
  tab_switch_count INT NOT NULL DEFAULT 0,

  -- Scoring Breakdown (100 pts)
  genuineness_integrity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  commitment_continuity_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  mindset_habits_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  technical_knowledge_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  learning_potential_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  interview_communication_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  score_band VARCHAR(100) NOT NULL DEFAULT 'Standard Candidate',
  commitment_signal VARCHAR(50) NOT NULL DEFAULT 'Moderate',
  skill_authenticity JSONB DEFAULT '{}'::jsonb,

  -- Status & Administration
  status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
  admin_notes JSONB DEFAULT '[]'::jsonb,
  admin_tags JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ NULL,

  -- Raw Snapshot Backup
  raw_submission JSONB NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_ref ON applications(reference_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);

-- 3. ADMIN SESSIONS TABLE (30-Day Concurrency & Persistence)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id VARCHAR(100) PRIMARY KEY,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  device_label VARCHAR(255) NOT NULL,
  user_agent TEXT NOT NULL,
  ip_address VARCHAR(100) DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- 4. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action_type VARCHAR(100) NOT NULL,
  admin_user VARCHAR(100) NOT NULL DEFAULT 'Master Admin',
  target_id VARCHAR(100) NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(100) DEFAULT '127.0.0.1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AI VOICE GUIDES CACHE
CREATE TABLE IF NOT EXISTS voice_guides (
  id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  guide_key VARCHAR(100) NOT NULL,
  content_hash VARCHAR(128) NOT NULL UNIQUE,
  language VARCHAR(50) NOT NULL DEFAULT 'te-IN',
  provider VARCHAR(50) NOT NULL,
  voice_name VARCHAR(100) NOT NULL,
  script_text TEXT NOT NULL,
  audio_base64 TEXT NOT NULL,
  audio_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_guides_hash ON voice_guides(content_hash);

-- 6. TEAM PROFILES TABLE (Dynamic Leadership & Team CMS)
CREATE TABLE IF NOT EXISTS team_profiles (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  designation VARCHAR(255) NOT NULL,
  secondary_designation VARCHAR(255),
  role_type VARCHAR(100) NOT NULL DEFAULT 'Core Team',
  department VARCHAR(255),
  tagline TEXT,
  short_bio TEXT,
  full_bio TEXT,
  professional_summary TEXT,
  quote TEXT,
  email VARCHAR(255),
  secondary_email VARCHAR(255),
  phone VARCHAR(100),
  whatsapp VARCHAR(100),
  location VARCHAR(255),
  preferred_contact VARCHAR(100),
  github_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  portfolio_url TEXT,
  website_url TEXT,
  youtube_url TEXT,
  twitter_url TEXT,
  discord_username VARCHAR(100),
  other_links JSONB DEFAULT '[]'::jsonb,
  profile_image_url TEXT,
  profile_storage_path TEXT,
  profile_object_position_x NUMERIC DEFAULT 50,
  profile_object_position_y NUMERIC DEFAULT 50,
  profile_scale NUMERIC DEFAULT 1,
  background_asset_url TEXT,
  background_type VARCHAR(100) DEFAULT 'none',
  responsibilities JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT TRUE,
  show_email BOOLEAN DEFAULT TRUE,
  show_whatsapp BOOLEAN DEFAULT TRUE,
  show_socials BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_profiles_order ON team_profiles(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_team_profiles_visible ON team_profiles(is_visible);

-- 7. SITE MODULES TABLE (Curriculum & Learning Modules CMS)
CREATE TABLE IF NOT EXISTS site_modules (
  id VARCHAR(100) PRIMARY KEY,
  module_number INTEGER NOT NULL,
  module_code VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT NOT NULL,
  week_label VARCHAR(100),
  duration VARCHAR(100),
  image_url TEXT NOT NULL,
  topics JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_modules_order ON site_modules(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_site_modules_visible ON site_modules(is_visible);

-- 8. SITE SETTINGS TABLE (Global Website CMS & Voice Configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'default',
  hero_heading TEXT,
  hero_subtitle TEXT,
  hero_description TEXT,
  agency_name VARCHAR(255) DEFAULT 'CodeXa Agency',
  agency_url VARCHAR(255) DEFAULT 'https://www.codxa-agency.online',
  agency_description TEXT,
  whatsapp_support_number VARCHAR(100),
  founder_email VARCHAR(255),
  voice_guide_enabled BOOLEAN DEFAULT TRUE,
  voice_guide_settings JSONB DEFAULT '{}'::jsonb,
  raw_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

