export interface ApplicationData {
  id?: number;
  reference_id?: string;

  // Step 1: Identity
  full_name: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  discord_username: string;
  city_state: string;

  // Step 2: Academic
  college_name: string;
  course: string;
  branch: string;
  academic_year: string;
  semester: string;
  roll_number: string;

  // Step 3: Developer Presence
  github_link: string;
  portfolio_link: string;
  linkedin_link: string;

  // Step 4: Readiness Scan
  coding_level: string; // Complete Beginner | Basic Knowledge | Intermediate | Advanced
  device_status: string; // Yes | No | Mobile Only | Will Arrange Soon
  daily_availability: string; // Less than 1 hour | 1–2 hours | 2–4 hours | 4+ hours
  module_readiness: string; // Yes, I am ready | I need guidance | I am beginner but serious

  // Step 5: Intent Mapping
  project_experience: string; // Yes | No | Tried but not completed
  future_build_goal: string;
  join_reason: string;
  selection_reason: string;

  // Step 6: Mindset Assessment (Q1-Q10)
  mindset_q1: string; // A | B | C | D
  mindset_q2: string;
  mindset_q3: string;
  mindset_q4: string;
  mindset_q5: string;
  mindset_q6: string;
  mindset_q7: string;
  mindset_q8: string;
  mindset_q9: string;
  mindset_q10: string;

  // Step 7: Basic Coding Awareness (Topics: Yes | Little bit | No, but I want to learn)
  python_awareness: string;
  python_q1: string;
  python_q2: string;

  java_awareness: string;
  java_q1: string;
  java_q2: string;

  js_ts_awareness: string;
  js_ts_q1: string;
  js_ts_q2: string;

  webstack_awareness: string;
  webstack_q1: string;
  webstack_q2: string;

  vibe_coding_awareness: string;
  vibe_coding_q1: string;
  vibe_coding_q2: string;

  ai_prompting_awareness: string;
  ai_prompting_q1: string;
  ai_prompting_q2: string;

  github_projects_awareness: string;
  github_projects_q1: string;
  github_projects_q2: string;

  // Step 8: Thought Process Written Answers
  failure_experience_answer: string;
  trust_with_tools_answer: string;
  priority_answer: string;
  not_selected_answer: string;
  code_understanding_answer: string;

  // Step 9: Agreements (boolean checkboxes, represented as 0 | 1 in database)
  agreement_free_internship: boolean;
  agreement_selection_quality: boolean;
  agreement_step_by_step: boolean;
  agreement_no_misuse: boolean;
  agreement_revenue_share: boolean;

  // Server computed properties
  mindset_score?: number;
  coding_awareness_score?: number;
  profile_completion_score?: number;
  written_quality_score?: number;
  total_score?: number;

  auto_status?: "Auto Selected" | "Strong Shortlist" | "Pending Review" | "Low Priority Review";
  manual_status?: "Pending" | "Selected" | "Shortlisted" | "Rejected" | "Duplicate";
  admin_notes?: string;

  duplicate_warning?: boolean;
  duplicate_reason?: string;

  created_at?: string;
  updated_at?: string;
}

export type ApplicationStage = "intro" | "entry" | "application" | "success" | "admin-gate" | "admin-dashboard";
