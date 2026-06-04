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
    const { id } = body;

    if (!id) {
      return jsonResponse({ success: false, error: "Application ID is required." }, 400);
    }

    // Execute delete statement
    const deleteResult = await dbQuery(
      "DELETE FROM applications WHERE id = ?",
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return jsonResponse({ success: false, error: "Application record not found." }, 404);
    }

    // Insert audit log
    await dbQuery(
      "INSERT INTO admin_audit_logs (action_type, application_id, details) VALUES (?, ?, ?)",
      [
        "DELETE_APPLICATION",
        id,
        `Hard deleted application record ID: ${id}`,
      ]
    );

    return jsonResponse({
      success: true,
      message: "Application permanently deleted."
    });

  } catch (err) {
    console.error("applications delete crash:", err);
    return jsonResponse({ success: false, error: "Internal server error database delete." }, 500);
  }
}
