import { ApplicationData, SkillLevel } from "@/types/application";

// Mindset Assessment Answer Keys (B is builder/humble/responsible)
export const MINDSET_ANSWER_KEYS: Record<string, string> = {
  mindset_q1: "B", // Ask for help, understand mistakes, try again
  mindset_q2: "B", // Use AI to learn, debug, improve own work
  mindset_q3: "B", // Help teammates and keep progress smooth
  mindset_q4: "B", // Test it, understand it, mention AI help
  mindset_q5: "A", // Inform team early and ask for support
  mindset_q6: "B", // Search, try, ask doubts, practice
  mindset_q7: "B", // Learn seriously and build real projects
  mindset_q8: "B", // Report bug clearly and try to fix it
  mindset_q9: "A", // Stay humble and focus on learning
  mindset_q10: "B", // Use code only for assigned learning/work
};

// Adaptive Coding Quiz Correct Keys
export const TECHNICAL_QUIZ_KEYS: Record<string, string> = {
  // C
  c_q1: "A", // #include <stdio.h>
  c_q2: "B", // int main()
  c_q3: "C", // pointer operator *
  c_q4: "B", // malloc allocated on heap
  c_q5: "A", // free() prevents memory leaks

  // Python
  python_q1: "B", // 2 ** 3 = 8
  python_q2: "C", // Indentation
  python_q3: "A", // def keyword
  python_q4: "C", // list is mutable, tuple immutable
  python_q5: "B", // [x for x in list if condition]

  // Java
  java_q1: "B", // public static void main
  java_q2: "B", // extends keyword
  java_q3: "C", // JVM runs bytecode
  java_q4: "A", // Garbage collection handles memory
  java_q5: "C", // Interface multiple inheritance

  // HTML
  html_q1: "C", // <video>
  html_q2: "C", // color property
  html_q3: "B", // Semantic elements improve SEO & accessibility
  html_q4: "A", // flexbox display: flex
  html_q5: "D", // <meta name="viewport">

  // Vibe Coding
  vibe_q1: "B", // Steering AI models with architecture & clean prompts
  vibe_q2: "B", // Inspect, test, and iterate on runtime blocks
  vibe_q3: "A", // Providing clear context and expected outputs
  vibe_q4: "C", // Modular components with type safety
  vibe_q5: "B", // Git branch workflow with AI code review
};

export interface ScoreBreakdown {
  genuineness_integrity_score: number;
  commitment_continuity_score: number;
  mindset_habits_score: number;
  technical_knowledge_score: number;
  learning_potential_score: number;
  interview_communication_score: number;
  total_score: number;
  score_band: "Exceptional Profile" | "Strong Candidate" | "Good Potential" | "Needs Review" | "Detailed Human Review";
  commitment_signal: "Strong" | "Moderate" | "Needs Review";
  skill_authenticity: {
    c: "Consistent" | "Needs Review" | "Skipped";
    python: "Consistent" | "Needs Review" | "Skipped";
    java: "Consistent" | "Needs Review" | "Skipped";
    html: "Consistent" | "Needs Review" | "Skipped";
    vibe_coding: "Consistent" | "Needs Review" | "Skipped";
    overall: "High" | "Moderate" | "Needs Review";
  };
}

