import { randomBytes } from "node:crypto";

/**
 * Format reference ID according to numeric sequence standard: CXA-YYYYMMM-000001
 */
export function formatReferenceId(batchCode: string, sequenceNumber: number): string {
  const cleanBatch = (batchCode || "2026-SEP").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const padded = String(sequenceNumber).padStart(6, "0");
  return `CXA-${cleanBatch}-${padded}`;
}

/**
 * Generates an unpredictable, cryptographically random, collision-resistant reference code.
 * Uses high-entropy Crockford-style Base32 characters (avoiding ambiguous 0/O, 1/I).
 * Format: CXA-{BATCH}-{6 ALPHANUMERIC CHARACTERS}
 * Examples: CXA-2026SEP-H7KJ9X, CXA-2026SEP-M4T9P2
 */
const BASE32_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateReferenceId(batchCode: string = "2026-SEP"): string {
  const cleanBatch = (batchCode || "2026-SEP").toUpperCase().replace(/[^A-Z0-9]/g, "") || "2026SEP";
  const bytes = randomBytes(6);
  let randomSuffix = "";
  for (let i = 0; i < 6; i++) {
    randomSuffix += BASE32_ALPHABET[bytes[i] % BASE32_ALPHABET.length];
  }
  return `CXA-${cleanBatch}-${randomSuffix}`;
}
