import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  handleAdminAuthError,
  revokeSessionByToken,
  revokeOtherSessions,
  revokeAllSessions,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/session";
import { getAdminSessions, addAuditLog } from "@/lib/storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createHash } from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const currentToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";
    const currentTokenHash = currentToken ? createHash("sha256").update(currentToken).digest("hex") : "";

    // Try reading from Supabase
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from("admin_sessions")
          .select("*")
          .is("revoked_at", null)
          .order("last_seen_at", { ascending: false });

        if (data && !error && data.length > 0) {
          const sessions = data.map((s) => ({
            id: s.id,
            deviceInfo: s.device_label || s.user_agent || "Admin Browser",
            ipAddress: s.ip_address || "Encrypted",
            lastActive: s.last_seen_at || s.created_at,
            createdAt: s.created_at,
            isCurrent: s.token_hash === currentTokenHash,
          }));

          return NextResponse.json({ success: true, data: sessions });
        }
      }
    } catch (supabaseErr) {
      console.warn("[Admin Sessions Fetch Warning]:", supabaseErr);
    }

    // Fallback to local memory sessions
    const rawSessions = await getAdminSessions();
    const sessions = rawSessions.map((s) => ({
      ...s,
      isCurrent: s.token === currentToken,
    }));

    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = (await req.json()) as { action: string; token?: string; sessionId?: string };
    const currentToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value || "";

    if (body.action === "revoke_all") {
      await revokeAllSessions();
      await addAuditLog("SESSION_REVOKED", "Revoked all admin sessions globally.");
      const response = NextResponse.json({ success: true, message: "All sessions revoked." });
      response.cookies.delete({
        name: ADMIN_SESSION_COOKIE,
        path: "/",
      });
      return response;
    }

    if (body.action === "revoke_others") {
      await revokeOtherSessions(currentToken);
      await addAuditLog("SESSION_REVOKED", "Logged out all other admin devices.");
      return NextResponse.json({ success: true, message: "Logged out all other devices." });
    }

    if (body.action === "revoke" && (body.token || body.sessionId)) {
      if (body.token) {
        await revokeSessionByToken(body.token);
      }
      await addAuditLog("SESSION_REVOKED", `Revoked specific admin device session.`);
      const response = NextResponse.json({ success: true, message: "Session revoked." });
      if (body.token === currentToken) {
        response.cookies.delete({
          name: ADMIN_SESSION_COOKIE,
          path: "/",
        });
      }
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
