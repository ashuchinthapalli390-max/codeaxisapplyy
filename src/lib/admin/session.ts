import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  createAdminSession as saveFallbackSession,
  verifyAdminSessionToken as verifyFallbackSession,
  revokeAdminSession as revokeFallbackSession,
  revokeAllOtherAdminSessions as revokeOtherFallbackSessions,
  revokeAllAdminSessions as revokeAllFallbackSessions,
} from "@/lib/storage";

// Canonical cookie name across the entire application
export const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "codexa_admin_session";
export const SESSION_COOKIE_NAME = ADMIN_SESSION_COOKIE; // alias for backwards compatibility
export const SESSION_DAYS = Number(process.env.ADMIN_SESSION_DAYS || 3650);
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60; // 10 years (3650 days) in seconds

export class UnauthorizedAdminError extends Error {
  constructor(message = "Unauthorized admin access.") {
    super(message);
    this.name = "UnauthorizedAdminError";
  }
}

export class AdminServiceUnavailableError extends Error {
  constructor(message = "Admin session verification is temporarily unavailable.") {
    super(message);
    this.name = "AdminServiceUnavailableError";
  }
}

export type AdminAuthStatus = "authenticated" | "unauthenticated" | "temporary_error";

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

export interface AdminSessionResult {
  status: AdminAuthStatus;
  isValid: boolean;
  reason?: string;
  session?: AdminSessionRecord;
  needsRefresh?: boolean;
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

  // 1. Save to Supabase admin_sessions table
  let supabaseSuccess = false;
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("admin_sessions").insert({
        id: sessionId,
        token_hash: tokenHash,
        device_label: deviceLabel,
        user_agent: userAgent,
        ip_address: ipAddress,
        created_at: now.toISOString(),
        last_seen_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (!error) {
        supabaseSuccess = true;
        console.log("[ADMIN_AUTH] login success (saved to Supabase admin_sessions)");
      } else {
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
    if (!supabaseSuccess) {
      console.log("[ADMIN_AUTH] login success (saved to local fallback store)");
    }
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
 * Returns clear status: "authenticated" | "unauthenticated" | "temporary_error"
 */
export async function validateSessionToken(rawToken?: string | null): Promise<AdminSessionResult> {
  if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
    console.log("[ADMIN_AUTH] missing cookie");
    return {
      status: "unauthenticated",
      isValid: false,
      reason: "missing_cookie",
    };
  }

  console.log("[ADMIN_AUTH] cookie present");
  const cleanToken = rawToken.trim();
  const tokenHash = createHash("sha256").update(cleanToken).digest("hex");
  const now = new Date();

  // 1. Check Supabase
  let dbEncounteredError = false;
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (error) {
        dbEncounteredError = true;
        console.warn("[ADMIN_AUTH] database unavailable:", error.message);
      } else if (data) {
        if (data.revoked_at) {
          console.log("[ADMIN_AUTH] revoked");
          return {
            status: "unauthenticated",
            isValid: false,
            reason: "session_revoked",
          };
        }

        if (new Date(data.expires_at).getTime() <= now.getTime()) {
          console.log("[ADMIN_AUTH] session expired");
          return {
            status: "unauthenticated",
            isValid: false,
            reason: "session_expired",
          };
        }

        // Update last_seen_at asynchronously
        try {
          await supabase
            .from("admin_sessions")
            .update({ last_seen_at: now.toISOString() })
            .eq("id", data.id);
        } catch {
          // ignore background update error
        }

        const expiryDate = new Date(data.expires_at);
        const daysRemaining = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const needsRefresh = daysRemaining < 7;

        console.log("[ADMIN_AUTH] session found (Supabase verified)");
        return {
          status: "authenticated",
          isValid: true,
          session: data,
          needsRefresh,
        };
      }
    }
  } catch (supabaseErr) {
    dbEncounteredError = true;
    console.warn("[ADMIN_AUTH] database unavailable (exception):", supabaseErr);
  }

  // 2. Check local fallback store
  try {
    const isValidLocal = await verifyFallbackSession(cleanToken);
    if (isValidLocal) {
      console.log("[ADMIN_AUTH] session found (Local fallback verified)");
      return {
        status: "authenticated",
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

  // 3. If DB had a real connection error and local check was not matched:
  if (dbEncounteredError) {
    return {
      status: "temporary_error",
      isValid: false,
      reason: "database_error",
    };
  }

  console.log("[ADMIN_AUTH] session not found");
  return {
    status: "unauthenticated",
    isValid: false,
    reason: "session_not_found",
  };
}

/**
 * Backwards compatibility helper for existing code.
 */
export async function validateSession(rawToken?: string | null): Promise<{
  isValid: boolean;
  needsRefresh?: boolean;
  session?: AdminSessionRecord;
  temporaryError?: boolean;
}> {
  const result = await validateSessionToken(rawToken);
  return {
    isValid: result.status === "authenticated",
    needsRefresh: result.needsRefresh,
    session: result.session,
    temporaryError: result.status === "temporary_error",
  };
}

/**
 * Server-side helper to read and validate session from request cookies or NextRequest.
 */
export async function getAdminSession(req?: NextRequest): Promise<AdminSessionResult> {
  try {
    let token: string | undefined;
    if (req) {
      token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    }
    return await validateSessionToken(token);
  } catch (err) {
    console.error("[getAdminSession Error]:", err);
    return {
      status: "temporary_error",
      isValid: false,
      reason: "session_verification_failed",
    };
  }
}

/**
 * Enforces admin authentication for protected API routes and server actions.
 * Throws UnauthorizedAdminError (401) or AdminServiceUnavailableError (503).
 */
export async function requireAdmin(req?: NextRequest): Promise<AdminSessionRecord> {
  const result = await getAdminSession(req);
  if (result.status === "authenticated" && result.session) {
    return result.session;
  }
  if (result.status === "temporary_error") {
    throw new AdminServiceUnavailableError();
  }
  throw new UnauthorizedAdminError(result.reason || "Unauthorized admin access.");
}

/**
 * Standard error response handler for protected admin API routes.
 */
export function handleAdminAuthError(error: unknown): NextResponse {
  if (error instanceof UnauthorizedAdminError) {
    return NextResponse.json(
      {
        success: false,
        code: "ADMIN_UNAUTHORIZED",
        error: "Unauthorized admin access.",
      },
      { status: 401 }
    );
  }

  if (error instanceof AdminServiceUnavailableError) {
    return NextResponse.json(
      {
        success: false,
        code: "ADMIN_SESSION_TEMPORARILY_UNAVAILABLE",
        error: "Admin session verification is temporarily unavailable. Please retry in a few moments.",
      },
      { status: 503 }
    );
  }

  console.error("[Admin API Unhandled Error]:", error);
  return NextResponse.json(
    {
      success: false,
      code: "SERVER_ERROR",
      error: error instanceof Error ? error.message : "Internal server error.",
    },
    { status: 500 }
  );
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
