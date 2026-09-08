// End-to-end HTTP Verification against local Next.js server

const BASE_URL = "http://localhost:3005";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Connecting to server at ${BASE_URL}...`);

  // 1. Wait for server to become ready
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/applications/config`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      await wait(1000);
    }
  }

  if (!ready) {
    console.error("Server did not respond within 20 seconds.");
    process.exit(1);
  }

  console.log("Server is online! Beginning API checks...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: /api/applications/config
  console.log("[1] Checking /api/applications/config:");
  const configRes = await fetch(`${BASE_URL}/api/applications/config`);
  assert(configRes.ok, "Config endpoint returns HTTP 200");
  const configJson = await configRes.json();
  assert(configJson.success === true, "Config returns success: true");
  assert(configJson.data?.availability !== undefined, "Availability object is present");
  assert(typeof configJson.data?.availability?.canApply === "boolean", "canApply is boolean");
  assert(typeof configJson.data?.server_time_ms === "number", "server_time_ms is present");
  console.log(`      Current round: ${configJson.data?.round?.batch_code || "N/A"}, mode: ${configJson.data?.availability?.mode}, canApply: ${configJson.data?.availability?.canApply}, reason: ${configJson.data?.availability?.reasonCode}`);

  // TEST 2: /api/team
  console.log("\n[2] Checking /api/team:");
  const teamRes = await fetch(`${BASE_URL}/api/team`);
  assert(teamRes.ok, "Team endpoint returns HTTP 200");
  const teamJson = await teamRes.json();
  assert(teamJson.success === true, "Team returns success: true");
  assert(Array.isArray(teamJson.data) && teamJson.data.length >= 4, "Team has at least 4 active leaders");

  const arshad = teamJson.data.find((m) => m.name.includes("Arshad"));
  assert(arshad && arshad.codename === "SOUTH DEVELOPER", "Founder Arshad present with SOUTH DEVELOPER");

  const sanjay = teamJson.data.find((m) => m.name.includes("Sanjay"));
  assert(sanjay && sanjay.codename === "Spideyy !!", "Co-Founder Sanjay present with Spideyy !!");
  assert(sanjay?.photoUrl?.includes("2299fdd2a1d01339a71af61a2c7e9cac"), "Sanjay has verified portrait");

  const kishore = teamJson.data.find((m) => m.name === "Kishore");
  assert(kishore && kishore.designation === "Chief Executive Officer", "CEO Kishore present");

  const bhanu = teamJson.data.find((m) => m.name.includes("Bhanu"));
  assert(bhanu && bhanu.codename === "Hakai", "CEO Bhanu Prasad present with Hakai");
  assert(bhanu?.photoUrl?.includes("4e56a053e3ee0019b13c19c5b3f614fe"), "Bhanu Prasad has working portrait");

  // TEST 3: /api/applications/submit with full 8 rounds (No Resume)
  console.log("\n[3] Testing Application Submission:");
  const subKey = `test_key_${Date.now()}`;
  const testApp = {
    submission_key: subKey,
    full_name: "Priya Sharma",
    date_of_birth: "2003-08-20",
    email: `test.candidate.${Date.now()}@example.com`,
    phone_number: "9876501234",
    whatsapp_number: "9876501234",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    preferred_language: "English",
    hobbies: ["Coding", "System Design"],

    college_name: "JNTU College of Engineering",
    university_name: "JNTUH",
    course: "B.Tech",
    branch: "Computer Science and Engineering",
    academic_year: "4th Year",
    semester: "7th Semester",
    roll_number: "20031A0501",
    expected_graduation: "2026",
    cgpa_percentage: "8.8 CGPA",

    coding_start_timeline: "2+ years ago",
    has_built_projects: "Yes, multiple complete projects",
    github_profile: "https://github.com/priyasharma-test",
    linkedin_profile: "https://linkedin.com/in/priyasharma-test",
    portfolio_website: "https://priyasharma.dev",

    daily_availability: "4-6 hours",
    available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    preferred_timing: ["Evening"],
    can_attend_meetings: "Yes",
    can_meet_deadlines: "Yes",
    can_communicate_if_unavailable: "Yes, always",
    laptop_status: "Personal Laptop in Good Condition",
    operating_system: "Windows 11",
    ram_capacity: "16 GB",
    internet_stability: "Fiber Broadband",
    can_run_dev_tools: "Yes",

    c_level: "Basic",
    python_level: "Average",
    java_level: "I Don't Know",
    html_level: "Expert",
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

    interview_q1_why_codexa: "CodeXa provides a genuine developer universe and real production agency software experience.",
    interview_q2_why_select: "I am deeply committed, fast at learning, and write clean, structured code every day.",
    interview_q3_expectations: "Building scalable web products, code reviews, and working in high-standard engineering teams.",
    interview_q4_strongest_skills: "React, TypeScript, CSS layout architectures, and systematic issue debugging.",
    interview_q5_weakest_area: "Advanced low-level memory management and deep operating system internals.",
    interview_q6_describe_project: "Constructed an automated candidate screening portal with Next.js and Supabase.",
    interview_q7_difficult_problem: "Debugged an asynchronous race condition in state management by introducing monotonic IDs.",
    interview_q8_ai_coding_usage: "I use AI tools to accelerate scaffolding, and thoroughly verify diffs and types manually.",
    interview_q9_college_balance: "I have fixed 4-hour evening blocks and complete dedicated sprints over the weekend.",
    interview_q10_future_goal: "To become an exceptional software engineer who ships reliable software to users.",

    // Round 8 declarations
    commitment_accurate_info: true,
    commitment_independent_work: true,
    commitment_responsible_communication: true,
    commitment_team_rules: true,
    commitment_confidentiality: true,
    commitment_assigned_duties: true,
    commitment_no_guaranteed_employment: true,
    commitment_accept_policies: true,
  };

  const submitRes = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testApp),
  });

  const submitJson = await submitRes.json();
  console.log(`      Submit Response: HTTP ${submitRes.status}`, submitJson);

  assert(submitRes.ok, "Application submission returns HTTP 200");
  assert(submitJson.success === true, "Submission response has success: true");
  const refId = submitJson.data?.reference_id;
  assert(typeof refId === "string" && refId.startsWith("CAX-"), `Durable Reference ID generated: ${refId}`);

  // TEST 4: Idempotency (Submit same submission_key again)
  console.log("\n[4] Testing Submission Idempotency:");
  const retryRes = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testApp),
  });
  const retryJson = await retryRes.json();
  assert(retryRes.ok, "Retry submission returns HTTP 200");
  assert(retryJson.success === true, "Retry submission returns success: true");
  assert(retryJson.data?.reference_id === refId, `Idempotent retry returned the exact same Reference ID (${retryJson.data?.reference_id})`);

  // TEST 5: Track Application
  console.log("\n[5] Testing Application Tracking:");
  const trackRes = await fetch(`${BASE_URL}/api/applications/track?ref=${refId}&email=${encodeURIComponent(testApp.email)}`);
  const trackJson = await trackRes.json().catch(() => ({}));
  console.log(`      Track Response: HTTP ${trackRes.status}`, trackJson);
  assert(trackRes.ok, "Track endpoint returns HTTP 200");
  assert(trackJson.success === true, "Tracking returns success: true");
  assert(trackJson.data?.full_name === "Priya Sharma", "Tracked candidate name matches");

  console.log(`\n==================================================`);
  console.log(`HTTP Verification Suite: ${passed} passed, ${failed} failed.`);
  console.log(`==================================================`);

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

main().catch((err) => {
  console.error("HTTP Verification Exception:", err);
  process.exit(1);
});
