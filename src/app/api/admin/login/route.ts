import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSession, addAuditLog } from "@/lib/storage";
import { verifyAdminMasterKey, createRateLimitIdentifier } from "@/lib/admin/verify-master-key";

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
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";
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

    const { accessKey } = (await req.json()) as { accessKey?: string };
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

    // Generate random secure session token
    const rawSessionToken = crypto.randomBytes(32).toString("base64url");
    const sessionCookieName = process.env.ADMIN_SESSION_COOKIE || "codexa_admin_session";
    const sessionDays = Number(process.env.ADMIN_SESSION_DAYS || 30);

    await createAdminSession({
      id: `sess-${Date.now()}`,
      token: rawSessionToken,
      deviceInfo: userAgent.slice(0, 80),
      ipAddress: ip,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await addAuditLog("LOGIN", `Admin authenticated successfully from ${userAgent.slice(0, 40)}`);

    const response = NextResponse.json({
      success: true,
      token: rawSessionToken,
      message: "Admin authentication authorized.",
    });

    // Set secure HttpOnly, SameSite=Strict cookie
    response.cookies.set({
      name: sessionCookieName,
      value: rawSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * sessionDays,
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
