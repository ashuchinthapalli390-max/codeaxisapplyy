import { NextRequest, NextResponse } from "next/server";
import { revokeAdminSession, addAuditLog } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get("codexa_admin_session");
    if (cookie?.value) {
      await revokeAdminSession(cookie.value);
      await addAuditLog("LOGIN", "Admin logged out and session revoked.");
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete("codexa_admin_session");
    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ success: false, error: "Logout failed." }, { status: 500 });
  }
}
