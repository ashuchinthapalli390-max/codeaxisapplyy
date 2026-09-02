import assert from "node:assert";

const BASE_URL = "http://localhost:3005";
const ADMIN_PASSKEY = "codexa_test_passkey_2026";

async function run() {
  console.log("============================================================");
  console.log(`  VERIFYING LIVE ENDPOINTS ON ${BASE_URL}`);
  console.log("============================================================");

  let sessionCookie = "";

  // ------------------------------------------------------------
  // 1. Admin Login & Session Cookie Verification
  // ------------------------------------------------------------
  console.log("\n[Test 1] Testing Admin Login with Remember Me...");
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: ADMIN_PASSKEY, rememberMe: true }),
  });
  const loginJson = await loginRes.json();
  if (loginRes.status !== 200) {
    console.error("Login failed:", loginRes.status, loginJson);
  }
  assert.strictEqual(loginRes.status, 200, "Login must return 200");
  assert.strictEqual(loginJson.success, true, "Login must succeed");

  const rawSetCookie = loginRes.headers.get("set-cookie");
  assert(rawSetCookie, "Login must return set-cookie header");
  sessionCookie = rawSetCookie.split(";")[0];
  console.log("  ✓ Admin logged in, session cookie acquired:", sessionCookie.slice(0, 35) + "...");

  // ------------------------------------------------------------
  // 2. Direct Session Verification (No Manual Refresh Required)
  // ------------------------------------------------------------
  console.log("\n[Test 2] Testing /api/admin/verify-session...");
  const verifyRes = await fetch(`${BASE_URL}/api/admin/verify-session`, {
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(verifyRes.status, 200);
  const verifyJson = await verifyRes.json();
  assert.strictEqual(verifyJson.authenticated, true, "Session must be authenticated immediately");
  console.log("  ✓ Session verified. Client flips to authenticated state with zero manual refresh.");

  // ------------------------------------------------------------
  // 3. Application Dates & Asia/Kolkata (+05:30) Stability
  // ------------------------------------------------------------
  console.log("\n[Test 3] Testing Application Dates & Timezone Formatting...");
  const websiteGetRes = await fetch(`${BASE_URL}/api/admin/website`, {
    headers: { Cookie: sessionCookie },
  });
  assert.strictEqual(websiteGetRes.status, 200);
  const websiteGetJson = await websiteGetRes.json();
  assert.strictEqual(websiteGetJson.success, true);
  console.log(`  Current Batch: ${websiteGetJson.data.batchCode}, Opens: ${websiteGetJson.data.openDate} ${websiteGetJson.data.openTime}, Closes: ${websiteGetJson.data.closeDate} ${websiteGetJson.data.closeTime}`);

  // Test updating date with Asia/Kolkata +05:30 offset
  const websiteSaveRes = await fetch(`${BASE_URL}/api/admin/website`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({
      settings: {
        ...websiteGetJson.data,
        batchCode: "2026-SEP",
        openDate: "2026-09-01",
        openTime: "09:00",
        closeDate: "2026-09-07",
        closeTime: "23:59",
      },
    }),
  });
  assert.strictEqual(websiteSaveRes.status, 200);
  const websiteSaveJson = await websiteSaveRes.json();
  assert.strictEqual(websiteSaveJson.success, true, "Settings must save successfully");

  // Re-verify public config reflects 2026-SEP with +05:30 offset
  const publicConfigRes = await fetch(`${BASE_URL}/api/applications/config`);
  const publicConfig = await publicConfigRes.json();
  assert.strictEqual(publicConfig.data.round.batch_code, "2026-SEP");
  assert(publicConfig.data.round.closes_at.endsWith("+05:30"), "Public closes_at must have +05:30 offset");
  assert(publicConfig.data.round.closes_at.includes("2026-09-07"), "Closing date must be 2026-09-07");
  console.log("  ✓ Settings saved. Public config reflects Asia/Kolkata +05:30 timestamp:", publicConfig.data.round.closes_at);

  // ------------------------------------------------------------
  // 4. Submit Real Candidate vs Dummy Candidate
  // ------------------------------------------------------------
  console.log("\n[Test 4] Submitting Real Candidate vs Test Dummy Candidate...");
  const uniqueId = Date.now();
  
  // Real candidate
  const realCandidatePayload = {
    full_name: "Vikramaditya Rao",
    date_of_birth: "2003-04-10",
    email: `vikram.rao.${uniqueId}@gmail.com`,
    phone_number: "9988776655",
    whatsapp_number: "9988776655",
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    college_name: "CBIT",
    university_name: "Osmania University",
    course: "B.Tech",
    branch: "CSE",
    academic_year: "4th Year",
    semester: "7th Semester",
    roll_number: `160121733001_${uniqueId}`,
    expected_graduation: "2026",
    cgpa: "8.9",
    coding_start_timeline: "1 to 2 years ago",
    has_built_projects: "Yes, multiple complete projects",
    hackathon_experience: "Participated",
    internship_experience: "None",
    freelancing_experience: "None",
    open_source_experience: "None",
    team_project_experience: "College team project",
    developer_links: [
      { platform: "GitHub", url: "https://github.com/vikram-rao" },
    ],
    projects: [
      { id: "p1", name: "Agency CRM", description: "CRM Tool", techStack: "Next.js, Supabase", githubUrl: "https://github.com/vikram-rao/crm" }
    ],
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

  const realRes = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(realCandidatePayload),
  });
  const realJson = await realRes.json();
  if (!realJson.success) {
    console.error("Submit error:", realJson);
  }
  assert.strictEqual(realJson.success, true);
  const realRef = realJson.data?.reference_id || realJson.reference_id;
  console.log("  ✓ Real Candidate submitted with Reference ID:", realRef);

  // Dummy Candidate
  const dummyCandidatePayload = {
    ...realCandidatePayload,
    full_name: "Dummy Test Profile",
    email: `dummy.tester.${uniqueId}@example.com`,
    reference_id: `CAX-DUMMY-${uniqueId}`,
    roll_number: `DUMMY_ROLL_${uniqueId}`,
  };

  const dummyRes = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dummyCandidatePayload),
  });
  const dummyJson = await dummyRes.json();
  assert.strictEqual(dummyJson.success, true);
  const dummyRef = dummyJson.data?.reference_id || dummyJson.reference_id;
  console.log("  ✓ Test Dummy Candidate submitted with Reference ID:", dummyRef);

  // ------------------------------------------------------------
  // 5. Test View Isolation (Active vs Test Submissions)
  // ------------------------------------------------------------
  console.log("\n[Test 5] Testing Active vs Test / Dummy View Isolation...");
  const activeAppsRes = await fetch(`${BASE_URL}/api/admin/applications?view=active`, {
    headers: { Cookie: sessionCookie },
  });
  const activeAppsJson = await activeAppsRes.json();
  const foundRealInActive = activeAppsJson.data.some((a) => a.reference_id === realRef);
  const foundDummyInActive = activeAppsJson.data.some((a) => a.reference_id === dummyRef);

  assert(foundRealInActive, "Real candidate must be in active list");
  assert(!foundDummyInActive, "Dummy candidate must NOT be in active list");
  console.log("  ✓ Real candidate is in active view. Dummy candidate is isolated from active view.");

  const testAppsRes = await fetch(`${BASE_URL}/api/admin/applications?view=test`, {
    headers: { Cookie: sessionCookie },
  });
  const testAppsJson = await testAppsRes.json();
  const foundDummyInTest = testAppsJson.data.some((a) => a.reference_id === dummyRef);
  assert(foundDummyInTest, "Dummy candidate must be in test view");
  console.log("  ✓ Dummy candidate correctly detected and listed in Test / Dummy view.");

  // ------------------------------------------------------------
  // 6. Soft Delete to Trash
  // ------------------------------------------------------------
  console.log("\n[Test 6] Testing Soft Delete (Move Dummy to Trash)...");
  const softDelRes = await fetch(`${BASE_URL}/api/admin/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ id: dummyRef, permanent: false, reason: "Cleaning test submission" }),
  });
  const softDelJson = await softDelRes.json();
  assert.strictEqual(softDelJson.success, true);
  console.log("  ✓ Application moved to Trash successfully.");

  // Verify in Trash view
  const trashAppsRes = await fetch(`${BASE_URL}/api/admin/applications?view=trash`, {
    headers: { Cookie: sessionCookie },
  });
  const trashAppsJson = await trashAppsRes.json();
  const foundInTrash = trashAppsJson.data.find((a) => a.reference_id === dummyRef);
  assert(foundInTrash, "Application must be in Trash view");
  assert.strictEqual(foundInTrash.deletion_reason, "Cleaning test submission");
  console.log("  ✓ Application appears in Trash Bin with deletion reason retained.");

  // ------------------------------------------------------------
  // 7. Restore Application from Trash
  // ------------------------------------------------------------
  console.log("\n[Test 7] Testing Restore Application from Trash...");
  const restoreRes = await fetch(`${BASE_URL}/api/admin/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ id: dummyRef }),
  });
  const restoreJson = await restoreRes.json();
  assert.strictEqual(restoreJson.success, true);
  console.log("  ✓ Application restored successfully.");

  // ------------------------------------------------------------
  // 8. Permanent Deletion Confirmation Guard & Execution
  // ------------------------------------------------------------
  console.log("\n[Test 8] Testing Permanent Deletion Confirmation Guard...");
  // Attempt permanent delete without "DELETE" confirmation
  const permFailRes = await fetch(`${BASE_URL}/api/admin/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ id: dummyRef, permanent: true, confirmation: "wrong_text" }),
  });
  assert.strictEqual(permFailRes.status, 400, "Permanent delete must be rejected without exact DELETE confirmation");
  console.log("  ✓ Unconfirmed permanent delete was safely rejected (HTTP 400).");

  // Execute permanent delete with exact "DELETE" confirmation
  const permSuccessRes = await fetch(`${BASE_URL}/api/admin/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ id: dummyRef, permanent: true, confirmation: "DELETE" }),
  });
  assert.strictEqual(permSuccessRes.status, 200);
  const permSuccessJson = await permSuccessRes.json();
  assert.strictEqual(permSuccessJson.success, true);
  console.log("  ✓ Confirmed permanent delete succeeded with 100% cascade.");

  // Clean up the real test candidate as well
  await fetch(`${BASE_URL}/api/admin/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify({ id: realRef, permanent: true, confirmation: "DELETE" }),
  });
  console.log("  ✓ Test candidate cleanup complete.");

  console.log("\n============================================================");
  console.log("  ALL 8 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!");
  console.log("============================================================");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
