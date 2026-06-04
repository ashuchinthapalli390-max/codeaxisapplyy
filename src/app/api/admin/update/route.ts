import { NextRequest } from "next/server";
import { dbQuery } from "@/lib/db";
import { jsonResponse } from "@/lib/safeJson";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const correctKey = process.env.ADMIN_PASSKEY || "Ashu×Luger";
    const expectedToken = `CAX-AUTH-SESSION-${Buffer.from(correctKey).toString("base64")}`;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return jsonResponse({ success: false, error: "Unauthorized access." }, 401);
    }

    const body = await req.json();
    const { id, manual_status, admin_notes } = body;

    if (!id) {
      return jsonResponse({ success: false, error: "Application ID is required." }, 400);
    }

    // Execute update statement
    const updateResult = await dbQuery(
      "UPDATE applications SET manual_status = ?, admin_notes = ? WHERE id = ?",
      [manual_status, admin_notes, id]
    );

    if (updateResult.affectedRows === 0) {
      return jsonResponse({ success: false, error: "Application record not found." }, 404);
    }

    // Insert audit log
    await dbQuery(
      "INSERT INTO admin_audit_logs (action_type, application_id, details) VALUES (?, ?, ?)",
      [
        "UPDATE_STATUS",
        id,
        `Status updated to '${manual_status}' with notes: '${admin_notes}'`,
      ]
    );

    return jsonResponse({
      success: true,
      message: "Application successfully updated."
    });

  } catch (err) {
    console.error("applications update crash:", err);
    return jsonResponse({ success: false, error: "Internal server error database update." }, 500);
  }
}
