import assert from "assert";

const BASE_URL = process.env.TEST_URL || "http://localhost:3001";
const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "codexa_test_passkey_2026";

async function run() {
  console.log("============================================================");
  console.log(`  Verifying Live CodeXa Endpoints on ${BASE_URL}`);
  console.log("============================================================");

  // 1. Check Config Endpoint (Section: Batch & Voice Guide Removal)
  console.log("\n[Test 1] Checking /api/applications/config...");
  const configRes = await fetch(`${BASE_URL}/api/applications/config`);
  assert.strictEqual(configRes.status, 200, "Config endpoint must return 200 OK");
  const configJson = await configRes.json();
  assert.strictEqual(configJson.success, true);
  console.log(`  Batch Code: ${configJson.data.round.batch_code}`);
  assert.strictEqual(
    configJson.data.round.batch_code,
    "2026-SEP",
    "Batch code must be 2026-SEP"
  );
  assert.strictEqual(
    configJson.data.settings.voiceGuide,
    undefined,
    "voiceGuide must not exist in website settings"
  );
  console.log("  ✓ Config returns Batch 2026-SEP with Voice Guide completely omitted.");

  // 2. Submit Application with Optional Resume
  console.log("\n[Test 2] Submitting Application via /api/applications/submit...");
  const candidatePayload = {
    full_name: "Sai Krishna",
    date_of_birth: "2004-05-12",
    gender: "Male",
    email: `sai.krishna.${Date.now()}@gmail.com`,
    phone_number: "9876543210",
    whatsapp_number: "9876543210",
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    college_name: "JNTUH College of Engineering",
    university_name: "JNTU Hyderabad",
    course: "B.Tech",
    branch: "Computer Science",
    academic_year: "4th Year",
    semester: "8th Semester",
    roll_number: "20051A0501",
    expected_graduation: "2026",
    cgpa: "8.8",
    coding_start_timeline: "1 to 2 years ago",
    has_built_projects: "Yes, multiple complete projects",
    hackathon_experience: "Participated",
    internship_experience: "None",
    freelancing_experience: "None",
    open_source_experience: "None",
    team_project_experience: "College team project",
    developer_links: [
      { platform: "GitHub", url: "https://github.com/saikrishna-dev" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/saikrishna" },
    ],
    projects: [
      {
        id: "p1",
        name: "CodeCollab Platform",
        description: "Real-time collaborative code editor with WebSockets",
        techStack: "Next.js, Node.js, WebSockets",
        githubUrl: "https://github.com/saikrishna-dev/codecollab",
      },
    ],
    resume_url: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXr",
    resume_file_name: "Sai_Krishna_Resume.pdf",
    resume_file_size: 524288,
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
    c_answers: { c_q1: "A", c_q2: "B", c_q3: "C", c_q4: "B", c_q5: "A" },
    python_level: "Intermediate",
    python_answers: { python_q1: "B", python_q2: "C" },
    java_level: "Beginner",
    java_answers: {},
    html_level: "Advanced",
    html_answers: {},
    vibe_coding_level: "Average",
    vibe_coding_answers: {},
    mindset_answers: {
      mindset_q1: "A",
      mindset_q2: "B",
      mindset_q3: "B",
      mindset_q4: "B",
      mindset_q5: "A",
      mindset_q6: "B",
      mindset_q7: "B",
      mindset_q8: "B",
      mindset_q9: "B",
      mindset_q10: "B",
    },
    interview_q1_why_codexa: "I want to work on real-world production engineering projects with high code standards.",
    interview_q2_why_select: "I have strong fundamentals, curiosity, and deep dedication to finish tasks.",
    interview_q3_expectations: "Mentorship and hands-on exposure to full-stack system architecture.",
    interview_q4_strongest_skills: "TypeScript, problem debugging, and clean code principles.",
    interview_q5_weakest_area: "Advanced Kubernetes deployments which I am actively learning.",
    interview_q6_describe_project: "Built a collaborative editor used by college study groups.",
    interview_q7_difficult_problem: "Debugged a race condition in WebSocket connection teardown.",
    interview_q8_ai_coding_usage: "I use AI tools to generate boilerplate and test cases, then carefully verify logic.",
    interview_q9_college_balance: "I have dedicated 3-4 evening hours specifically for internship duties.",
    interview_q10_future_goal: "Become a high-impact core software engineer at an innovative tech agency.",
    commitment_accurate_info: true,
    commitment_independent_work: true,
    commitment_responsible_communication: true,
    commitment_team_rules: true,
    commitment_confidentiality: true,
    commitment_assigned_duties: true,
    commitment_no_guaranteed_employment: true,
    commitment_accept_policies: true,
    copy_paste_warnings_count: 0,
    tab_switch_count: 0,
  };

  const submitRes = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidatePayload),
  });

  const submitJson = await submitRes.json();
  assert.strictEqual(submitRes.status, 200, `Submit failed: ${JSON.stringify(submitJson)}`);
  assert.strictEqual(submitJson.success, true);
  const refId = submitJson.data.reference_id;
  console.log(`  ✓ Application created successfully! Reference ID: ${refId}`);

  // 3. Track Status
  console.log(`\n[Test 3] Tracking application status for Ref: ${refId}...`);
  const trackRes = await fetch(
    `${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refId)}&email=${encodeURIComponent(
      candidatePayload.email
    )}`
  );
  assert.strictEqual(trackRes.status, 200);
  const trackJson = await trackRes.json();
  assert.strictEqual(trackJson.success, true);
  assert.strictEqual(trackJson.data.status, "Submitted");
  assert.strictEqual(trackJson.data.reference_id, refId);
  // Ensure sensitive scoring details are NOT exposed to applicant
  assert.strictEqual(trackJson.data.total_score, undefined);
  assert.strictEqual(trackJson.data.mindset_answers, undefined);
  console.log("  ✓ Tracking response verified. Confidential scoring safely hidden.");

  // 4. Test Single-Use Offer Token Protection
  console.log("\n[Test 4] Testing /api/offer/respond with invalid token...");
  const invalidTokenRes = await fetch(`${BASE_URL}/api/offer/respond?token=non_existent_fake_token`);
  assert.strictEqual(invalidTokenRes.status, 404);
  const invalidJson = await invalidTokenRes.json();
  assert.strictEqual(invalidJson.success, false);
  console.log(`  ✓ Token validation working properly: ${invalidJson.error}`);

  // 5. Test Admin Login (Standard 12 Hours vs 30 Days Remember Me)
  console.log("\n[Test 5] Testing Admin Login with Standard 12 Hours Duration...");
  const login12hRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: ADMIN_PASSKEY, rememberMe: false }),
  });
  assert.strictEqual(login12hRes.status, 200, "Login must succeed with configured passkey");
  const cookie12h = login12hRes.headers.get("set-cookie") || "";
  assert.ok(cookie12h.includes("Max-Age=43200"), "Standard login cookie must have Max-Age=43200 (12 hours)");
  console.log("  ✓ Standard login issued 12-hour session cookie (Max-Age=43200).");

  console.log("\n[Test 6] Testing Admin Login with 30-Day Remember Me...");
  const login30dRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: ADMIN_PASSKEY, rememberMe: true }),
  });
  assert.strictEqual(login30dRes.status, 200);
  const cookie30d = login30dRes.headers.get("set-cookie") || "";
  assert.ok(cookie30d.includes("Max-Age=2592000"), "Remember Me cookie must have Max-Age=2592000 (30 days)");
  const sessionToken = cookie30d.split(";")[0]; // codexa_admin_session=...
  console.log("  ✓ Remember Me login issued 30-day session cookie (Max-Age=2592000).");

  // 7. Verify Active Session with Cookie
  console.log("\n[Test 7] Verifying Session via /api/admin/verify-session...");
  const verifyRes = await fetch(`${BASE_URL}/api/admin/verify-session`, {
    headers: { Cookie: sessionToken },
  });
  assert.strictEqual(verifyRes.status, 200);
  const verifyJson = await verifyRes.json();
  assert.strictEqual(verifyJson.authenticated, true);
  assert.strictEqual(verifyJson.rememberMe, true);
  console.log("  ✓ Session verified successfully. Authenticated state retained.");

  // 8. Fetch Admin Sessions List
  console.log("\n[Test 8] Fetching Active Sessions via /api/admin/sessions...");
  const sessionsRes = await fetch(`${BASE_URL}/api/admin/sessions`, {
    headers: { Cookie: sessionToken },
  });
  assert.strictEqual(sessionsRes.status, 200);
  const sessionsJson = await sessionsRes.json();
  assert.strictEqual(sessionsJson.success, true);
  assert.ok(Array.isArray(sessionsJson.data), "Sessions must be an array");
  console.log(`  ✓ Active admin sessions retrieved: count = ${sessionsJson.data.length}.`);

  // 9. Logout
  console.log("\n[Test 9] Logging out via /api/admin/logout...");
  const logoutRes = await fetch(`${BASE_URL}/api/admin/logout`, {
    method: "POST",
    headers: { Cookie: sessionToken },
  });
  assert.strictEqual(logoutRes.status, 200);
  const logoutCookie = logoutRes.headers.get("set-cookie") || "";
  assert.ok(logoutCookie.includes("Max-Age=0"), "Logout must clear cookie with Max-Age=0");
  console.log("  ✓ Logout cleared session cookie immediately.");

  console.log("\n============================================================");
  console.log("  ALL ENDPOINTS & SESSION TESTS PASSED WITH 100% SUCCESS!");
  console.log("============================================================");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
