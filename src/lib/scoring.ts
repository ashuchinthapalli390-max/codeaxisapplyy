import { ApplicationData } from "@/types/application";

// Scoring keys for Mindset Assessment
const MINDSET_KEYS: Record<string, string> = {
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
};

// MCQ Answer keys for Step 7 Coding Awareness
const CODING_KEYS: Record<string, string> = {
  python_q1: "B", // 2 ** 3 = 8
  python_q2: "C", // Indentation
  java_q1: "B", // public static void main
  java_q2: "B", // extends
  js_ts_q1: "C", // const
  js_ts_q2: "C", // object
  webstack_q1: "C", // <video>
  webstack_q2: "C", // color
  vibe_coding_q1: "B", // Guiding AI using high-level concepts
  vibe_coding_q2: "B", // Inspect, test and iterate
  ai_prompting_q1: "A", // Giving examples
  ai_prompting_q2: "B", // Chain-of-thought
  github_projects_q1: "B", // git commit
  github_projects_q2: "B", // PR merge request
};

export interface ScoreReport {
  mindset_score: number;
  coding_awareness_score: number;
  profile_completion_score: number;
  written_quality_score: number;
  total_score: number;
  auto_status: "Auto Selected" | "Strong Shortlist" | "Pending Review" | "Low Priority Review";
}

export function calculateScores(data: Partial<ApplicationData>): ScoreReport {
  // 1. Mindset Score (Max 45)
  let correctMindsetCount = 0;
  Object.keys(MINDSET_KEYS).forEach((key) => {
    if (data[key as keyof ApplicationData] === MINDSET_KEYS[key]) {
      correctMindsetCount++;
    }
  });
  const mindset_score = Math.round(((correctMindsetCount / 10) * 45) * 10) / 10;

  // 2. Coding Awareness Score (Max 35)
  // 7 topics: python, java, js_ts, webstack, vibe_coding, ai_prompting, github_projects
  // Max 5 points per topic
  const topics = ["python", "java", "js_ts", "webstack", "vibe_coding", "ai_prompting", "github_projects"];
  let coding_awareness_score = 0;

  topics.forEach((topic) => {
    const awarenessVal = data[`${topic}_awareness` as keyof ApplicationData];
    const q1Val = data[`${topic}_q1` as keyof ApplicationData];
    const q2Val = data[`${topic}_q2` as keyof ApplicationData];

    let topicScore = 0;

    if (awarenessVal === "No, but I want to learn") {
      topicScore = 1.5; // base appreciation points
    } else if (awarenessVal === "Little bit") {
      topicScore = 2; // base
      if (q1Val === CODING_KEYS[`${topic}_q1`]) topicScore += 1.5;
      if (q2Val === CODING_KEYS[`${topic}_q2`]) topicScore += 1.5;
    } else if (awarenessVal === "Yes") {
      topicScore = 3; // base
      if (q1Val === CODING_KEYS[`${topic}_q1`]) topicScore += 1;
      if (q2Val === CODING_KEYS[`${topic}_q2`]) topicScore += 1;
    }

    coding_awareness_score += topicScore;
  });
  coding_awareness_score = Math.round(coding_awareness_score * 10) / 10;

  // 3. Profile Completion Score (Max 10)
  // Optional fields: whatsapp_number, discord_username, github_link, portfolio_link, linkedin_link
  let profileCompletion = 0;
  if (data.whatsapp_number && data.whatsapp_number.trim().length > 0) profileCompletion += 2.5;
  if (data.discord_username && data.discord_username.trim().length > 0) profileCompletion += 2.5;
  if (data.github_link && data.github_link.trim().length > 0) profileCompletion += 1.67;
  if (data.portfolio_link && data.portfolio_link.trim().length > 0) profileCompletion += 1.67;
  if (data.linkedin_link && data.linkedin_link.trim().length > 0) profileCompletion += 1.66;
  const profile_completion_score = Math.round(profileCompletion * 10) / 10;

  // 4. Written Quality Score (Max 10)
  // 5 essays: failure_experience_answer, trust_with_tools_answer, priority_answer, not_selected_answer, code_understanding_answer
  // Max 2 points per essay based on length/completeness
  const essays = [
    "failure_experience_answer",
    "trust_with_tools_answer",
    "priority_answer",
    "not_selected_answer",
    "code_understanding_answer",
  ];
  let writtenScore = 0;
  essays.forEach((essay) => {
    const text = (data[essay as keyof ApplicationData] as string) || "";
    const len = text.trim().length;
    if (len > 80) {
      writtenScore += 2;
    } else if (len >= 30) {
      writtenScore += 1.5;
    } else if (len >= 10) {
      writtenScore += 1;
    }
  });
  const written_quality_score = Math.round(writtenScore * 10) / 10;

  // Total Score (Max 100)
  const total_score = Math.round((mindset_score + coding_awareness_score + profile_completion_score + written_quality_score) * 10) / 10;

  // Auto Status Category
  let auto_status: ScoreReport["auto_status"] = "Low Priority Review";
  if (total_score >= 85) {
    auto_status = "Auto Selected";
  } else if (total_score >= 70) {
    auto_status = "Strong Shortlist";
  } else if (total_score >= 55) {
    auto_status = "Pending Review";
  }

  return {
    mindset_score,
    coding_awareness_score,
    profile_completion_score,
    written_quality_score,
    total_score,
    auto_status,
  };
}
