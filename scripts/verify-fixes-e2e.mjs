// Automated Comprehensive Verification Script for CodeXa Apply Launch Blockers
// Tests Availability Resolver, 8-Round Validation, Leadership Canonical Models

import { resolveApplicationAvailability } from "../src/lib/availability.ts";
import { validateAllRounds, validateRound } from "../src/lib/validation.ts";
import { getAdminTeam, getPublicTeam } from "../src/lib/storage.ts";

console.log("==================================================");
console.log("CodeXa Apply Comprehensive Fix Verification Suite");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

// ----------------------------------------------------
// TEST SUITE 1: Server Availability Resolver Precedence
// ----------------------------------------------------
console.log("\n[1] Testing Server Availability Resolver Precedence:");

const serverTimeMs = new Date("2026-09-08T12:00:00+05:30").getTime();

// 1.1 Config unavailable
const nullRoundRes = resolveApplicationAvailability(null, serverTimeMs);
assert(nullRoundRes.canApply === false, "Missing round returns canApply = false");
assert(nullRoundRes.reasonCode === "CONFIG_UNAVAILABLE", "Missing round returns CONFIG_UNAVAILABLE");

// 1.2 Explicit CLOSED
const closedRound = {
  id: "test-round-1",
  batch_code: "BATCH-2026",
  status: "CLOSED",
  opens_at: "2026-09-01T00:00:00Z",
  closes_at: "2026-09-30T00:00:00Z",
};
const closedRes = resolveApplicationAvailability(closedRound, serverTimeMs);
assert(closedRes.canApply === false, "Explicit CLOSED status returns canApply = false");
assert(closedRes.reasonCode === "EXPLICIT_CLOSED", "Explicit CLOSED status returns EXPLICIT_CLOSED");

// 1.3 Explicit PAUSED
const pausedRound = {
  id: "test-round-1",
  batch_code: "BATCH-2026",
  status_override: "PAUSED",
  opens_at: "2026-09-01T00:00:00Z",
  closes_at: "2026-09-30T00:00:00Z",
};
const pausedRes = resolveApplicationAvailability(pausedRound, serverTimeMs);
assert(pausedRes.canApply === false, "status_override = PAUSED returns canApply = false");
assert(pausedRes.reasonCode === "EXPLICIT_PAUSED", "status_override = PAUSED returns EXPLICIT_PAUSED");

// 1.4 Force-OPEN override outside AUTO dates (The Launch Blocker Scenario!)
const forceOpenRound = {
  id: "test-round-1",
  batch_code: "BATCH-2026",
  status_override: "OPEN",
  opens_at: "2026-09-10T00:00:00Z", // Future date
  closes_at: "2026-09-20T00:00:00Z",
};
const forceOpenRes = resolveApplicationAvailability(forceOpenRound, serverTimeMs);
assert(forceOpenRes.canApply === true, "status_override = OPEN overrides future opening dates (Blocker 1 fixed)");
assert(forceOpenRes.reasonCode === "OVERRIDE_OPEN", "status_override = OPEN returns OVERRIDE_OPEN");
assert(forceOpenRes.effectiveStatus === "OPEN", "effectiveStatus is OPEN");

// 1.5 AUTO within window
const autoInWindowRound = {
  id: "test-round-1",
  batch_code: "BATCH-2026",
  status_override: "AUTO",
  opens_at: "2026-09-01T00:00:00+05:30",
  closes_at: "2026-09-20T23:59:59+05:30",
};
const autoInRes = resolveApplicationAvailability(autoInWindowRound, serverTimeMs);
assert(autoInRes.canApply === true, "AUTO within window returns canApply = true");
assert(autoInRes.reasonCode === "AUTO_OPEN", "AUTO within window returns AUTO_OPEN");

// 1.6 AUTO before window
const autoBeforeRound = {
  id: "test-round-1",
  batch_code: "BATCH-2026",
  status_override: "AUTO",
  opens_at: "2026-09-15T00:00:00+05:30",
  closes_at: "2026-09-25T23:59:59+05:30",
};
const autoBeforeRes = resolveApplicationAvailability(autoBeforeRound, serverTimeMs);
assert(autoBeforeRes.canApply === false, "AUTO before window returns canApply = false");
assert(autoBeforeRes.reasonCode === "AUTO_BEFORE_WINDOW", "AUTO before window returns AUTO_BEFORE_WINDOW");
assert(autoBeforeRes.effectiveStatus === "OPENING_SOON", "effectiveStatus is OPENING_SOON");

