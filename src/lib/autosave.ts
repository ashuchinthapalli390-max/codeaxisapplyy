import { ApplicationData } from "@/types/application";

const KEYS = {
  DRAFT: "codeaxis_application_draft",
  STEP: "codeaxis_application_step",
  STARTED: "codeaxis_application_started",
  UPDATED_AT: "codeaxis_draft_updated_at",
};

export function saveDraft(data: Partial<ApplicationData>, step: number, started: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(KEYS.DRAFT, JSON.stringify(data));
    localStorage.setItem(KEYS.STEP, step.toString());
    localStorage.setItem(KEYS.STARTED, started ? "true" : "false");
    localStorage.setItem(KEYS.UPDATED_AT, new Date().toISOString());
  } catch (err) {
    console.error("Failed to save draft to localStorage:", err);
  }
}

export function loadDraft(): {
  data: Partial<ApplicationData>;
  step: number;
  started: boolean;
  updatedAt: string | null;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const draftStr = localStorage.getItem(KEYS.DRAFT);
    const stepStr = localStorage.getItem(KEYS.STEP);
    const startedStr = localStorage.getItem(KEYS.STARTED);
    const updatedAt = localStorage.getItem(KEYS.UPDATED_AT);

    if (!draftStr) return null;

    return {
      data: JSON.parse(draftStr) as Partial<ApplicationData>,
      step: stepStr ? parseInt(stepStr, 10) : 1,
      started: startedStr === "true",
      updatedAt,
    };
  } catch (err) {
    console.error("Failed to load draft from localStorage:", err);
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(KEYS.DRAFT);
    localStorage.removeItem(KEYS.STEP);
    localStorage.removeItem(KEYS.STARTED);
    localStorage.removeItem(KEYS.UPDATED_AT);
  } catch (err) {
    console.error("Failed to clear draft from localStorage:", err);
  }
}
