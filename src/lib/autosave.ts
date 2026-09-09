import { ApplicationData } from "@/types/application";

const PREFIX = "codexa:application-draft:v2:";
const ACTIVE_DRAFT_SESSION_KEY = "codexa:active_draft_id";

/**
 * Generates a cryptographically random client draft identifier.
 */
export function generateDraftId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Retrieves the current session's active draft ID, or assigns a new one.
 */
export function getActiveSessionDraftId(createIfMissing = true): string | null {
  if (typeof window === "undefined") return null;

  try {
    let id = sessionStorage.getItem(ACTIVE_DRAFT_SESSION_KEY);
    if (!id && createIfMissing) {
      id = generateDraftId();
      sessionStorage.setItem(ACTIVE_DRAFT_SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function setActiveSessionDraftId(draftId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ACTIVE_DRAFT_SESSION_KEY, draftId);
  } catch {}
}

export function clearActiveSessionDraftId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ACTIVE_DRAFT_SESSION_KEY);
  } catch {}
}

/**
 * Purges legacy unscoped global draft keys to prevent accidental preloading across applicants.
 */
export function purgeLegacyDrafts(): void {
  if (typeof window === "undefined") return;

  const legacyKeys = [
    "codexa_application_draft",
    "codeaxis_application_draft",
    "codexa_last_submitted_app",
    "codeaxis_application_step",
    "codeaxis_application_started",
    "codeaxis_draft_updated_at",
  ];

  for (const key of legacyKeys) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Saves draft scoped exclusively to its specific namespaced draft ID.
 */
export function saveDraft(
  draftId: string,
  data: Partial<ApplicationData>,
  currentRound: number
): void {
  if (typeof window === "undefined" || !draftId) return;

  try {
    const key = `${PREFIX}${draftId}`;
    const payload = {
      draftId,
      data,
      currentRound,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to persist draft to localStorage:", err);
  }
}

/**
 * Loads a draft by its exact namespaced draft ID.
 */
export function loadDraft(draftId: string): {
  draftId: string;
  data: Partial<ApplicationData>;
  currentRound: number;
  updatedAt: string | null;
} | null {
  if (typeof window === "undefined" || !draftId) return null;

  try {
    const key = `${PREFIX}${draftId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      draftId: parsed.draftId || draftId,
      data: parsed.data || {},
      currentRound: parsed.currentRound || 1,
      updatedAt: parsed.updatedAt || null,
    };
  } catch (err) {
    console.warn("Failed to load draft from localStorage:", err);
    return null;
  }
}

/**
 * Safely deletes only the specified draft ID. Never clears unrelated drafts.
 */
export function clearDraft(draftId: string): void {
  if (typeof window === "undefined" || !draftId) return;

  try {
    const key = `${PREFIX}${draftId}`;
    localStorage.removeItem(key);
    const active = sessionStorage.getItem(ACTIVE_DRAFT_SESSION_KEY);
    if (active === draftId) {
      sessionStorage.removeItem(ACTIVE_DRAFT_SESSION_KEY);
    }
  } catch (err) {
    console.warn("Failed to clear draft from localStorage:", err);
  }
}

/**
 * Scans for an existing draft for explicit user confirmation.
 */
export function findExistingDraft(): {
  draftId: string;
  data: Partial<ApplicationData>;
  currentRound: number;
  updatedAt: string | null;
} | null {
  if (typeof window === "undefined") return null;

  // Check active session strictly (never scan across arbitrary localStorage keys)
  const activeId = sessionStorage.getItem(ACTIVE_DRAFT_SESSION_KEY);
  if (activeId) {
    const activeDraft = loadDraft(activeId);
    if (activeDraft && (activeDraft.data.full_name || activeDraft.data.email || activeDraft.currentRound > 1)) {
      return activeDraft;
    }
  }

  return null;
}
