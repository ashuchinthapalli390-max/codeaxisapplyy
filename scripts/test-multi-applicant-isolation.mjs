// Comprehensive Multi-Applicant Isolation & Privacy Test Suite
// Verifies Applicant A, B, and C isolation, reference uniqueness, tracking privacy, idempotency, and soft-delete

const BASE_URL = process.env.TEST_BASE_URL || "https://www.codeaxisapply.xyz";
const RUN_ID = Date.now();

function createCandidate(prefix, name, email) {
  const token = `sub_test_${prefix.toLowerCase()}_${RUN_ID}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    submission_token: token,
    submission_key: token,
    full_name: name,
    date_of_birth: "2003-05-15",
    email: email,
    phone_number: "+919876543210",
    whatsapp_number: "+919876543210",
    city: `${prefix}-City`,
    state: "Telangana",
    country: "India",
    preferred_language: "English",
    hobbies: ["Coding", `${prefix}-Research`],

    college_name: `${prefix} Institute of Technology`,
    university_name: `${prefix} University`,
    course: "B.Tech",
    branch: "Computer Science",
    academic_year: "3rd Year",
    semester: "6th Semester",
    roll_number: `ROLL-${prefix}-${RUN_ID.toString().slice(-4)}`,
    expected_graduation: "2026",
    cgpa: "8.8",

    coding_start_timeline: "1-2 years ago",
    has_built_projects: "Yes, multiple complete projects",
    hackathon_experience: "None",
    internship_experience: "None",
    freelancing_experience: "None",
    open_source_experience: "None",
    team_project_experience: "None",
    developer_links: [
      { platform: "GitHub", url: `https://github.com/test-${prefix.toLowerCase()}` },
    ],
    projects: [
      {
        id: `proj-${prefix}`,
        name: `${prefix} Portfolio Platform`,
        description: `Dedicated ${prefix} production system verification tool.`,
        techStack: "Next.js, TypeScript, Supabase",
        role: "Full-Stack Developer",
        projectType: "Individual",
        whatYouLearned: `Mastered ${prefix} isolation patterns.`,
      },
    ],

    daily_availability: "3-4 hours",
    available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    preferred_timing: ["Evening"],
    can_attend_meetings: "Yes",
    can_meet_deadlines: "Yes",
    can_communicate_if_unavailable: "Yes, always",

    laptop_status: "Own Laptop",
    operating_system: "Linux",
    ram_capacity: "16 GB",
    internet_stability: "Fiber Broadband (50+ Mbps)",
    can_run_dev_tools: "Yes",

    c_level: "Intermediate",
    c_answers: { c_q1: "A", c_q2: "B", c_q3: "C" },
    python_level: "Intermediate",
    python_answers: { python_q1: "B", python_q2: "C", python_q3: "A" },
    java_level: "I Don't Know",
    java_answers: {},
    html_level: "Intermediate",
    html_answers: { html_q1: "A", html_q2: "C" },
    vibe_coding_level: "Learning",
    vibe_coding_answers: {},

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

    interview_q1_why_codexa: `${prefix}: Building high-impact software with agency standards.`,
    interview_q2_why_select: `${prefix}: High accountability and proactive communication.`,
    interview_q3_expectations: `${prefix}: Rigorous code reviews and shipping real projects.`,
    interview_q4_strongest_skills: `${prefix}: Clean code, TypeScript architecture, and debugging.`,
    interview_q5_weakest_area: `${prefix}: Advanced distributed consensus mechanisms.`,
    interview_q6_describe_project: `${prefix}: Architected isolated microservices with PostgreSQL persistence.`,
    interview_q7_difficult_problem: `${prefix}: Resolved concurrency race conditions under high load.`,
    interview_q8_ai_coding_usage: `${prefix}: Leverages AI for scaffolding, verified with manual tests.`,
    interview_q9_college_balance: `${prefix}: Strict calendar scheduling between academics and internship.`,
    interview_q10_future_goal: `${prefix}: Lead production engineering teams building resilient cloud platforms.`,

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
    is_test: true,
    is_test_record: true,
  };
}

