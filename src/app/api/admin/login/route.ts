import { NextRequest, NextResponse } from "next/server";
import { addAuditLog } from "@/lib/storage";
import { verifyAdminMasterKey, createRateLimitIdentifier } from "@/lib/admin/verify-master-key";
import { createSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

// Privacy-preserving in-memory rate limiting map
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "Web Browser";
    const identifierHash = createRateLimitIdentifier(ip, userAgent);
    const now = Date.now();

    const maxAttempts = Number(process.env.ADMIN_MAX_LOGIN_ATTEMPTS || 5);
    const windowMs = Number(process.env.ADMIN_LOGIN_WINDOW_MINUTES || 15) * 60 * 1000;

    const attempt = loginAttempts.get(identifierHash) || { count: 0, lastAttempt: now };

    // Rate limiting check
    if (attempt.count >= maxAttempts && now - attempt.lastAttempt < windowMs) {
      const waitMins = Math.ceil((windowMs - (now - attempt.lastAttempt)) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Admin access temporarily locked. Please try again in ${waitMins} minute(s).`,
        },
        { status: 429 }
      );
    }

    const { accessKey, rememberMe } = (await req.json()) as { accessKey?: string; rememberMe?: boolean };
    const cleanInput = (accessKey || "").trim();

    const isAuthorized = verifyAdminMasterKey(cleanInput);

    if (!cleanInput || !isAuthorized) {
      attempt.count += 1;
      attempt.lastAttempt = now;
      loginAttempts.set(identifierHash, attempt);

      await addAuditLog("LOGIN", `Failed admin login attempt from ${userAgent.slice(0, 40)}`);

      return NextResponse.json(
        {
          success: false,
          error: `Invalid master access key. Remaining attempts before cooldown: ${Math.max(0, maxAttempts - attempt.count)}.`,
        },
        { status: 401 }
      );
    }

    // Successful login: reset attempts
    loginAttempts.delete(identifierHash);

    // Create session (12 hours normal, 30 days if rememberMe)
    const { rawToken, expiresAt, maxAge } = await createSession(ip, userAgent, Boolean(rememberMe));

    await addAuditLog("LOGIN", `Admin authenticated successfully (RememberMe: ${Boolean(rememberMe)}) from ${userAgent.slice(0, 40)}`);

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication authorized.",
      rememberMe: Boolean(rememberMe),
      expiresAt: expiresAt.toISOString(),
    });

    // Set persistent HttpOnly cookie
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