export function calculateApplicationScores(data: Partial<ApplicationData>): ScoreBreakdown {
  // 1. Genuineness & Integrity (Max 25 pts)
  let integrityScore = 25;
  const pasteCount = data.copy_paste_warnings_count || 0;
  if (pasteCount === 1) integrityScore -= 2;
  if (pasteCount === 2) integrityScore -= 5;
  if (pasteCount >= 3) integrityScore -= 10;

  const tabSwitches = data.tab_switch_count || 0;
  if (tabSwitches > 5) integrityScore -= 3;
  else if (tabSwitches > 2) integrityScore -= 1;

  // Bonus for honest answers & complete agreements
  if (data.commitment_accurate_info && data.commitment_independent_work) {
    // verified
  }
  integrityScore = Math.max(10, Math.min(25, integrityScore));

  // 2. Commitment & Continuity Signal (Max 25 pts)
  let commitmentScore = 0;
  // Daily availability
  if (data.daily_availability === "4+ hours") commitmentScore += 7;
  else if (data.daily_availability === "3–4 hours") commitmentScore += 6;
  else if (data.daily_availability === "2–3 hours") commitmentScore += 5;
  else if (data.daily_availability === "1–2 hours") commitmentScore += 3.5;
  else commitmentScore += 2;

  // Available days count
  const daysCount = (data.available_days || []).length;
  if (daysCount >= 6) commitmentScore += 5;
  else if (daysCount >= 4) commitmentScore += 4;
  else if (daysCount >= 2) commitmentScore += 2.5;
  else commitmentScore += 1.5;

  // Meeting readiness & deadlines
  if (data.can_attend_meetings === "Yes") commitmentScore += 4;
  else if (data.can_attend_meetings === "Most of the time") commitmentScore += 3;
  else commitmentScore += 1;

  if (data.can_meet_deadlines === "Yes") commitmentScore += 4;
  else if (data.can_meet_deadlines === "Usually") commitmentScore += 3;
  else commitmentScore += 1;

  if (data.can_communicate_if_unavailable === "Yes, always") commitmentScore += 3;
  else commitmentScore += 1.5;

  // Intent on college balance
  if (data.interview_q9_college_balance && data.interview_q9_college_balance.trim().length > 40) {
    commitmentScore += 2;
  }
  commitmentScore = Math.min(25, Math.round(commitmentScore * 10) / 10);

  // 3. Mindset & Work Habits (Max 20 pts)
  // 10 MCQs, 2 pts each
  let mindsetScore = 0;
  const mindsetAnswers = data.mindset_answers || {};
  Object.keys(MINDSET_ANSWER_KEYS).forEach((k) => {
    if (mindsetAnswers[k] === MINDSET_ANSWER_KEYS[k]) {
      mindsetScore += 2;
    }
  });
  mindsetScore = Math.min(20, mindsetScore);

  // 4. Technical Knowledge (Max 15 pts)
  // 5 topics: C, Python, Java, HTML, Vibe Coding
  // Max 3 pts per topic
  const evaluateTopic = (
    level: SkillLevel | string | undefined,
    answers: Record<string, string> | undefined,
    prefix: string
  ): { score: number; authenticity: "Consistent" | "Needs Review" | "Skipped" } => {
    if (!level || level === "I Don't Know" || level === "Never Used") {
      return { score: 1.5, authenticity: "Skipped" }; // Base reward for honesty without penalty
    }

    const ans = answers || {};
    let correct = 0;
    let expected = 2;
    if (level === "Learner" || level === "Learning") expected = 2;
    else if (level === "Basic") expected = 3;
    else if (level === "Average") expected = 4;
    else if (level === "Expert" || level === "Advanced") expected = 5;

    for (let i = 1; i <= expected; i++) {
      const qKey = `${prefix}_q${i}`;
      if (ans[qKey] === TECHNICAL_QUIZ_KEYS[qKey]) {
        correct++;
      }
    }

    const ratio = expected > 0 ? correct / expected : 0;
    let topicScore = 1.5 + ratio * 1.5; // range 1.5 to 3.0

    let authenticity: "Consistent" | "Needs Review" | "Skipped" = "Consistent";
    if ((level === "Expert" || level === "Advanced") && ratio < 0.3) {
      authenticity = "Needs Review";
    } else if (level === "Average" && ratio < 0.25) {
      authenticity = "Needs Review";
    }

    return { score: Math.min(3, topicScore), authenticity };
  };

  const cEval = evaluateTopic(data.c_level, data.c_answers, "c");
  const pyEval = evaluateTopic(data.python_level, data.python_answers, "python");
  const javaEval = evaluateTopic(data.java_level, data.java_answers, "java");
  const htmlEval = evaluateTopic(data.html_level, data.html_answers, "html");
  const vibeEval = evaluateTopic(data.vibe_coding_level, data.vibe_coding_answers, "vibe");

  const technicalScore = Math.min(
    15,
    Math.round((cEval.score + pyEval.score + javaEval.score + htmlEval.score + vibeEval.score) * 10) / 10
  );

  // 5. Learning Potential (Max 10 pts)
  let learningScore = 5; // base
  if (data.coding_start_timeline) learningScore += 1;
  if (data.has_built_projects && data.has_built_projects !== "No, none") learningScore += 1.5;
  if ((data.projects || []).length > 0) learningScore += 1.5;
  if (data.interview_q8_ai_coding_usage && data.interview_q8_ai_coding_usage.trim().length > 30) {
    learningScore += 1;
  }
  learningScore = Math.min(10, Math.round(learningScore * 10) / 10);

  // 6. Interview & Communication (Max 10 pts)
  // 10 questions, each evaluated for depth & clarity
  const essayFields = [
    data.interview_q1_why_codexa,
    data.interview_q2_why_select,
    data.interview_q3_expectations,
    data.interview_q4_strongest_skills,
    data.interview_q5_weakest_area,
    data.interview_q6_describe_project,
    data.interview_q7_difficult_problem,
    data.interview_q8_ai_coding_usage,
    data.interview_q9_college_balance,
    data.interview_q10_future_goal,
  ];

  let interviewScore = 0;
  essayFields.forEach((essay) => {
    const len = (essay || "").trim().length;
    if (len >= 80) interviewScore += 1;
    else if (len >= 40) interviewScore += 0.8;
    else if (len >= 15) interviewScore += 0.5;
    else interviewScore += 0.2;
  });
  interviewScore = Math.min(10, Math.round(interviewScore * 10) / 10);

  // Total Score (Max 100)
  const total_score = Math.round(
    (integrityScore + commitmentScore + mindsetScore + technicalScore + learningScore + interviewScore) * 10
  ) / 10;

  // Score Bands
  let score_band: ScoreBreakdown["score_band"] = "Detailed Human Review";
  if (total_score >= 85) score_band = "Exceptional Profile";
  else if (total_score >= 75) score_band = "Strong Candidate";
  else if (total_score >= 65) score_band = "Good Potential";
  else if (total_score >= 50) score_band = "Needs Review";

  // Commitment Signal
  let commitment_signal: ScoreBreakdown["commitment_signal"] = "Needs Review";
  if (commitmentScore >= 20) commitment_signal = "Strong";
  else if (commitmentScore >= 14) commitment_signal = "Moderate";

  // Overall Authenticity
  const reviewCount = [
    cEval.authenticity,
    pyEval.authenticity,
    javaEval.authenticity,
    htmlEval.authenticity,
    vibeEval.authenticity,
  ].filter((a) => a === "Needs Review").length;

  let overallAuth: "High" | "Moderate" | "Needs Review" = "High";
  if (reviewCount >= 2) overallAuth = "Needs Review";
  else if (reviewCount === 1) overallAuth = "Moderate";

  return {
    genuineness_integrity_score: integrityScore,
    commitment_continuity_score: commitmentScore,
    mindset_habits_score: mindsetScore,
    technical_knowledge_score: technicalScore,
    learning_potential_score: learningScore,
    interview_communication_score: interviewScore,
    total_score,
    score_band,
    commitment_signal,
    skill_authenticity: {
      c: cEval.authenticity,
      python: pyEval.authenticity,
      java: javaEval.authenticity,
      html: htmlEval.authenticity,
      vibe_coding: vibeEval.authenticity,
      overall: overallAuth,
    },
  };
}
