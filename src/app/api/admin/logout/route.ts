import { NextRequest, NextResponse } from "next/server";
import { revokeSessionByToken, ADMIN_SESSION_COOKIE } from "@/lib/admin/session";
import { addAuditLog } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get(ADMIN_SESSION_COOKIE);
    if (cookie?.value) {
      await revokeSessionByToken(cookie.value);
      await addAuditLog("LOGIN", "Admin logged out and session revoked.");
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ success: false, error: "Logout failed." }, { status: 500 });
  }
}