// 1.7 AUTO after window
const autoAfterRound = {
  id: "test-round-1",
  batch_code: "BATCH-2026",
  status_override: "AUTO",
  opens_at: "2026-08-01T00:00:00+05:30",
  closes_at: "2026-08-30T23:59:59+05:30",
};
const autoAfterRes = resolveApplicationAvailability(autoAfterRound, serverTimeMs);
assert(autoAfterRes.canApply === false, "AUTO after window returns canApply = false");
assert(autoAfterRes.reasonCode === "AUTO_AFTER_WINDOW", "AUTO after window returns AUTO_AFTER_WINDOW");
assert(autoAfterRes.effectiveStatus === "CLOSED", "effectiveStatus is CLOSED");

// ----------------------------------------------------
// TEST SUITE 2: 8-Round Form Validation & Missing Checkbox Fix
// ----------------------------------------------------
console.log("\n[2] Testing 8-Round Form Validation & Checkbox Submission:");

const validFullForm = {
  // Round 1
  full_name: "Test Applicant",
  date_of_birth: "2003-05-15",
  email: "test.applicant@example.com",
  phone_number: "9876543210",
  whatsapp_number: "9876543210",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  preferred_language: "English",
  hobbies: ["Coding", "System Design"],

  // Round 2
  college_name: "Hyderabad Institute of Technology",
  university_name: "JNTUH",
  course: "B.Tech",
  branch: "Computer Science",
  academic_year: "4th Year",
  semester: "7th Semester",
  roll_number: "20HIT0501",
  expected_graduation: "2026",
  cgpa_percentage: "8.5 CGPA",

  // Round 3 (No resume required!)
  coding_start_timeline: "1-2 years ago",
  has_built_projects: "Yes, 1-2 projects",
  github_profile: "https://github.com/testapplicant",
  linkedin_profile: "https://linkedin.com/in/testapplicant",
  portfolio_website: "https://testapplicant.dev",

  // Round 4
  daily_availability: "4-6 hours",
  available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  preferred_timing: ["Evening (6 PM - 10 PM)"],
  can_attend_meetings: "Yes",
  can_meet_deadlines: "Yes",
  can_communicate_if_unavailable: "Yes",
  laptop_status: "Personal Laptop in Good Condition",
  operating_system: "Windows 11",
  ram_capacity: "16 GB",
  internet_stability: "High-speed Fiber Broadband",
  can_run_dev_tools: "Yes",

  // Round 5
  c_level: "Basic",
  python_level: "Learner",
  java_level: "I Don't Know",
  html_level: "Expert",
  vibe_coding_level: "Learning",

  // Round 6
  mindset_answers: {
    mindset_q1: "B",
    mindset_q2: "B",
    mindset_q3: "B",
    mindset_q4: "B",
    mindset_q5: "A",
    mindset_q6: "B",
    mindset_q7: "B",
    mindset_q8: "B",
    mindset_q9: "A",
    mindset_q10: "B",
  },

  // Round 7: Thought-Process Interview (10 questions, >= 20 characters each)
  interview_q1_why_codexa: "I want to join CodeXa Agency to learn production full-stack engineering.",
  interview_q2_why_select: "I have strong consistency, passion for coding, and eager learning mindset.",
  interview_q3_expectations: "Hands-on real client project experience, code reviews, and architecture skills.",
  interview_q4_strongest_skills: "TypeScript, React, problem solving, debugging, and continuous learning.",
  interview_q5_weakest_area: "Advanced algorithmic dynamic programming and complex microservices design.",
  interview_q6_describe_project: "Built a full-stack real-time collaboration tool using Next.js and Supabase.",
  interview_q7_difficult_problem: "Diagnosed a memory leak and race condition in WebSocket message subscriptions.",
  interview_q8_ai_coding_usage: "Steer LLMs using structured prompts, test every generated function, and review diffs.",
  interview_q9_college_balance: "Dedicated evening hours from 6 PM to 10 PM and full day availability on weekends.",
  interview_q10_future_goal: "Become a high-impact Principal Full-Stack Engineer and platform architect.",

  // Round 8: All 8 required declarations including the previously missing commitment_team_rules!
  commitment_accurate_info: true,
  commitment_independent_work: true,
  commitment_responsible_communication: true,
  commitment_team_rules: true, // PREVIOUSLY MISSING FROM JSX -> CAUSED SILENT SUBMISSION FAILURE
  commitment_confidentiality: true,
  commitment_assigned_duties: true,
  commitment_no_guaranteed_employment: true,
  commitment_accept_policies: true,
};

