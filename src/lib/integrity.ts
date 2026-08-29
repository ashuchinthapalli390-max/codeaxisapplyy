export const MAX_CLIPBOARD_WARNINGS = 5;

/**
 * Whitelist of field names where Copy / Cut / Paste is explicitly permitted
 * (e.g. GitHub repositories, live demo links, portfolio URLs, social profiles).
 */
export const CLIPBOARD_ALLOWED_FIELDS = new Set([
  "githubUrl",
  "linkedinUrl",
  "portfolioUrl",
  "instagramUrl",
  "websiteUrl",
  "leetcodeUrl",
  "hackerrankUrl",
  "codechefUrl",
  "codeforcesUrl",
  "projectGithubUrl",
  "projectLiveUrl",
  "otherProfileUrl",
  "otherUrl",
  "github_profile",
  "linkedin_profile",
  "portfolio_website",
  "github_link",
  "portfolio_link",
  "linkedin_link",
  "url",
  "liveUrl",
  "link",
]);

/**
 * Determines whether clipboard actions are allowed for a given field.
 */
export function isFieldClipboardAllowed(fieldName?: string, fieldType?: string): boolean {
  if (!fieldName && !fieldType) return false;
  if (fieldType === "url") return true;
  if (!fieldName) return false;

  const lowName = fieldName.toLowerCase();
  if (CLIPBOARD_ALLOWED_FIELDS.has(fieldName) || CLIPBOARD_ALLOWED_FIELDS.has(lowName)) {
    return true;
  }

  if (
    lowName.endsWith("url") ||
    lowName.endsWith("link") ||
    lowName.includes("github") ||
    lowName.includes("linkedin") ||
    lowName.includes("portfolio") ||
    lowName.includes("website") ||
    lowName.includes("instagram") ||
    lowName.includes("leetcode") ||
    lowName.includes("hackerrank") ||
    lowName.includes("codechef") ||
    lowName.includes("codeforces")
  ) {
    return true;
  }

  return false;
}

export interface WarningContent {
  title: string;
  badge: string;
  message: string;
  submessage?: string;
  severity: "info" | "warning" | "danger" | "critical";
}

export const CLIPBOARD_WARNINGS: Record<number, WarningContent> = {
  1: {
    title: "COPY / PASTE WARNING",
    badge: "Warning 1 of 5",
    message: "Copying or pasting is not allowed in this field.",
    submessage: "Please complete the application using your own authentic responses. (Submission is still permitted).",
    severity: "info",
  },
  2: {
    title: "INTEGRITY WARNING",
    badge: "Warning 2 of 5",
    message: "Copy / Paste is restricted during the application assessment.",
    submessage: "Directly type your responses to maintain application integrity. (Submission is still permitted).",
    severity: "warning",
  },
  3: {
    title: "APPLICATION INTEGRITY WARNING",
    badge: "Warning 3 of 5",
    message: "Repeated clipboard activity has been detected.",
    submessage: "Human evaluators review integrity telemetry alongside your scores. (Submission is still permitted).",
    severity: "danger",
  },
  4: {
    title: "FINAL WARNING",
    badge: "Warning 4 of 5",
    message: "One more restricted Copy / Paste attempt will reset your entire application.",
    submessage: "All draft answers and progress will be permanently erased on the 5th attempt. You may still submit now.",
    severity: "critical",
  },
  5: {
    title: "APPLICATION RESET",
    badge: "5 of 5 • Reset Triggered",
    message: "The maximum number of restricted clipboard attempts has been reached.",
    submessage: "Your current application progress and answers have been cleared.",
    severity: "critical",
  },
};

/**
 * Completely clears all local application drafts, session flags, and answers.
 */
export function clearApplicationDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("codexa_application_draft");
    localStorage.removeItem("codexa_rules_accepted");
    sessionStorage.removeItem("codexa_application_draft");
    sessionStorage.removeItem("codexa_rules_accepted");
    sessionStorage.removeItem("codexa_draft_session_id");
  } catch (err) {
    console.error("Failed to clear application storage:", err);
  }
}
