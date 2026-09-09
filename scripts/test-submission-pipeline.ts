import { validateAllRounds } from "@/lib/validation";
import { calculateApplicationScores } from "@/lib/scoring";
import { saveApplication } from "@/lib/storage";
import { ApplicationData } from "@/types/application";

console.log("=== Testing CodeXa Submission Pipeline ===");

// 1. Test validation on empty body
const emptyValidation = validateAllRounds({});
console.log(`1. Empty body validation: isValid=${emptyValidation.isValid} (expected false, errors: ${emptyValidation.errors.length})`);
if (emptyValidation.isValid) {
  throw new Error("Empty body should not be valid!");
}

// 2. Test scoring engine
const sampleCandidate: Partial<ApplicationData> = {
  full_name: "Aarav Patel",
  email: "aarav.patel.test@example.com",
  phone_number: "9876543210",
  whatsapp_number: "9876543210",
  city: "Hyderabad",
  state: "Telangana",
  course: "B.Tech",
  branch: "CSE",
  academic_year: "3rd Year",
  semester: "5th Semester",
  roll_number: "21031A0520",
  expected_graduation: "2026",
  coding_start_timeline: "1-2 years ago",
  has_built_projects: "Yes, multiple complete projects",
  daily_availability: "4-6 hours",
  available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  preferred_timing: ["Evening (6 PM - 10 PM)"],
  can_attend_meetings: "Yes",
  can_meet_deadlines: "Yes",
  can_communicate_if_unavailable: "Yes, always",
  laptop_status: "Personal Laptop in Good Condition",
  operating_system: "Windows 11",
  ram_capacity: "16 GB",
  internet_stability: "Fiber Broadband (50+ Mbps)",
  can_run_dev_tools: "Yes",
  c_level: "Beginner",
  python_level: "Intermediate",
  java_level: "I Don't Know",
  html_level: "Advanced",
  vibe_coding_level: "Learning",
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
  interview_q1_why_codexa: "I want to work on production engineering problems with real accountability and learn modern AI-assisted workflows.",
  interview_q2_why_select: "I have consistent daily discipline, write clean code, and communicate proactively when facing blockers.",
  interview_q3_expectations: "Practical engineering exposure, high-velocity shipping culture, and rigorous code reviews from seniors.",
  interview_q4_strongest_skills: "Fast debugging, React component architecture, and clean documentation.",
  interview_q5_weakest_area: "Advanced SQL query optimization and distributed database indexing.",
  interview_q6_describe_project: "Built a real-time event booking portal with seat mapping, Next.js API routes, and PostgreSQL persistence.",
  interview_q7_difficult_problem: "Diagnosed a memory leak caused by uncleaned event listeners in WebSocket connections.",
  interview_q8_ai_coding_usage: "I use Claude Code and Cursor to scaffold tests and diagnose bugs, verifying all output manually.",
  interview_q9_college_balance: "I allocate morning slots for university classes and dedicate 5 uninterrupted evening hours to internship work.",
  interview_q10_future_goal: "Become a high-impact full-stack production engineer capable of designing resilient cloud architectures.",
  commitment_accurate_info: true,
  commitment_independent_work: true,
  commitment_responsible_communication: true,
  commitment_team_rules: true,
  commitment_confidentiality: true,
  commitment_assigned_duties: true,
  commitment_no_guaranteed_employment: true,
  commitment_accept_policies: true,
};

const scores = calculateApplicationScores(sampleCandidate);
console.log(`2. Scoring engine output: Total=${scores.total_score}/100, Band="${scores.score_band}", Commitment="${scores.commitment_signal}"`);
console.log(`   Breakdown: Integrity=${scores.genuineness_integrity_score}, Continuity=${scores.commitment_continuity_score}, Mindset=${scores.mindset_habits_score}, Tech=${scores.technical_knowledge_score}, Learning=${scores.learning_potential_score}, Interview=${scores.interview_communication_score}`);

if (scores.total_score <= 0) {
  throw new Error("Total score must be greater than 0 for complete candidate profile!");
}

async function testStorageSave() {
  const submissionKey = `sub_test_${Date.now()}`;
  const fullApp: any = {
    ...sampleCandidate,
    submission_key: submissionKey,
    submission_token: submissionKey,
    total_score: scores.total_score,
    score_band: scores.score_band,
    status: "Submitted",
  };

  const saved1 = await saveApplication(fullApp);
  console.log(`3. Initial save: ID=${saved1.id}, ReferenceID=${saved1.reference_id}`);

  // Test idempotency with identical submission_token
  const saved2 = await saveApplication(fullApp);
  console.log(`4. Idempotency test: ID=${saved2.id}, ReferenceID=${saved2.reference_id}`);

  if (saved1.reference_id !== saved2.reference_id) {
    throw new Error(`Idempotency check failed: ${saved1.reference_id} !== ${saved2.reference_id}`);
  }
  console.log("✓ Idempotency verified: duplicate submission returned identical reference ID.");

  console.log("\nAll submission pipeline checks passed successfully!");
}

testStorageSave().catch((err) => {
  console.error("Submission test failed:", err);
  process.exit(1);
});
