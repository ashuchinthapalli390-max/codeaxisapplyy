import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSession, addAuditLog } from "@/lib/storage";

// In-memory rate limiting map for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = Date.now();
    const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now };

    // Rate limiting: 5 failed attempts locks for 5 minutes (300,000ms)
    if (attempt.count >= 5 && now - attempt.lastAttempt < 300000) {
      const waitMins = Math.ceil((300000 - (now - attempt.lastAttempt)) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed access attempts. Rate limit active. Please try again in ${waitMins} minute(s).`,
        },
        { status: 429 }
      );
    }

    const { accessKey } = (await req.json()) as { accessKey?: string };
    const validKey = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_KEY || "CODEXA-ADMIN-2026";

    const cleanInput = (accessKey || "").trim();

    if (!cleanInput || cleanInput !== validKey) {
      attempt.count += 1;
      attempt.lastAttempt = now;
      loginAttempts.set(ip, attempt);

      await addAuditLog("LOGIN", `Failed admin login attempt with incorrect key from IP: ${ip}`);

      return NextResponse.json(
        {
          success: false,
          error: `Invalid access key. Remaining attempts before cooldown: ${Math.max(0, 5 - attempt.count)}.`,
        },
        { status: 401 }
      );
    }

    // Successful login: reset attempts
    loginAttempts.delete(ip);

    // Generate secure session token
    const token = `cax_sess_${crypto.randomBytes(24).toString("hex")}`;
    const userAgent = req.headers.get("user-agent") || "Web Client";

    await createAdminSession({
      id: `sess-${Date.now()}`,
      token,
      deviceInfo: userAgent.slice(0, 80),
      ipAddress: ip,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await addAuditLog("LOGIN", `Admin authenticated successfully from ${userAgent.slice(0, 40)} (${ip})`);

    const response = NextResponse.json({
      success: true,
      token,
      message: "Admin authentication authorized.",
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: "codexa_admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ success: false, error: "Internal server error during authentication." }, { status: 500 });
  }
}
