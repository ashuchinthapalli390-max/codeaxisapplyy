import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const logs = await getAuditLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
