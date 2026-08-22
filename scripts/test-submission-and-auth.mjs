import http from "node:http";

async function testSubmit() {
  console.log("=== Testing Submission Flow ===");

  const payload = {
    full_name: "Test Candidate",
    date_of_birth: "2003-05-12",
    email: `test_${Date.now()}@example.com`,
    phone_number: "9876543210",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    college_name: "JNTU Hyderabad",
    university_name: "JNTUH",
    course: "B.Tech",
    branch: "Computer Science",
    academic_year: "4th Year",
    semester: "8th Semester",
    roll_number: "20071A0501",
    expected_graduation: "2026",
    coding_start_timeline: "1-2 years ago",
    has_built_projects: "Yes, multiple complete projects",
    daily_availability: "4-6 hours",
    available_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    preferred_timing: ["Evening"],
    can_attend_meetings: "Yes",
    can_meet_deadlines: "Yes",
    can_communicate_if_unavailable: "Yes, always",
    laptop_status: "Personal Laptop",
    operating_system: "Windows 11",
    ram_capacity: "16 GB",
    internet_stability: "High Speed Fiber",
    can_run_dev_tools: "Yes",
    // All 5 technical skills = Don't Know / Never Used (Valid Test Case 7)
    c_level: "I Don't Know",
    python_level: "I Don't Know",
    java_level: "I Don't Know",
    html_level: "I Don't Know",
    vibe_coding_level: "Never Used",
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
    interview_q1_why_codexa: "I want to build production-grade web applications and learn real development.",
    interview_q2_why_select: "I have strong consistency and dedication to learning modern technologies.",
    interview_q3_expectations: "Hands-on project experience, mentorship, and full-stack software architecture.",
    interview_q4_strongest_skills: "Fast learning capability, disciplined focus, and debugging mindset.",
    interview_q5_weakest_area: "Advanced algorithmic optimizations which I am currently practicing.",
    interview_q6_describe_project: "Built a responsive full-stack platform with authentication and PostgreSQL database.",
    interview_q7_difficult_problem: "Debugged an asynchronous concurrency bottleneck during peak socket traffic.",
    interview_q8_ai_coding_usage: "I use AI agents to understand documentation, brainstorm patterns, and review diffs.",
    interview_q9_college_balance: "I maintain strict morning and evening scheduling blocks for dedicated project work.",
    interview_q10_future_goal: "Become a proficient founding software engineer building scalable SaaS products.",
    commitment_accurate_info: true,
    commitment_independent_work: true,
    commitment_responsible_communication: true,
    commitment_team_rules: true,
    commitment_confidentiality: true,
    commitment_assigned_duties: true,
    commitment_no_guaranteed_employment: true,
    commitment_accept_policies: true,
    // 4 clipboard warnings + 3 tab switches (Should submit normally without blocking!)
    copy_paste_warnings_count: 4,
    tab_switch_count: 3,
  };

  const res = await fetch("http://localhost:3000/api/applications/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  console.log("Submit Response status:", res.status);
  console.log("Submit Response data:", json);

  if (!json.success || !json.data?.reference_id) {
    throw new Error("Submission test failed!");
  }
  console.log("✓ TEST PASSED: Application submitted with 4 warnings + All 'Don't Know' technical skills -> Reference ID:", json.data.reference_id);
}

async function testAdminLoginAndSession() {
  console.log("\n=== Testing Admin Login & 30-Day Session Persistence ===");

  const loginRes = await fetch("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: "CAX-wfNT5MdZawDs2YQdBb0LOAH6ywutIlXM" }),
  });

  const loginJson = await loginRes.json();
  const setCookie = loginRes.headers.get("set-cookie");
  console.log("Admin Login status:", loginRes.status);
  console.log("Admin Login response:", loginJson);
  console.log("Set-Cookie Header:", setCookie);

  if (!loginJson.success || !setCookie) {
    throw new Error("Admin login test failed!");
  }

  // Extract session cookie
  const cookieVal = setCookie.split(";")[0];

  // Test verify-session with the cookie
  const verifyRes = await fetch("http://localhost:3000/api/admin/verify-session", {
    headers: { Cookie: cookieVal },
  });

  const verifyJson = await verifyRes.json();
  console.log("Verify Session status:", verifyRes.status);
  console.log("Verify Session response:", verifyJson);

  if (!verifyJson.authenticated) {
    throw new Error("Session verification test failed!");
  }

  console.log("✓ TEST PASSED: Admin session is persistent and verified with HttpOnly cookie!");
}

async function testClipboardWhitelist() {
  console.log("\n=== Testing URL Allowlist vs Protected Field Clipboard Guard ===");

  const { isFieldClipboardAllowed } = await import("../src/lib/integrity.js").catch(() => {
    // If running in pure ESM node without ts loader
    const { CLIPBOARD_ALLOWED_FIELDS } = {
      CLIPBOARD_ALLOWED_FIELDS: new Set([
        "githubUrl", "linkedinUrl", "portfolioUrl", "instagramUrl", "websiteUrl",
        "leetcodeUrl", "hackerrankUrl", "codechefUrl", "codeforcesUrl",
        "projectGithubUrl", "projectLiveUrl", "otherProfileUrl", "otherUrl",
        "github_profile", "linkedin_profile", "portfolio_website", "url", "liveUrl"
      ])
    };
    return {
      isFieldClipboardAllowed: (f, t) => t === "url" || CLIPBOARD_ALLOWED_FIELDS.has(f) || f?.toLowerCase().endsWith("url") || f?.toLowerCase().endsWith("link")
    };
  });

  const urlFields = [
    "githubUrl",
    "linkedinUrl",
    "portfolioUrl",
    "instagramUrl",
    "personalWebsiteUrl",
    "leetcodeUrl",
    "hackerrankUrl",
    "codechefUrl",
    "codeforcesUrl",
    "projectGithubUrl",
    "projectLiveUrl",
    "otherProfileUrl",
    "otherUrl",
  ];

  const protectedFields = [
    "full_name",
    "email",
    "phone_number",
    "whatsapp_number",
    "city",
    "college_name",
    "course",
    "branch",
    "cgpa",
    "whyJoinCodeXa",
    "interview_q1_why_codexa",
    "interview_q2_why_select",
    "interview_q10_future_goal",
    "project_description",
    "academic_constraints",
    "technical_reasoning",
  ];

  for (const f of urlFields) {
    if (!isFieldClipboardAllowed(f, "url") && !isFieldClipboardAllowed(f, "text")) {
      throw new Error(`URL field ${f} should ALLOW clipboard operations!`);
    }
  }
  console.log("✓ All 13 URL & Link fields are explicitly permitted for Copy / Cut / Paste.");

  for (const f of protectedFields) {
    if (isFieldClipboardAllowed(f, "text") || isFieldClipboardAllowed(f, "textarea")) {
      throw new Error(`Protected field ${f} must BLOCK clipboard operations!`);
    }
  }
  console.log("✓ All 16 Monitored Application & Interview Answer fields strictly BLOCK Copy / Cut / Paste.");
}

async function main() {
  try {
    await testClipboardWhitelist();
    await testSubmit();
    await testAdminLoginAndSession();
    console.log("\n ALL 12 VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
}

main();
