export type ApplicationWindowMode = "AUTO" | "OPEN" | "CLOSED" | "PAUSED";
export type EffectiveApplicationStatus = "OPEN" | "OPENING_SOON" | "CLOSED" | "PAUSED";

export type AvailabilityReasonCode =
  | "OVERRIDE_OPEN"
  | "EXPLICIT_CLOSED"
  | "EXPLICIT_PAUSED"
  | "AUTO_OPEN"
  | "AUTO_BEFORE_WINDOW"
  | "AUTO_AFTER_WINDOW"
  | "CONFIG_UNAVAILABLE";

export interface ApplicationAvailability {
  roundId: string;
  batchCode: string;
  mode: ApplicationWindowMode;
  effectiveStatus: EffectiveApplicationStatus;
  canApply: boolean;
  reasonCode: AvailabilityReasonCode;
  opensAt: string | null;
  closesAt: string | null;
  nextOpensAt: string | null;
  timezone: string;
  serverTimeMs: number;
  isOverride: boolean;
  revision: string;
}

export interface InternshipRoundInput {
  id?: string;
  batch_code?: string;
  status?: string;
  status_override?: string;
  opens_at?: string | null;
  closes_at?: string | null;
  next_opens_at?: string | null;
  timezone?: string;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
}

/**
 * Single Authoritative Server Availability Resolver
 * 
 * Precedence Rules:
 * 1. Missing or inactive round => CLOSED, canApply = false, CONFIG_UNAVAILABLE
 * 2. Explicit CLOSED => CLOSED, canApply = false, EXPLICIT_CLOSED
 * 3. Explicit PAUSED => PAUSED, canApply = false, EXPLICIT_PAUSED
 * 4. Explicit OPEN => OPEN, canApply = true, OVERRIDE_OPEN (isOverride = true)
 * 5. AUTO:
 *    - serverTime < opensAt => OPENING_SOON, canApply = false, AUTO_BEFORE_WINDOW
 *    - serverTime >= closesAt => CLOSED, canApply = false, AUTO_AFTER_WINDOW
 *    - opensAt <= serverTime < closesAt => OPEN, canApply = true, AUTO_OPEN
 */
export function resolveApplicationAvailability(
  round: InternshipRoundInput | null | undefined,
  currentTimeMs: number = Date.now()
): ApplicationAvailability {
  const defaultTz = "Asia/Kolkata";

  if (!round || round.is_active === false) {
    return {
      roundId: round?.id || "unavailable",
      batchCode: round?.batch_code || "2026-SEP",
      mode: "CLOSED",
      effectiveStatus: "CLOSED",
      canApply: false,
      reasonCode: "CONFIG_UNAVAILABLE",
      opensAt: round?.opens_at || null,
      closesAt: round?.closes_at || null,
      nextOpensAt: round?.next_opens_at || null,
      timezone: round?.timezone || defaultTz,
      serverTimeMs: currentTimeMs,
      isOverride: false,
      revision: round?.updated_at || String(currentTimeMs),
    };
  }

  // Normalize mode: check status_override first, then status
  const rawMode = (round.status_override || round.status || "AUTO").toUpperCase().trim();
  const mode: ApplicationWindowMode =
    rawMode === "OPEN"
      ? "OPEN"
      : rawMode === "CLOSED"
      ? "CLOSED"
      : rawMode === "PAUSED"
      ? "PAUSED"
      : "AUTO";

  const roundId = String(round.id || "round-active");
  const batchCode = round.batch_code || "2026-SEP";
  const timezone = round.timezone || defaultTz;
  const revision = round.updated_at || String(currentTimeMs);

  const opensAt = round.opens_at || null;
  const closesAt = round.closes_at || null;
  const nextOpensAt = round.next_opens_at || null;

  const opensAtMs = opensAt ? new Date(opensAt).getTime() : 0;
  const closesAtMs = closesAt ? new Date(closesAt).getTime() : 0;

  if (mode === "CLOSED") {
    return {
      roundId,
      batchCode,
      mode: "CLOSED",
      effectiveStatus: "CLOSED",
      canApply: false,
      reasonCode: "EXPLICIT_CLOSED",
      opensAt,
      closesAt,
      nextOpensAt,
      timezone,
      serverTimeMs: currentTimeMs,
      isOverride: true,
      revision,
    };
  }

  if (mode === "PAUSED") {
    return {
      roundId,
      batchCode,
      mode: "PAUSED",
      effectiveStatus: "PAUSED",
      canApply: false,
      reasonCode: "EXPLICIT_PAUSED",
      opensAt,
      closesAt,
      nextOpensAt,
      timezone,
      serverTimeMs: currentTimeMs,
      isOverride: true,
      revision,
    };
  }

  if (mode === "OPEN") {
    return {
      roundId,
      batchCode,
      mode: "OPEN",
      effectiveStatus: "OPEN",
      canApply: true,
      reasonCode: "OVERRIDE_OPEN",
      opensAt,
      closesAt,
      nextOpensAt,
      timezone,
      serverTimeMs: currentTimeMs,
      isOverride: true,
      revision,
    };
  }

  // AUTO Mode: check window bounds against server clock
  if (opensAtMs > 0 && currentTimeMs < opensAtMs) {
    return {
      roundId,
      batchCode,
      mode: "AUTO",
      effectiveStatus: "OPENING_SOON",
      canApply: false,
      reasonCode: "AUTO_BEFORE_WINDOW",
      opensAt,
      closesAt,
      nextOpensAt,
      timezone,
      serverTimeMs: currentTimeMs,
      isOverride: false,
      revision,
    };
  }

  if (closesAtMs > 0 && currentTimeMs >= closesAtMs) {
    return {
      roundId,
      batchCode,
      mode: "AUTO",
      effectiveStatus: "CLOSED",
      canApply: false,
      reasonCode: "AUTO_AFTER_WINDOW",
      opensAt,
      closesAt,
      nextOpensAt,
      timezone,
      serverTimeMs: currentTimeMs,
      isOverride: false,
      revision,
    };
  }

  return {
    roundId,
    batchCode,
    mode: "AUTO",
    effectiveStatus: "OPEN",
    canApply: true,
    reasonCode: "AUTO_OPEN",
    opensAt,
    closesAt,
    nextOpensAt,
    timezone,
    serverTimeMs: currentTimeMs,
    isOverride: false,
    revision,
  };
}
