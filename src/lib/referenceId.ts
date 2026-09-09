
/**
 * Format reference ID according to canonical standard: CXA-YYYYMMM-000001
 */
export function formatReferenceId(batchCode: string, sequenceNumber: number): string {
  const cleanBatch = (batchCode || "2026-SEP").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const padded = String(sequenceNumber).padStart(6, "0");
  return `CXA-${cleanBatch}-${padded}`;
}

/**
 * Generates a collision-resistant deterministic fallback reference ID strictly for
 * offline local development when Supabase database is unconfigured.
 * In production, reference generation MUST happen atomically via PostgreSQL sequence.
 */
let localSequence = 1000;

export function generateReferenceId(batchCode: string = "2026-SEP"): string {
  localSequence += 1;
  return formatReferenceId(batchCode, localSequence);
}
