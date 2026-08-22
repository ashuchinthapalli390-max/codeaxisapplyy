import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/storage";

export async function GET() {
  try {
    const logs = await getAuditLogs();
    return NextResponse.json({ success: true, data: logs });
  } catch (err) {
    console.error("Audit log error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch audit records." }, { status: 500 });
  }
}
