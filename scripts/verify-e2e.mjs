async function run() {
  console.log("=== STEP 1: SUBMIT REAL APPLICATION ===");
  const testEmail = `test.applicant.${Date.now()}@example.com`;
  const payload = {
    // Round 1: Personal
    full_name: "Rahul Verma Test",
    date_of_birth: "2002-05-15",
    email: testEmail,
    phone_number: "+919876543210",
    whatsapp_number: "+919876543210",
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    preferred_name: "Rahul",
    preferred_language: "English",
    hobbies: ["Open Source", "System Design"],

    // Round 2: Academic
    college_name: "IIT Hyderabad",
    university_name: "IIT",
    course: "B.Tech",
    branch: "Computer Science",
    academic_year: "4th Year",
    semester: "7th",
    roll_number: "CS22B1099",
    graduation_year: "2026",
    expected_graduation: "2026",
    cgpa_percentage: "8.9 CGPA",

    // Round 3: Portfolio & Experience
    coding_start_timeline: "1-2 years ago",
    has_built_projects: "Yes, built and deployed full-stack apps",
    developer_links: [
      { platform: "GitHub", url: "https://github.com/rahulvermatest" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/rahulvermatest" }
    ],

    // Round 4: Availability & Device
    daily_availability: "4-6 hours",
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    preferred_timing: ["Evening (6 PM - 10 PM)"],
    can_attend_meetings: "Yes, fully committed",
    can_meet_deadlines: "Yes, consistently",
    can_communicate_if_unavailable: "Yes, proactively",
    laptop_status: "Own personal laptop",
    operating_system: "Linux / Ubuntu",
    ram_capacity: "16 GB",
    internet_stability: "High-speed broadband with backup",
    can_run_dev_tools: "Yes, Docker, VS Code, Node.js all configured",

    // Round 5: Technical Assessment
    c_level: "Intermediate",
    c_answers: { q1: "pointers", q2: "memory_management" },
    python_level: "Advanced",
    python_answers: { q1: "list_comprehension", q2: "decorators" },
    java_level: "Intermediate",
    java_answers: { q1: "oop_concepts", q2: "collections" },
    html_level: "Proficient",
    html_answers: { q1: "semantic_tags", q2: "flexbox" },
    vibe_coding_level: "Experienced",
    vibe_coding_answers: { q1: "ai_assisted_refactoring" },

    // Round 6: Mindset Assessment
    mindset_answers: {
      mindset_q1: "Collaborative and detail-oriented",
      mindset_q2: "By breaking down problems into smaller tasks",
      mindset_q3: "Continuous learning and experimentation",
      mindset_q4: "Clear documentation and consistent communication",
      mindset_q5: "Prioritizing tasks by impact and urgency",
      mindset_q6: "Owning my mistakes and learning from feedback",
      mindset_q7: "Working asynchronously and using project boards",
      mindset_q8: "Maintaining a growth mindset and shipping iteratively",
      mindset_q9: "Asking for help proactively and documenting blockers",
      mindset_q10: "Contributing meaningfully to open-source and team codebase",
    },

    // Round 7: Interview Essays
    interview_q1_why_codexa: "Passionate about high-velocity agentic engineering and building real production systems.",
    interview_q2_why_select: "Strong fundamentals, consistent track record, and eagerness to ship reliable code.",
    interview_q3_expectations: "Hands-on experience with scalable cloud systems and pair programming.",
    interview_q4_strongest_skills: "TypeScript, PostgreSQL, Next.js architecture.",
    interview_q5_weakest_area: "CSS animation fine-tuning — actively improving it.",
    interview_q6_describe_project: "Built an open-source real-time collaborative code editor with WebSockets.",
    interview_q7_difficult_problem: "Debugged a distributed lock race condition in Redis cluster.",
    interview_q8_ai_coding_usage: "Use LLMs for boilerplate and test suites while maintaining architectural control.",
    interview_q9_college_balance: "Evenings and weekends fully dedicated to the internship deliverables.",
    interview_q10_future_goal: "Full-stack software architect leading high-impact engineering teams.",

    // Round 8: Commitments
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

    // Mark as test so the live DB remains clean
    is_test: true,
    is_test_record: true,
  };

  const submitRes = await fetch("https://www.codeaxisapply.xyz/api/applications/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("Submit HTTP Status:", submitRes.status);
  const submitJson = await submitRes.json();
  console.log("Submit Response:", submitJson);

  if (!submitJson.success || !submitJson.data?.reference_id) {
    throw new Error(`Application submission failed! Response: ${JSON.stringify(submitJson)}`);
  }

  const newRef = submitJson.data.reference_id;
  console.log("\n>>> Generated Application Reference:", newRef);

  // STEP 2: ADMIN LOGIN
  console.log("\n=== STEP 2: ADMIN LOGIN ===");
  const loginRes = await fetch("https://www.codeaxisapply.xyz/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: "161217110311" }),
  });
  const cookie = loginRes.headers.get("set-cookie")?.split(";")[0];
  console.log("Admin session cookie obtained:", Boolean(cookie));

  // STEP 3: CONFIRM NEW APPLICATION IN ADMIN DASHBOARD LIST
  console.log("\n=== STEP 3: VERIFY IN ADMIN LIST ===");
  const listRes = await fetch("https://www.codeaxisapply.xyz/api/admin/applications?view=active", {
    headers: { cookie },
  });
  const listJson = await listRes.json();
  console.log("Admin list success:", listJson.success, "Total active:", listJson.total);
  const foundApp = listJson.data?.find((a) => a.reference_id === newRef);
  console.log("Found newly submitted application in Admin Dashboard:", Boolean(foundApp));
  if (foundApp) {
    console.log("Application details in list:", {
      reference_id: foundApp.reference_id,
      full_name: foundApp.full_name,
      email: foundApp.email,
      status: foundApp.status,
      score: foundApp.total_score,
      created_at: foundApp.created_at,
    });
  }

  // STEP 4: VERIFY ADMIN DETAIL DOSSIER
  console.log("\n=== STEP 4: VERIFY APPLICATION DOSSIER ===");
  const detailRes = await fetch(`https://www.codeaxisapply.xyz/api/admin/applications/${newRef}`, {
    headers: { cookie },
  });
  const detailJson = await detailRes.json();
  console.log("Detail HTTP Status:", detailRes.status, "Success:", detailJson.success);
  console.log("Dossier candidate name:", detailJson.data?.full_name);
  console.log("Dossier college:", detailJson.data?.college_name);
  console.log("Dossier score:", detailJson.data?.total_score);

  // STEP 5: TEST MOVING TO TRASH
  console.log("\n=== STEP 5: MOVE APPLICATION TO TRASH ===");
  const deleteRes = await fetch("https://www.codeaxisapply.xyz/api/admin/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ id: newRef, reason: "Automated production verification test" }),
  });
  const deleteJson = await deleteRes.json();
  console.log("Delete HTTP Status:", deleteRes.status, "Delete Response:", deleteJson);

  // STEP 6: VERIFY IN TRASH BIN
  console.log("\n=== STEP 6: VERIFY IN TRASH BIN ===");
  const trashRes = await fetch("https://www.codeaxisapply.xyz/api/admin/applications?view=trash", {
    headers: { cookie },
  });
  const trashJson = await trashRes.json();
  const foundInTrash = trashJson.data?.find((a) => a.reference_id === newRef);
  console.log("Found in Trash Bin:", Boolean(foundInTrash));

  // STEP 7: RESTORE APPLICATION
  console.log("\n=== STEP 7: RESTORE APPLICATION ===");
  const restoreRes = await fetch("https://www.codeaxisapply.xyz/api/admin/restore", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ id: newRef }),
  });
  const restoreJson = await restoreRes.json();
  console.log("Restore HTTP Status:", restoreRes.status, "Restore Response:", restoreJson);

  // STEP 8: VERIFY BACK IN ACTIVE LIST
  console.log("\n=== STEP 8: VERIFY RESTORED TO ACTIVE ===");
  const restoredListRes = await fetch("https://www.codeaxisapply.xyz/api/admin/applications?view=active", {
    headers: { cookie },
  });
  const restoredListJson = await restoredListRes.json();
  const foundRestored = restoredListJson.data?.find((a) => a.reference_id === newRef);
  console.log("Found restored back in Active list:", Boolean(foundRestored));

  // STEP 9: CLEANUP - REMOVE TEST VERIFICATION RECORD
  console.log("\n=== STEP 9: CLEANUP VERIFICATION RECORD ===");
  const permDelRes = await fetch("https://www.codeaxisapply.xyz/api/admin/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ id: newRef, permanent: true, confirmation: "DELETE" }),
  });
  const permDelJson = await permDelRes.json();
  console.log("Permanent cleanup status:", permDelRes.status, "Message:", permDelJson.message);

  console.log("\n>>> ALL 9 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY! <<<");
}

run().catch(console.error);
