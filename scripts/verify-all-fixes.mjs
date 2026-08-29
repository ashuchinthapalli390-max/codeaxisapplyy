import http from "http";

console.log("==================================================");
console.log("CODEXA APPLY - AUDIT & VERIFICATION TEST SUITE");
console.log("==================================================");

// We will verify the core modules directly via node imports
async function runVerification() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Verify Scoring Logic
    const { calculateApplicationScores } = await import("../src/lib/scoring.ts");
    const testApp = {
      full_name: "Test Developer",
      email: "test@codxa-agency.online",
      c_level: "I Don't Know",
      python_level: "I Don't Know",
      java_level: "I Don't Know",
      html_level: "I Don't Know",
      vibe_coding_level: "Never Used",
      daily_availability: "3-4 hours/day",
      can_attend_meetings: "Yes",
      can_meet_deadlines: "Yes",
      can_communicate_if_unavailable: "Yes",
      interview_q1_why_codexa: "I want to build production systems and learn practical AI coding workflows.",
      interview_q2_why_select: "I am honest, consistent, and dedicate daily focused hours to shipping software.",
      interview_q3_expectations: "Mentorship, realistic deadlines, and experience with modern deployment tools.",
      interview_q4_strongest_skills: "Fast learner, disciplined work ethics, and great debugging patience.",
      interview_q5_weakest_area: "Advanced algorithms, which I am actively practicing and improving.",
      interview_q6_describe_project: "Built a responsive portfolio with clean semantic HTML and modern CSS.",
      interview_q7_difficult_problem: "Debugged cross-browser layout shifts using Chrome developer devtools.",
      interview_q8_ai_coding_usage: "Using Claude and cursor for code scaffolding and understanding errors.",
      interview_q9_college_balance: "Allocating 2 hours every morning and 2 hours in the late evening daily.",
      interview_q10_future_goal: "Become a proficient full-stack software engineer within 2 years.",
      mindset_answers: {
        mindset_q1: "B",
        mindset_q2: "B",
        mindset_q3: "B",
        mindset_q4: "B",
        mindset_q5: "B",
        mindset_q6: "B",
        mindset_q7: "B",
        mindset_q8: "B",
        mindset_q9: "B",
        mindset_q10: "B",
      },
    };

    const scores = calculateApplicationScores(testApp);
    assert(scores.total_score > 0, `Scoring computed successfully: ${scores.total_score}/100 (Band: ${scores.score_band})`);
    assert(scores.genuineness_integrity_score > 0, "Genuineness & integrity score computed");
    assert(scores.commitment_continuity_score > 0, "Commitment score computed");

    // 2. Verify Integrity Clipboard Whitelist
    const { isFieldClipboardAllowed, MAX_CLIPBOARD_WARNINGS } = await import("../src/lib/integrity.ts");
    assert(isFieldClipboardAllowed("githubUrl") === true, "githubUrl is allowed for clipboard");
    assert(isFieldClipboardAllowed("linkedinUrl") === true, "linkedinUrl is allowed for clipboard");
    assert(isFieldClipboardAllowed("portfolio_website") === true, "portfolio_website is allowed for clipboard");
    assert(isFieldClipboardAllowed("full_name") === false, "full_name is restricted from clipboard");
    assert(isFieldClipboardAllowed("interview_q1_why_codexa") === false, "essay question is restricted from clipboard");
    assert(MAX_CLIPBOARD_WARNINGS === 5, "Max clipboard warnings threshold is 5");

    // 3. Verify Validation Rules
    const { validateRound, validateAllRounds } = await import("../src/lib/validation.ts");
    const round1Valid = validateRound(1, {
      full_name: "Ashu Candidate",
      date_of_birth: "2003-05-12",
      email: "ashu@example.com",
      phone_number: "9876543210",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
    });
    assert(Object.keys(round1Valid).length === 0, "Round 1 validation passes with valid required fields");

    const round5Skip = validateRound(5, {
      c_level: "I Don't Know",
      python_level: "I Don't Know",
      java_level: "I Don't Know",
      html_level: "I Don't Know",
      vibe_coding_level: "Never Used",
    });
    assert(Object.keys(round5Skip).length === 0, "Round 5 validation passes when selecting 'I Don't Know' without quiz errors");

    // 4. Verify Master Key Auth
    const { verifyAdminMasterKey } = await import("../src/lib/admin/verify-master-key.ts");
    const defaultAuth = verifyAdminMasterKey("CODEXA-ADMIN-2026");
    assert(defaultAuth === true, "Master key verification succeeds with default passkey");

    console.log("--------------------------------------------------");
    console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Verification execution error:", err);
    process.exit(1);
  }
}

runVerification();
