import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
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

// Session durations
export const NORMAL_SESSION_SECONDS = 12 * 60 * 60; // 12 Hours
export const REMEMBER_ME_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 Days
export const MAX_ABSOLUTE_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 Days Maximum
export const SESSION_MAX_AGE_SECONDS = REMEMBER_ME_SESSION_SECONDS; // Default ceiling

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
  remember_me?: boolean;
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
  rememberMe?: boolean;
}

interface SessionPayload {
  sid: string;
  iat: number; // Unix seconds
  exp: number; // Unix seconds
  rem: boolean;
  role: "admin";
}

/**
 * Returns a stable session signing secret.
 * Priority:
 * 1. process.env.ADMIN_SESSION_SECRET
 * 2. Deterministic derivation from process.env.ADMIN_PASSKEY
 * Guarantees that across all serverless instances and cold boots, the secret NEVER changes randomly.
 */
export function getStableSessionSecret(): string {
  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  const passkey = process.env.ADMIN_PASSKEY?.trim() || "codexa_admin_2026_default_fallback_passkey";
  return createHash("sha256").update(`codexa_session_signing_seed:${passkey}`).digest("hex");
}

/**
 * Signs a session payload using HMAC-SHA256 with the stable secret.
 */
function signSessionToken(sessionId: string, payload: SessionPayload): string {
  const secret = getStableSessionSecret();
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(`${sessionId}.${payloadB64}`)
    .digest("hex");
  return `${sessionId}.${payloadB64}.${signature}`;
}

/**
 * Validates and decodes a signed session token.
 */
function parseAndVerifySessionToken(rawToken: string): { valid: boolean; payload?: SessionPayload } {
  if (!rawToken || typeof rawToken !== "string") return { valid: false };
  const parts = rawToken.trim().split(".");
  if (parts.length !== 3) return { valid: false };

  const [sessionId, payloadB64, signature] = parts;
  const secret = getStableSessionSecret();
  const expectedSig = createHmac("sha256", secret)
    .update(`${sessionId}.${payloadB64}`)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (payload.sid !== sessionId) return { valid: false };

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSec) return { valid: false };

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

/**
 * Creates a new cryptographically signed admin session.
 */
export async function createSession(
  ipAddress: string = "127.0.0.1",
  userAgent: string = "Web Browser",
  rememberMe: boolean = false
): Promise<{ rawToken: string; expiresAt: Date; maxAge: number }> {
  const now = new Date();
  const durationSeconds = rememberMe ? REMEMBER_ME_SESSION_SECONDS : NORMAL_SESSION_SECONDS;
  const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

  const sessionId = `sess-${Date.now()}-${randomBytes(8).toString("hex")}`;
  const payload: SessionPayload = {
    sid: sessionId,
    iat: Math.floor(now.getTime() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
    rem: Boolean(rememberMe),
    role: "admin",
  };

  const rawToken = signSessionToken(sessionId, payload);
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const deviceLabel = userAgent.slice(0, 100);

  // 1. Save to Supabase admin_sessions table
  let supabaseSuccess = false;
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("admin_sessions").upsert(
        {
          id: sessionId,
          token_hash: tokenHash,
          device_label: deviceLabel,
          user_agent: userAgent,
          ip_address: ipAddress,
          remember_me: rememberMe,
          created_at: now.toISOString(),
          last_seen_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          revoked_at: null,
        },
        { onConflict: "id" }
      );

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

  // 2. Save to local fallback cache
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
    maxAge: durationSeconds,
  };
}

/**
 * Validates a raw session token using dual verification:
 * 1. Cryptographic HMAC signature check (guarantees fast stateless verification across serverless cold starts)
 * 2. Supabase database check against admin_sessions to verify active revocation state
 */
export async function validateSessionToken(rawToken?: string | null): Promise<AdminSessionResult> {
  if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
    return {
      status: "unauthenticated",
      isValid: false,
      reason: "missing_cookie",
    };
  }

  const cleanToken = rawToken.trim();
  const tokenHash = createHash("sha256").update(cleanToken).digest("hex");
  const now = new Date();

  // 1. Verify Cryptographic Signature
  const tokenCheck = parseAndVerifySessionToken(cleanToken);
  if (!tokenCheck.valid || !tokenCheck.payload) {
    return {
      status: "unauthenticated",
      isValid: false,
      reason: "invalid_or_expired_signature",
    };
  }

  const { sid, exp, rem, iat } = tokenCheck.payload;
  const tokenExpiresAt = new Date(exp * 1000);
  const tokenCreatedAt = new Date(iat * 1000);

  // 2. Check Supabase admin_sessions table for revocation
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (!error && data) {
        if (data.revoked_at) {
          console.log("[ADMIN_AUTH] session revoked in database");
          return {
            status: "unauthenticated",
            isValid: false,
            reason: "session_revoked",
          };
        }

        if (new Date(data.expires_at).getTime() <= now.getTime()) {
          console.log("[ADMIN_AUTH] session expired in database");
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

        // Sliding renewal: if half the session duration has elapsed, request sliding refresh
        const totalDurationMs = new Date(data.expires_at).getTime() - new Date(data.created_at).getTime();
        const elapsedMs = now.getTime() - new Date(data.last_seen_at || data.created_at).getTime();
        const needsRefresh = elapsedMs > totalDurationMs / 2;

        return {
          status: "authenticated",
          isValid: true,
          session: data,
          needsRefresh,
          rememberMe: Boolean(data.remember_me),
        };
      }
    }
  } catch (supabaseErr) {
    console.warn("[ADMIN_AUTH] Supabase database read error (falling back to cryptographically verified token):", supabaseErr);
  }

  // 3. Fallback: If DB query fails or table is pending, the cryptographic token itself is validated!
  const remainingSeconds = exp - Math.floor(now.getTime() / 1000);
  const needsRefresh = remainingSeconds < 3600; // refresh if less than 1h remains

  return {
    status: "authenticated",
    isValid: true,
    needsRefresh,
    rememberMe: rem,
    session: {
      id: sid,
      created_at: tokenCreatedAt.toISOString(),
      last_seen_at: now.toISOString(),
      expires_at: tokenExpiresAt.toISOString(),
      remember_me: rem,
    },
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
 * Revokes a session by unique session ID.
 */
export async function revokeSessionById(sessionId: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase
        .from("admin_sessions")
        .update({ revoked_at: now })
        .eq("id", sessionId);
    }
  } catch (err) {
    console.warn("[Supabase Revoke Session By ID Error]:", err);
  }
}

/**
 * Revokes a single session by raw token.
 */
export async function revokeSessionByToken(rawToken: string): Promise<void> {
  const tokenHash = createHash("sha256").update(rawToken.trim()).digest("hex");
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
  const currentTokenHash = createHash("sha256").update(currentRawToken.trim()).digest("hex");
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
