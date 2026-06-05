-- Database initialization for CodeXa Apply Website
-- Creates the applications and admin_audit_logs tables

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Step 1: Identity
  full_name VARCHAR(255) NOT NULL,
  date_of_birth VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  whatsapp_number VARCHAR(50) DEFAULT NULL,
  discord_username VARCHAR(50) DEFAULT NULL,
  city_state VARCHAR(255) NOT NULL,
  
  -- Step 2: Academic
  college_name VARCHAR(255) NOT NULL,
  course VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  roll_number VARCHAR(100) NOT NULL,
  
  -- Step 3: Developer Presence
  github_link VARCHAR(255) DEFAULT NULL,
  portfolio_link VARCHAR(255) DEFAULT NULL,
  linkedin_link VARCHAR(255) DEFAULT NULL,
  
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
  
  -- Step 6: Mindset Assessment
  mindset_q1 VARCHAR(10) NOT NULL,
  mindset_q2 VARCHAR(10) NOT NULL,
  mindset_q3 VARCHAR(10) NOT NULL,
  mindset_q4 VARCHAR(10) NOT NULL,
  mindset_q5 VARCHAR(10) NOT NULL,
  mindset_q6 VARCHAR(10) NOT NULL,
  mindset_q7 VARCHAR(10) NOT NULL,
  mindset_q8 VARCHAR(10) NOT NULL,
  mindset_q9 VARCHAR(10) NOT NULL,
  mindset_q10 VARCHAR(10) NOT NULL,
  
  -- Step 7: Coding Awareness
  python_awareness VARCHAR(50) NOT NULL,
  python_q1 VARCHAR(50) DEFAULT NULL,
  python_q2 VARCHAR(50) DEFAULT NULL,
  
  java_awareness VARCHAR(50) NOT NULL,
  java_q1 VARCHAR(50) DEFAULT NULL,
  java_q2 VARCHAR(50) DEFAULT NULL,
  
  js_ts_awareness VARCHAR(50) NOT NULL,
  js_ts_q1 VARCHAR(50) DEFAULT NULL,
  js_ts_q2 VARCHAR(50) DEFAULT NULL,
  
  webstack_awareness VARCHAR(50) NOT NULL,
  webstack_q1 VARCHAR(50) DEFAULT NULL,
  webstack_q2 VARCHAR(50) DEFAULT NULL,
  
  vibe_coding_awareness VARCHAR(50) NOT NULL,
  vibe_coding_q1 VARCHAR(50) DEFAULT NULL,
  vibe_coding_q2 VARCHAR(50) DEFAULT NULL,
  
  ai_prompting_awareness VARCHAR(50) NOT NULL,
  ai_prompting_q1 VARCHAR(50) DEFAULT NULL,
  ai_prompting_q2 VARCHAR(50) DEFAULT NULL,
  
  github_projects_awareness VARCHAR(50) NOT NULL,
  github_projects_q1 VARCHAR(50) DEFAULT NULL,
  github_projects_q2 VARCHAR(50) DEFAULT NULL,
  
  -- Step 8: Thought Process Written Answers
  failure_experience_answer TEXT NOT NULL,
  trust_with_tools_answer TEXT NOT NULL,
  priority_answer TEXT NOT NULL,
  not_selected_answer TEXT NOT NULL,
  code_understanding_answer TEXT NOT NULL,
  
  -- Step 9: Agreements
  agreement_free_internship TINYINT(1) DEFAULT 0,
  agreement_selection_quality TINYINT(1) DEFAULT 0,
  agreement_step_by_step TINYINT(1) DEFAULT 0,
  agreement_no_misuse TINYINT(1) DEFAULT 0,
  agreement_revenue_share TINYINT(1) DEFAULT 0,
  
  -- Evaluation Scores
  mindset_score DECIMAL(5, 2) DEFAULT 0.00,
  coding_awareness_score DECIMAL(5, 2) DEFAULT 0.00,
  profile_completion_score DECIMAL(5, 2) DEFAULT 0.00,
  written_quality_score DECIMAL(5, 2) DEFAULT 0.00,
  total_score DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Statuses and notes
  auto_status VARCHAR(50) NOT NULL,
  manual_status VARCHAR(50) DEFAULT 'Pending',
  admin_notes TEXT DEFAULT NULL,
  
  -- Duplicate registry warning
  duplicate_warning TINYINT(1) DEFAULT 0,
  duplicate_reason TEXT DEFAULT NULL,
  
  -- Metadata
  pdf_url VARCHAR(255) DEFAULT NULL,
  is_deleted TINYINT(1) DEFAULT 0,
  deleted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  application_id INT DEFAULT NULL,
  details TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_email ON applications(email);
CREATE INDEX idx_phone_number ON applications(phone_number);
CREATE INDEX idx_roll_number ON applications(roll_number);
CREATE INDEX idx_reference_id ON applications(reference_id);
CREATE INDEX idx_manual_status ON applications(manual_status);
CREATE INDEX idx_is_deleted ON applications(is_deleted);
CREATE INDEX idx_created_at ON applications(created_at);
