-- Create database if not exists
-- CREATE DATABASE IF NOT EXISTS codeaxis_portal;
-- USE codeaxis_portal;

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reference_id VARCHAR(91) NOT NULL UNIQUE,

  -- Step 1: Identity Module
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  whatsapp_number VARCHAR(50) NULL,
  discord_username VARCHAR(100) NULL,
  city_state VARCHAR(255) NOT NULL,

  -- Step 2: Academic Module
  college_name VARCHAR(255) NOT NULL,
  course VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  roll_number VARCHAR(100) NOT NULL,

  -- Step 3: Developer Presence
  github_link VARCHAR(255) NULL,
  portfolio_link VARCHAR(255) NULL,
  linkedin_link VARCHAR(255) NULL,

  -- Step 4: Readiness Scan
  coding_level VARCHAR(100) NOT NULL,
  device_status VARCHAR(100) NOT NULL,
  daily_availability VARCHAR(100) NOT NULL,
  module_readiness VARCHAR(100) NOT NULL,

  -- Step 5: Intent Mapping
  project_experience VARCHAR(100) NOT NULL,
  future_build_goal TEXT NOT NULL,
  join_reason TEXT NOT NULL,
  selection_reason TEXT NOT NULL,

  -- Step 6: Mindset Assessment (MCQ options A/B/C/D)
  mindset_q1 CHAR(1) NOT NULL,
  mindset_q2 CHAR(1) NOT NULL,
  mindset_q3 CHAR(1) NOT NULL,
  mindset_q4 CHAR(1) NOT NULL,
  mindset_q5 CHAR(1) NOT NULL,
  mindset_q6 CHAR(1) NOT NULL,
  mindset_q7 CHAR(1) NOT NULL,
  mindset_q8 CHAR(1) NOT NULL,
  mindset_q9 CHAR(1) NOT NULL,
  mindset_q10 CHAR(1) NOT NULL,

  -- Step 7: Basic Coding Awareness (Topics: Yes / Little bit / No...)
  python_awareness VARCHAR(100) NOT NULL,
  python_q1 CHAR(1) NULL,
  python_q2 CHAR(1) NULL,

  java_awareness VARCHAR(100) NOT NULL,
  java_q1 CHAR(1) NULL,
  java_q2 CHAR(1) NULL,

  js_ts_awareness VARCHAR(100) NOT NULL,
  js_ts_q1 CHAR(1) NULL,
  js_ts_q2 CHAR(1) NULL,

  webstack_awareness VARCHAR(100) NOT NULL,
  webstack_q1 CHAR(1) NULL,
  webstack_q2 CHAR(1) NULL,

  vibe_coding_awareness VARCHAR(100) NOT NULL,
  vibe_coding_q1 CHAR(1) NULL,
  vibe_coding_q2 CHAR(1) NULL,

  ai_prompting_awareness VARCHAR(100) NOT NULL,
  ai_prompting_q1 CHAR(1) NULL,
  ai_prompting_q2 CHAR(1) NULL,

  github_projects_awareness VARCHAR(100) NOT NULL,
  github_projects_q1 CHAR(1) NULL,
  github_projects_q2 CHAR(1) NULL,

  -- Step 8: Thought Process Written Answers
  failure_experience_answer TEXT NOT NULL,
  trust_with_tools_answer TEXT NOT NULL,
  priority_answer TEXT NOT NULL,
  not_selected_answer TEXT NOT NULL,
  code_understanding_answer TEXT NOT NULL,

  -- Step 9: Agreements (stored as booleans/tinyint)
  agreement_free_internship TINYINT(1) NOT NULL DEFAULT 0,
  agreement_selection_quality TINYINT(1) NOT NULL DEFAULT 0,
  agreement_step_by_step TINYINT(1) NOT NULL DEFAULT 0,
  agreement_no_misuse TINYINT(1) NOT NULL DEFAULT 0,
  agreement_revenue_share TINYINT(1) NOT NULL DEFAULT 0,

  -- Scoring Mappings
  mindset_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  coding_awareness_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  profile_completion_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  written_quality_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  total_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,

  -- Status Flags
  auto_status VARCHAR(100) NOT NULL DEFAULT 'Low Priority Review',
  manual_status VARCHAR(100) NOT NULL DEFAULT 'Pending',
  admin_notes TEXT NULL,

  -- Duplicate Warnings
  duplicate_warning TINYINT(1) NOT NULL DEFAULT 0,
  duplicate_reason VARCHAR(255) NULL,

  -- PDF URL
  pdf_url VARCHAR(255) DEFAULT NULL,

  -- Soft delete flags
  is_deleted TINYINT(1) DEFAULT 0,
  deleted_at DATETIME DEFAULT NULL,

  -- JSON Raw Data Backup
  form_data JSON DEFAULT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexing for search performance
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_roll (roll_number),
  INDEX idx_ref (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(100) NOT NULL, -- UPDATE_STATUS, DELETE_APPLICATION, etc.
  application_id BIGINT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
