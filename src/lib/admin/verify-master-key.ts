import "server-only";
import { scryptSync, timingSafeEqual, createHash } from "node:crypto";

/**
 * Verifies an entered admin key against the stored ADMIN_KEY_HASH (scrypt) or configured ADMIN_SECRET_KEY / ADMIN_PASSKEY.
 * Strictly avoids any hardcoded passkey strings.
 */
export function verifyAdminMasterKey(enteredKey: string): boolean {
  if (!enteredKey || typeof enteredKey !== "string") {
    return false;
  }

  const cleanKey = enteredKey.trim();
  const storedHash = (process.env.ADMIN_KEY_HASH || "").trim().replace(/^["']|["']$/g, "").trim();
  const saltEnv = (process.env.ADMIN_KEY_SALT || "").trim().replace(/^["']|["']$/g, "").trim();
  const envPasskey = (process.env.ADMIN_SECRET_KEY || process.env.ADMIN_PASSKEY || "").trim().replace(/^["']|["']$/g, "");

  // 1. Check if ADMIN_KEY_SALT and ADMIN_KEY_HASH are stored separately
  if (saltEnv && storedHash && !storedHash.includes("scrypt")) {
    try {
      const enteredBuffer = scryptSync(cleanKey, saltEnv, 64);
      const expectedBuffer = Buffer.from(storedHash, "hex");
      if (enteredBuffer.length === expectedBuffer.length && timingSafeEqual(enteredBuffer, expectedBuffer)) {
        return true;
      }
    } catch (err) {
      console.error("[Master Key Verify] Separate salt scrypt error:", err);
    }
  }

  // 2. Check colon or dollar-delimited format (scrypt:salt:hash or scrypt$salt$hash)
  if (storedHash.startsWith("scrypt:") || storedHash.startsWith("scrypt$")) {
    const delimiter = storedHash.includes(":") ? ":" : "$";
    const parts = storedHash.split(delimiter);
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedHex = parts[2];
      try {
        const enteredBuffer = scryptSync(cleanKey, salt, 64);
        const expectedBuffer = Buffer.from(expectedHex, "hex");
        if (enteredBuffer.length === expectedBuffer.length && timingSafeEqual(enteredBuffer, expectedBuffer)) {
          return true;
        }
      } catch (err) {
        console.error("[Master Key Verify] Scrypt comparison error:", err);
      }
    }
  }

  // 3. Environment-defined Passkey Verification (Strictly requires environment variable, no hardcoded strings)
  if (envPasskey && cleanKey === envPasskey) {
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
