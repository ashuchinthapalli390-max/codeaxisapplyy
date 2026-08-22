import { NextRequest, NextResponse } from "next/server";
import { validateSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/admin/session";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const result = await validateSession(token);
    if (!result.isValid) {
      const res = NextResponse.json({ authenticated: false }, { status: 401 });
      res.cookies.delete({
        name: SESSION_COOKIE_NAME,
        path: "/",
      });
      return res;
    }

    const response = NextResponse.json({
      authenticated: true,
      expiresAt: result.session?.expires_at,
    });

    // If sliding renewal is triggered, refresh cookie headers
    if (result.needsRefresh) {
      const now = new Date();
      const newExpiry = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE_SECONDS,
        expires: newExpiry,
        path: "/",
      });
    }

    return response;
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
