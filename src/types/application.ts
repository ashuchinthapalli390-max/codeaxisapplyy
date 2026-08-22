export type SkillLevel = "I Don't Know" | "Learner" | "Basic" | "Average" | "Expert";
export type VibeSkillLevel = "Never Used" | "Learning" | "Basic" | "Average" | "Advanced";

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  techStack: string;
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  projectType?: "Individual" | "Team";
  whatYouLearned?: string;
}

export interface DeveloperLink {
  platform: "GitHub" | "LinkedIn" | "Portfolio" | "Instagram" | "LeetCode" | "HackerRank" | "CodeChef" | "Website" | "Other";
  url: string;
}

export interface ApplicationData {
  id?: number;
  reference_id?: string;

  // Round 1: Personal Information
  full_name: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  whatsapp_number?: string;
  city: string;
  state: string;
  country: string;
  preferred_name?: string;
  discord_username?: string;
  instagram_handle?: string;
  profile_image_url?: string;
  preferred_language?: string;
  hobbies: string[]; // does NOT penalize score

  // Round 2: Education
  college_name: string;
  university_name: string;
  course: string;
  branch: string;
  academic_year: string;
  semester: string;
  roll_number: string;
  expected_graduation: string;
  cgpa?: string;
  percentage?: string;
  certifications?: string;
  achievements?: string;
  backlogs?: string;

  // Round 3: Developer Profile
  coding_start_timeline: string;
  has_built_projects: string;
  hackathon_experience?: string;
  internship_experience?: string;
  freelancing_experience?: string;
  open_source_experience?: string;
  team_project_experience?: string;
  developer_links: DeveloperLink[];
  projects: ProjectEntry[];

  // Round 4: Availability & Hardware
  daily_availability: string; // Below 1 hour | 1–2 hours | 2–3 hours | 3–4 hours | 4+ hours
  available_days: string[]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  preferred_timing: string[]; // Morning | Afternoon | Evening | Night
  can_attend_meetings: string; // Yes | Most of the time | Rarely | No
  can_meet_deadlines: string; // Yes | Usually | Need guidance | No
  academic_constraints?: string;
  exam_periods?: string;
  can_communicate_if_unavailable: string; // Yes, always | Usually | Working on it

  // Hardware
  laptop_status: string; // Own Laptop | Shared Laptop | Will Arrange | Currently No Laptop
  operating_system: string; // Windows | Linux | macOS | Other
  ram_capacity: string; // 4 GB or below | 8 GB | 16 GB | 32 GB+ | Not sure
  internet_stability: string; // Stable | Mostly stable | Mobile hotspot | Limited
  can_run_dev_tools: string; // Yes | Mostly | No | Not sure
  // Optional Hardware specs
  processor?: string;
  gpu?: string;
  storage_type?: string; // SSD | HDD | Both | Not sure
  laptop_model?: string;
  webcam_available?: string; // Yes | No | External
  mic_available?: string; // Yes | No | Headset

  // Round 5: Technical Awareness
  c_level: SkillLevel;
  c_answers: Record<string, string>;

  python_level: SkillLevel;
  python_answers: Record<string, string>;

  java_level: SkillLevel;
  java_answers: Record<string, string>;

  html_level: SkillLevel;
  html_answers: Record<string, string>;

  vibe_coding_level: VibeSkillLevel;
  vibe_coding_answers: Record<string, string>;

  // Round 6: Mindset Test (10-15 scenario MCQs)
  mindset_answers: Record<string, string>;

  // Round 7: Interview Questions (10 essays)
  interview_q1_why_codexa: string;
  interview_q2_why_select: string;
  interview_q3_expectations: string;
  interview_q4_strongest_skills: string;
  interview_q5_weakest_area: string;
  interview_q6_describe_project: string;
  interview_q7_difficult_problem: string;
  interview_q8_ai_coding_usage: string;
  interview_q9_college_balance: string;
  interview_q10_future_goal: string;

  // Round 8: Review & Commitment Policy
  commitment_accurate_info: boolean;
  commitment_independent_work: boolean;
  commitment_responsible_communication: boolean;
  commitment_team_rules: boolean;
  commitment_confidentiality: boolean;
  commitment_assigned_duties: boolean;
  commitment_no_guaranteed_employment: boolean;
  commitment_accept_policies: boolean;

  // Anti-Cheat & Integrity Telemetry
  copy_paste_warnings_count: number;
  tab_switch_count: number;
  integrity_score_penalty?: number;
  integrity_flags?: string[];

  // Server Calculated Scores (100 total)
  genuineness_integrity_score?: number; // 25 max
  commitment_continuity_score?: number; // 25 max
  mindset_habits_score?: number; // 20 max
  technical_knowledge_score?: number; // 15 max
  learning_potential_score?: number; // 10 max
  interview_communication_score?: number; // 10 max
  total_score?: number; // 100 max

  score_band?: "Exceptional Profile" | "Strong Candidate" | "Good Potential" | "Needs Review" | "Detailed Human Review";
  commitment_signal?: "Strong" | "Moderate" | "Needs Review";
  skill_authenticity?: {
    c?: "Consistent" | "Needs Review" | "Skipped";
    python?: "Consistent" | "Needs Review" | "Skipped";
    java?: "Consistent" | "Needs Review" | "Skipped";
    html?: "Consistent" | "Needs Review" | "Skipped";
    vibe_coding?: "Consistent" | "Needs Review" | "Skipped";
    overall?: "High" | "Moderate" | "Needs Review";
  };

  // Status & Admin
  status?: "Submitted" | "Under Review" | "Shortlisted" | "Selected" | "Waitlisted" | "Not Selected";
  admin_notes?: string[];
  admin_tags?: string[];
  is_duplicate?: boolean;
  duplicate_reason?: string;
  is_deleted?: boolean;
  deleted_at?: string;

  created_at?: string;
  updated_at?: string;
}

export type ApplicationStage = "startGate" | "intro" | "preApplication" | "application" | "success" | "admin-gate" | "admin-dashboard";