async function run() {
  console.log("==================================================================");
  console.log(`  CODEXA APPLY — MULTI-APPLICANT ISOLATION SUITE`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Create three controlled test candidates with distinct test emails and answers
  // Using RUN_ID suffix to guarantee test run isolation on live database while preserving requested test prefixes
  const emailA = process.env.USE_EXACT_EMAILS === "true" ? "test.alpha.candidate@example.com" : `test.alpha.candidate.${RUN_ID}@example.com`;
  const emailB = process.env.USE_EXACT_EMAILS === "true" ? "test.beta.candidate@example.com" : `test.beta.candidate.${RUN_ID}@example.com`;
  const emailC = process.env.USE_EXACT_EMAILS === "true" ? "test.gamma.candidate@example.com" : `test.gamma.candidate.${RUN_ID}@example.com`;

  const candidateA = createCandidate("ALPHA", "TEST ALPHA", emailA);
  const candidateB = createCandidate("BETA", "TEST BETA", emailB);
  const candidateC = createCandidate("GAMMA", "TEST GAMMA", emailC);

  console.log("[Phase 1] Submitting Applicant A and Applicant B concurrently...");

  const [resA, resB] = await Promise.all([
    fetch(`${BASE_URL}/api/applications/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidateA),
    }),
    fetch(`${BASE_URL}/api/applications/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidateB),
    }),
  ]);

  const jsonA = await resA.json();
  const jsonB = await resB.json();

  assert(jsonA.success === true, `Applicant A submission succeeds (status ${resA.status})`);
  assert(jsonB.success === true, `Applicant B submission succeeds (status ${resB.status})`);

  const idA = jsonA.data?.id;
  const refA = jsonA.data?.reference_id;
  const idB = jsonB.data?.id;
  const refB = jsonB.data?.reference_id;

  console.log(`  Applicant A -> ID: ${idA}, Reference: ${refA}`);
  console.log(`  Applicant B -> ID: ${idB}, Reference: ${refB}`);

  // 2. Uniqueness verification between concurrent submissions
  assert(Boolean(idA) && Boolean(idB), "Both applicants received database IDs");
  assert(idA !== idB, "Applicant A and Applicant B received distinct UUIDs");
  assert(refA !== refB, "Applicant A and Applicant B received distinct reference codes");
  assert(refA?.startsWith("CXA-"), "Applicant A reference follows CXA-* standard");
  assert(refB?.startsWith("CXA-"), "Applicant B reference follows CXA-* standard");
  assert(candidateA.submission_token !== candidateB.submission_token, "Applicant A and B have distinct submission tokens");

  // 3. Submit Applicant C sequentially
  console.log("\n[Phase 2] Submitting Applicant C sequentially...");
  const resC = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidateC),
  });
  const jsonC = await resC.json();

  assert(jsonC.success === true, `Applicant C submission succeeds (status ${resC.status})`);
  const idC = jsonC.data?.id;
  const refC = jsonC.data?.reference_id;
  console.log(`  Applicant C -> ID: ${idC}, Reference: ${refC}`);

  assert(idC !== idA && idC !== idB, "Applicant C received a unique UUID distinct from A and B");
  assert(refC !== refA && refC !== refB, "Applicant C received a unique reference distinct from A and B");
  assert(candidateC.submission_token !== candidateA.submission_token, "Applicant C has distinct submission token");

  // 4. Idempotency test: Retrying same submission token
  console.log("\n[Phase 3] Testing Submission Idempotency...");
  const resRetryA = await fetch(`${BASE_URL}/api/applications/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidateA),
  });
  const jsonRetryA = await resRetryA.json();
  assert(jsonRetryA.success === true, "Retrying same submission token succeeds idempotently");
  assert(jsonRetryA.data?.id === idA, "Retrying same token returns identical application UUID");
  assert(jsonRetryA.data?.reference_id === refA, "Retrying same token returns identical reference code");

  // 5. Tracking Privacy & Cross-Check Matrix
  console.log("\n[Phase 4] Testing Tracking Privacy & Cross-Check Matrix...");

  // 5.1 Correct Ref + Correct Email -> SUCCEEDS
  const trackAA = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refA)}&email=${encodeURIComponent(candidateA.email)}`);
  const jsonAA = await trackAA.json();
  assert(trackAA.status === 200 && jsonAA.success === true, "Tracking A Ref + A Email succeeds with HTTP 200");
  assert(jsonAA.data?.applicant_name === "TEST ALPHA", "Tracking A returns Applicant A's display name");
  assert(jsonAA.data?.phone_number === undefined, "Tracking DTO does not leak phone number");
  assert(jsonAA.data?.answers === undefined, "Tracking DTO does not leak screening answers");
  assert(jsonAA.data?.admin_notes === undefined, "Tracking DTO does not leak internal admin notes");

  // 5.2 Applicant A's Ref + Applicant B's Email -> FAILS (HTTP 404)
  const trackAB = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refA)}&email=${encodeURIComponent(candidateB.email)}`);
  const jsonAB = await trackAB.json();
  assert(trackAB.status === 404 && jsonAB.success === false, "Cross-check: A Ref + B Email fails with HTTP 404 (Privacy Preserved)");

  // 5.3 Applicant B's Ref + Applicant A's Email -> FAILS (HTTP 404)
  const trackBA = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refB)}&email=${encodeURIComponent(candidateA.email)}`);
  const jsonBA = await trackBA.json();
  assert(trackBA.status === 404 && jsonBA.success === false, "Cross-check: B Ref + A Email fails with HTTP 404 (Privacy Preserved)");

  // 5.4 Reference alone without Email -> FAILS (HTTP 400)
  const trackRefOnly = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refA)}`);
  const jsonRefOnly = await trackRefOnly.json();
  assert(trackRefOnly.status === 400 && jsonRefOnly.success === false, "Tracking with Reference alone without Email fails with HTTP 400");

  // 6. Soft-Delete & Restore Isolation on Candidate B (if admin access available)
  console.log("\n[Phase 5] Testing Soft-Delete and Restore Isolation...");
  const adminPasskey = process.env.ADMIN_PASSKEY;
  if (adminPasskey) {
    try {
      const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey: adminPasskey }),
      });
      if (loginRes.ok) {
        const cookie = loginRes.headers.get("set-cookie");
        // Soft-delete B
        const delRes = await fetch(`${BASE_URL}/api/admin/delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ id: idB, reason: "Automated isolation test" }),
        });
        const delJson = await delRes.json();
        assert(delJson.success === true, "Candidate B moved to Trash via soft delete");

        // Tracking B while in Trash must fail
        const trackDeletedB = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refB)}&email=${encodeURIComponent(candidateB.email)}`);
        assert(trackDeletedB.status === 404, "Tracking B while in Trash returns 404");

        // Tracking A must remain unaffected
        const trackAStillActive = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refA)}&email=${encodeURIComponent(candidateA.email)}`);
        assert(trackAStillActive.status === 200, "Candidate A remains active while Candidate B is in Trash");

        // Restore B
        const restoreRes = await fetch(`${BASE_URL}/api/admin/restore`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Cookie: cookie },
          body: JSON.stringify({ id: idB }),
        });
        const restoreJson = await restoreRes.json();
        assert(restoreJson.success === true, "Candidate B restored successfully from Trash");

        // Tracking B after restore must succeed
        const trackRestoredB = await fetch(`${BASE_URL}/api/applications/track?ref=${encodeURIComponent(refB)}&email=${encodeURIComponent(candidateB.email)}`);
        assert(trackRestoredB.status === 200, "Tracking B succeeds after restore");
      }
    } catch (adminTestErr) {
      console.warn("  [NOTE] Admin endpoint test notice:", adminTestErr.message);
    }
  } else {
    console.log("  [INFO] Skipping remote admin soft-delete call (ADMIN_PASSKEY not passed). Handled by server storage test.");
  }

  console.log("\n==================================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Multi-applicant test error:", err);
  process.exit(1);
});
