/**
 * Asia/Kolkata (+05:30) Timezone Utilities
 * Guarantees zero UTC drift or date reset across serverless runs and client edits.
 */

export const INDIA_TIMEZONE = "Asia/Kolkata";
export const INDIA_OFFSET_STRING = "+05:30";

/**
 * Converts any ISO / UTC / Timestamp string into exact Asia/Kolkata date (YYYY-MM-DD) and time (HH:MM)
 */
export function toKolkataDateTimeParts(timestamp?: string | null): { date: string; time: string } | null {
  if (!timestamp || typeof timestamp !== "string" || !timestamp.trim()) {
    return null;
  }

  try {
    const d = new Date(timestamp.trim());
    if (isNaN(d.getTime())) return null;

    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: INDIA_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      hour12: false,
    });

    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    // Ensure 2-digit format
    const year = map.year || "2026";
    const month = map.month || "09";
    const day = map.day || "01";
    let hour = map.hour || "00";
    if (hour === "24") hour = "00";
    const minute = map.minute || "00";

    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`,
    };
  } catch {
    return null;
  }
}

/**
 * Combines entered local date (YYYY-MM-DD) and time (HH:MM) into a TIMESTAMPTZ ISO string with Asia/Kolkata (+05:30) offset.
 */
export function fromKolkataDateTime(dateStr?: string, timeStr?: string, defaultTime = "00:00:00"): string {
  if (!dateStr || !dateStr.trim()) return "";
  const cleanDate = dateStr.trim();
  let cleanTime = timeStr && timeStr.trim() ? timeStr.trim() : defaultTime;
  if (cleanTime.length === 5) {
    cleanTime = `${cleanTime}:00`;
  }
  return `${cleanDate}T${cleanTime}+05:30`;
}

/**
 * Formats a timestamp into a human-readable India standard time string (e.g. "07 Sep 2026, 11:59 PM IST")
 */
export function formatKolkataDisplay(timestamp?: string | null): string {
  if (!timestamp) return "Not Scheduled";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "Invalid Date";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: INDIA_TIMEZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST";
  } catch {
    return "Invalid Date";
  }
}
