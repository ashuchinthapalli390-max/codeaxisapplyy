import { config } from "dotenv";
config({ path: ".env.local" });
config();

import assert from "assert";

console.log("------------------------------------------------------------");
console.log("  Running CodeXa Apply Final Feature Verification Suite      ");
console.log("------------------------------------------------------------");

async function runTests() {
  const {
    saveApplication,
    getApplicationByRef,
    trackApplication,
    saveInterview,
    getInterviewByRef,
    updateInterviewStatus,
    saveOffer,
    getOfferByRef,
    getOfferByToken,
    respondToOffer,
    getWebsiteSettings,
  } = await import("../src/lib/storage.js");

  // 1. Voice Guide removal verification
  console.log("\n[Test 1] Verifying Voice Guide Settings Removal...");
  const settings = await getWebsiteSettings();
  assert.strictEqual(
    settings.voiceGuide,
    undefined,
    "WebsiteSettings must not contain voiceGuide property"
  );
  console.log("✓ Settings cleanly omit all voice guide properties.");

  // 2. Application Saving with Optional Resume
  console.log("\n[Test 2] Testing Application Creation with Optional Resume...");
  const testRef = `CAX-TEST-${Date.now().toString().slice(-6)}`;
  const testApp = {
    reference_id: testRef,
    full_name: "Test Candidate",
    email: "test.candidate@codexa.test",
    phone_number: "9876543210",
    college_name: "CodeXa Institute of Technology",
    course: "B.Tech",
    branch: "Computer Science",
    academic_year: "4th Year",
    roll_number: "2026CS101",
    expected_graduation: "2026",
    daily_availability: "3–4 hours",
    available_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    preferred_timing: ["Evening"],
    can_attend_meetings: "Yes",
    can_meet_deadlines: "Yes",
    can_communicate_if_unavailable: "Yes, always",
    laptop_status: "Own Laptop",
    operating_system: "Linux",
    ram_capacity: "16 GB",
    internet_stability: "High-speed broadband",
    can_run_dev_tools: "Yes",
    c_level: "Intermediate",
    c_answers: {},
    python_level: "Advanced",
    python_answers: {},
    java_level: "Beginner",
    java_answers: {},
    html_level: "Advanced",
    html_answers: {},
    vibe_coding_level: "Average",
    vibe_coding_answers: {},
    mindset_answers: {},
    coding_start_timeline: "1 to 2 years ago",
    has_built_projects: "Yes, multiple complete projects",
    developer_links: [{ platform: "GitHub", url: "https://github.com/testcandidate" }],
    projects: [
      {
        id: "p1",
        name: "Cloud Task Orchestrator",
        description: "Built scalable task runner with Next.js",
        techStack: "TypeScript, Node.js",
      },
    ],
    resume_url: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr",
    resume_file_name: "Candidate_Resume_2026.pdf",
    resume_file_size: 1048576,
    status: "Submitted",
    total_score: 88,
    score_band: "High Fit",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const saved = await saveApplication(testApp);
  assert.ok(saved.reference_id, "Application must have reference ID");
  assert.strictEqual(saved.resume_file_name, "Candidate_Resume_2026.pdf");
  console.log(`✓ Application saved with resume. Reference: ${saved.reference_id}`);

  // 3. Status Tracking Protection
  console.log("\n[Test 3] Verifying Candidate Status Tracking...");
  const tracked = await trackApplication(saved.reference_id, "test.candidate@codexa.test");
  assert.ok(tracked, "Candidate tracking must succeed with valid ref and email");
  assert.strictEqual(tracked.status, "Submitted");
  // Ensure sensitive assessment details are omitted from trackApplication return
  assert.strictEqual(tracked.genuineness_integrity_score, undefined);
  assert.strictEqual(tracked.admin_notes, undefined);
  console.log("✓ Status tracking accurately protects internal scoring and reviewer notes.");

  // 4. Interview Scheduling Flow
  console.log("\n[Test 4] Testing Interview Scheduling & Lifecycle...");
  const testInterview = {
    reference_id: saved.reference_id,
    applicant_name: saved.full_name,
    applicant_email: saved.email,
    interview_round: "Technical & Mindset Review",
    interview_date: "2026-09-08",
    start_time: "15:00",
    timezone: "Asia/Kolkata",
    duration_minutes: 30,
    platform: "Google Meet",
    meeting_link: "https://meet.google.com/test-cax-meet",
    interviewer_name: "Ashu Chinthapalli",
    instructions: "Prepare your GitHub projects.",
    status: "Scheduled",
    invitation_sent: true,
  };

  const savedInterview = await saveInterview(testInterview);
  assert.strictEqual(savedInterview.status, "Scheduled");
  const fetchedInterview = await getInterviewByRef(saved.reference_id);
  assert.ok(fetchedInterview, "Should find interview by reference ID");
  assert.strictEqual(fetchedInterview.meeting_link, "https://meet.google.com/test-cax-meet");

  await updateInterviewStatus(saved.reference_id, "Completed", "Candidate demonstrated exceptional problem solving.");
  const updatedInterview = await getInterviewByRef(saved.reference_id);
  assert.strictEqual(updatedInterview.status, "Completed");
  console.log("✓ Interview scheduled, queried, and marked completed successfully.");

  // 5. Offer Letter Generation & Acceptance Flow
  console.log("\n[Test 5] Testing Offer Letter & Single-Use Token Response Flow...");
  const testToken = `tok_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const testOffer = {
    reference_id: saved.reference_id,
    applicant_name: saved.full_name,
    applicant_email: saved.email,
    internship_role: "Full-Stack Developer Intern",
    department: "Engineering & Product Development",
    batch_code: "2026-SEP",
    joining_date: "2026-09-15",
    duration: "12 Weeks",
    work_mode: "Remote",
    stipend_status: "Performance-Based Project Stipends",
    acceptance_deadline: "2026-09-10",
    authorized_person: "Ashu Chinthapalli",
    designation: "Founder & CEO",
    token: testToken,
    status: "Offer Sent",
    version: 1,
  };

  const savedOffer = await saveOffer(testOffer);
  assert.strictEqual(savedOffer.token, testToken);

  const fetchedByToken = await getOfferByToken(testToken);
  assert.ok(fetchedByToken, "Should find offer by token");
  assert.strictEqual(fetchedByToken.applicant_name, "Test Candidate");

  // Candidate responds: Accept Offer
  const responseResult = await respondToOffer(testToken, "Offer Accepted");
  assert.strictEqual(responseResult.success, true);
  assert.strictEqual(responseResult.offer?.status, "Offer Accepted");
  assert.ok(responseResult.offer?.responded_at, "Response timestamp must be recorded");

  // Re-responding should be blocked (single-use token verification)
  const doubleResponse = await respondToOffer(testToken, "Offer Declined");
  assert.strictEqual(doubleResponse.success, false, "Duplicate response must be rejected");
  console.log("✓ Offer letter generated, retrieved via token, and accepted with single-use security.");

  console.log("\n------------------------------------------------------------");
  console.log("  ALL TESTS PASSED WITH 100% SUCCESS!                       ");
  console.log("------------------------------------------------------------");
}

runTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
