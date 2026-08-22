import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSessions,
  revokeAdminSession,
  revokeAllOtherAdminSessions,
  revokeAllAdminSessions,
  addAuditLog,
} from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const currentToken = req.cookies.get("codexa_admin_session")?.value;
    const rawSessions = await getAdminSessions();

    const sessions = rawSessions.map((s) => ({
      ...s,
      isCurrent: s.token === currentToken,
    }));

    return NextResponse.json({ success: true, data: sessions, currentToken });
  } catch (err) {
    console.error("Sessions fetch error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch active sessions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { action: string; token?: string };
    const currentToken = req.cookies.get("codexa_admin_session")?.value || "";

    if (body.action === "revoke_all") {
      await revokeAllAdminSessions();
      await addAuditLog("SESSION_REVOKED", "Revoked all admin sessions globally.");
      const response = NextResponse.json({ success: true, message: "All sessions revoked." });
      response.cookies.delete("codexa_admin_session");
      return response;
    }

    if (body.action === "revoke_others") {
      await revokeAllOtherAdminSessions(currentToken);
      await addAuditLog("SESSION_REVOKED", "Logged out all other admin devices.");
      return NextResponse.json({ success: true, message: "Logged out all other devices." });
    }

    if (body.action === "revoke" && body.token) {
      await revokeAdminSession(body.token);
      await addAuditLog("SESSION_REVOKED", `Revoked specific admin session token.`);
      const response = NextResponse.json({ success: true, message: "Session revoked." });
      if (body.token === currentToken) {
        response.cookies.delete("codexa_admin_session");
      }
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Session action error:", err);
    return NextResponse.json({ success: false, error: "Failed to modify sessions." }, { status: 500 });
  }
}