// Test valid submission passes validation completely without resume
const validationResult = validateAllRounds(validFullForm);
if (!validationResult.isValid) {
  console.log("Validation Errors encountered:", validationResult.errors);
}
assert(validationResult.isValid === true, "Valid 8-round form passes validation with NO resume (Launch Blocker 1 fixed)");
assert(Object.keys(validationResult.errors).length === 0, "Zero errors returned for valid form");

// Test missing commitment_team_rules specifically triggers validation error
const missingTeamRulesForm = { ...validFullForm, commitment_team_rules: false };
const invalidResult = validateAllRounds(missingTeamRulesForm);
assert(invalidResult.isValid === false, "Missing commitment_team_rules correctly fails validation");
assert(invalidResult.errors.commitment_team_rules !== undefined, "Errors include commitment_team_rules");

// ----------------------------------------------------
// TEST SUITE 3: Canonical Leadership Team Model
// ----------------------------------------------------
console.log("\n[3] Testing Canonical Leadership Model & Approved Roster:");

const adminTeam = await getAdminTeam();
assert(Array.isArray(adminTeam) && adminTeam.length >= 4, "Admin team returns at least 4 canonical leaders");

const publicTeam = await getPublicTeam();
assert(Array.isArray(publicTeam) && publicTeam.length >= 4, "Public team returns at least 4 active leaders");

// Check Arshad (Founder)
const arshad = publicTeam.find((m) => m.name.includes("Arshad"));
assert(arshad !== undefined, "Founder CH. Arshad exists in public team");
assert(arshad?.codename === "SOUTH DEVELOPER", "CH. Arshad has approved codename 'SOUTH DEVELOPER'");

// Check Sanjay (Co-Founder) - Strictly distinct from Deepak!
const sanjay = publicTeam.find((m) => m.name.includes("Sanjay"));
assert(sanjay !== undefined, "Co-Founder B. Sanjay exists in public team");
assert(sanjay?.codename === "Spideyy !!", "B. Sanjay has approved codename 'Spideyy !!'");
assert(sanjay?.photoUrl?.includes("2299fdd2a1d01339a71af61a2c7e9cac"), "B. Sanjay has correct distinct photo asset");

// Check Kishore (CEO)
const kishore = publicTeam.find((m) => m.name === "Kishore");
assert(kishore !== undefined, "CEO Kishore exists in public team");
assert(kishore?.designation === "Chief Executive Officer", "Kishore has designation Chief Executive Officer");

// Check Bhanu Prasad (CEO)
const bhanu = publicTeam.find((m) => m.name.includes("Bhanu"));
assert(bhanu !== undefined, "CEO G. Bhanu Prasad exists in public team");
assert(bhanu?.codename === "Hakai", "G. Bhanu Prasad has approved codename 'Hakai'");
assert(bhanu?.photoUrl?.includes("4e56a053e3ee0019b13c19c5b3f614fe"), "G. Bhanu Prasad has correct working photo asset (not broken)");

// Ensure Deepak was never renamed to Sanjay
const deepakAsSanjay = adminTeam.find((m) => m.name.includes("Deepak") && m.name.includes("Sanjay"));
assert(deepakAsSanjay === undefined, "Deepak and Sanjay are strictly separate identities");

// Ensure contact privacy in public output (phone & email hidden by default)
assert(publicTeam.every((m) => m.showPhone === false || !m.phone || m.showPhone === undefined), "Private phone numbers are protected from unauthorized public exposure");

console.log(`\n==================================================`);
console.log(`Verification Results: ${testsPassed} passed, ${testsFailed} failed.`);
console.log(`==================================================`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
