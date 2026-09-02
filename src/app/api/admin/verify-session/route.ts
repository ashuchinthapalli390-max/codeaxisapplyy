import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSession,
  ADMIN_SESSION_COOKIE,
  NORMAL_SESSION_SECONDS,
  REMEMBER_ME_SESSION_SECONDS,
} from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAdminSession(req);

    if (authResult.status === "unauthenticated") {
      const res = NextResponse.json({ authenticated: false, code: "ADMIN_UNAUTHORIZED" }, { status: 401 });
      // Only delete cookie if confirmed unauthenticated/revoked
      res.cookies.delete({
        name: ADMIN_SESSION_COOKIE,
        path: "/",
      });
      return res;
    }

    if (authResult.status === "temporary_error") {
      // Return 200 with temporaryError flag to prevent client layout from logging out
      return NextResponse.json({
        authenticated: true,
        temporaryError: true,
        message: "Session verification service temporarily unavailable.",
      });
    }

    const response = NextResponse.json({
      authenticated: true,
      expiresAt: authResult.session?.expires_at,
      rememberMe: authResult.rememberMe,
      deviceLabel: authResult.session?.device_label,
    });

    // If sliding renewal is triggered, refresh cookie headers with appropriate duration
    if (authResult.needsRefresh) {
      const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (token) {
        const now = new Date();
        const durationSeconds = authResult.rememberMe ? REMEMBER_ME_SESSION_SECONDS : NORMAL_SESSION_SECONDS;
        const newExpiry = new Date(now.getTime() + durationSeconds * 1000);
        response.cookies.set({
          name: ADMIN_SESSION_COOKIE,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: durationSeconds,
          expires: newExpiry,
          path: "/",
        });
      }
    }

    return response;
  } catch (err) {
    console.error("[Session Verification Unexpected Error]:", err);
    // On unexpected error, do NOT logout admin.
    return NextResponse.json({ authenticated: true, temporaryError: true });
  }
}
