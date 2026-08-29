import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  createAdminSession as saveFallbackSession,
  verifyAdminSessionToken as verifyFallbackSession,
  revokeAdminSession as revokeFallbackSession,
  revokeAllOtherAdminSessions as revokeOtherFallbackSessions,
  revokeAllAdminSessions as revokeAllFallbackSessions,
} from "@/lib/storage";

export const SESSION_COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE || "codexa_admin_session";
export const SESSION_DAYS = Number(process.env.ADMIN_SESSION_DAYS || 3650);
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60; // 3650 days (10 years) in seconds

export interface AdminSessionRecord {
  id: string;
  token_hash?: string;
  token?: string;
  device_label?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at?: string | null;
  is_current?: boolean;
}

/**
 * Creates a new cryptographically secure admin session and returns rawToken for the HttpOnly cookie.
 */
export async function createSession(
  ipAddress: string = "127.0.0.1",
  userAgent: string = "Web Browser"
): Promise<{ rawToken: string; expiresAt: Date; maxAge: number }> {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  const sessionId = `sess-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const deviceLabel = userAgent.slice(0, 80);

  // 1. Save to Supabase admin_sessions table if configured
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("admin_sessions").insert({
        id: sessionId,
        token_hash: tokenHash,
        device_label: deviceLabel,
        user_agent: userAgent,
        created_at: now.toISOString(),
        last_seen_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        console.warn("[Session Supabase Insert Warning]:", error.message);
      }
    }
  } catch (supabaseErr) {
    console.warn("[Session Supabase Insert Exception]:", supabaseErr);
  }

  // 2. Always maintain local cache fallback for instant offline/restart resilience
  try {
    await saveFallbackSession({
      id: sessionId,
      token: rawToken,
      deviceInfo: deviceLabel,
      ipAddress,
      lastActive: now.toISOString(),
      createdAt: now.toISOString(),
    });
  } catch (fallbackErr) {
    console.warn("[Session Local Fallback Warning]:", fallbackErr);
  }

  return {
    rawToken,
    expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Validates a raw session token against Supabase and local cache.
 * Implements sliding session renewal if lifetime has less than 7 days remaining.
 */
export async function validateSession(rawToken?: string | null): Promise<{
  isValid: boolean;
  needsRefresh?: boolean;
  session?: AdminSessionRecord;
}> {
  if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
    return { isValid: false };
  }

  const cleanToken = rawToken.trim();
  const tokenHash = createHash("sha256").update(cleanToken).digest("hex");
  const now = new Date();

  // 1. Check Supabase first
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("token_hash", tokenHash)
        .is("revoked_at", null)
        .gt("expires_at", now.toISOString())
        .maybeSingle();

      if (data && !error) {
        // Update last_seen_at
        try {
          await supabase
            .from("admin_sessions")
            .update({ last_seen_at: now.toISOString() })
            .eq("id", data.id);
        } catch {
          // ignore background update error
        }

        // Check sliding expiration (if less than 7 days remaining, flag for refresh)
        const expiryDate = new Date(data.expires_at);
        const daysRemaining = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const needsRefresh = daysRemaining < 7;

        return {
          isValid: true,
          needsRefresh,
          session: data,
        };
      }
    }
  } catch (supabaseErr) {
    console.warn("[Session Supabase Validation Warning]:", supabaseErr);
  }

  // 2. Check local fallback store
  try {
    const isValidLocal = await verifyFallbackSession(cleanToken);
    if (isValidLocal) {
      return {
        isValid: true,
        needsRefresh: false,
        session: {
          id: `local-${cleanToken.slice(0, 8)}`,
          created_at: now.toISOString(),
          last_seen_at: now.toISOString(),
          expires_at: new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000).toISOString(),
        },
      };
    }
  } catch (fallbackErr) {
    console.warn("[Session Local Fallback Validation Error]:", fallbackErr);
  }

  return { isValid: false };
}

/**
 * Server-side helper to read and validate session from request cookies.
 */
export async function getAdminSession(): Promise<{ isValid: boolean; session?: AdminSessionRecord }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const result = await validateSession(token);
    return {
      isValid: result.isValid,
      session: result.session,
    };
  } catch (err) {
    console.error("[getAdminSession Error]:", err);
    return { isValid: false };
  }
}

/**
 * Revokes a single session by raw token.
 */
export async function revokeSessionByToken(rawToken: string): Promise<void> {
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const now = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("admin_sessions")
        .update({ revoked_at: now })
        .eq("token_hash", tokenHash);
    }
  } catch (err) {
    console.warn("[Supabase Revoke Session Error]:", err);
  }

  try {
    await revokeFallbackSession(rawToken);
  } catch (err) {
    console.warn("[Local Fallback Revoke Session Error]:", err);
  }
}

/**
 * Revokes all other sessions except current raw token.
 */
export async function revokeOtherSessions(currentRawToken: string): Promise<void> {
  const currentTokenHash = createHash("sha256").update(currentRawToken).digest("hex");
  const now = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("admin_sessions")
        .update({ revoked_at: now })
        .neq("token_hash", currentTokenHash)
        .is("revoked_at", null);
    }
  } catch (err) {
    console.warn("[Supabase Revoke Other Sessions Error]:", err);
  }

  try {
    await revokeOtherFallbackSessions(currentRawToken);
  } catch (err) {
    console.warn("[Local Fallback Revoke Other Sessions Error]:", err);
  }
}

/**
 * Revokes all active sessions globally.
 */
export async function revokeAllSessions(): Promise<void> {
  const now = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("admin_sessions")
        .update({ revoked_at: now })
        .is("revoked_at", null);
    }
  } catch (err) {
    console.warn("[Supabase Revoke All Sessions Error]:", err);
  }

  try {
    await revokeAllFallbackSessions();
  } catch (err) {
    console.warn("[Local Fallback Revoke All Sessions Error]:", err);
  }
}
