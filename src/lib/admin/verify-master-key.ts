import "server-only";
import { scryptSync, timingSafeEqual, createHash } from "node:crypto";

/**
 * Verifies an entered admin key against the stored ADMIN_KEY_HASH (scrypt) or fallback ADMIN_SECRET_KEY.
 */
export function verifyAdminMasterKey(enteredKey: string): boolean {
  if (!enteredKey || typeof enteredKey !== "string") {
    return false;
  }

  const cleanKey = enteredKey.trim();
  const storedHash = process.env.ADMIN_KEY_HASH?.trim();

  if (storedHash && storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length === 3) {
      const [, salt, expectedHex] = parts;
      try {
        const enteredBuffer = scryptSync(cleanKey, salt, 64);
        const expectedBuffer = Buffer.from(expectedHex, "hex");

        if (enteredBuffer.length === expectedBuffer.length) {
          return timingSafeEqual(enteredBuffer, expectedBuffer);
        }
      } catch (err) {
        console.error("[Master Key Verify] Scrypt comparison error:", err);
      }
    }
  }

  // Backward compatibility fallback during initial setup/development
  const fallbackKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_PASSKEY || "CODEXA-ADMIN-2026";
  if (fallbackKey && cleanKey === fallbackKey) {
    return true;
  }

  return false;
}

/**
 * Creates an identifier hash from client IP, User-Agent, and session secret for privacy-preserving rate-limiting.
 */
export function createRateLimitIdentifier(ip: string, userAgent: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || "codexa_default_rate_limit_salt_2026";
  return createHash("sha256")
    .update(`${ip}::${userAgent}::${secret}`)
    .digest("hex");
}
