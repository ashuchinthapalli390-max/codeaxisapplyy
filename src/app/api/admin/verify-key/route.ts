import { NextRequest, NextResponse } from "next/server";
import { verifyAdminMasterKey } from "@/lib/admin/verify-master-key";
import { createSession, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = body.accessKey || body.passkey || body.key || "";

    const isAuthorized = verifyAdminMasterKey(key);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Access Declined. Invalid access key." }, { status: 401 });
    }

    const { rawToken, expiresAt, maxAge } = await createSession();

    const response = NextResponse.json({
      success: true,
      token: rawToken,
      expiresAt: expiresAt.toISOString(),
    });

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
    console.error("verify-key error:", err);
    return NextResponse.json({ success: false, error: "Authentication failed." }, { status: 500 });
  }
}
