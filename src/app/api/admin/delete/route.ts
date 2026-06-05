import { NextRequest } from "next/server";
import {
  DATABASE_CONFIG_ERROR_MESSAGE,
  dbQuery,
  isDatabaseConfigError,
} from "@/lib/db";
import { jsonResponse } from "@/lib/safeJson";

interface MutationResult {
  affectedRows: number;
}

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

    // Execute soft delete statement
    const deleteResult = await dbQuery<MutationResult>(
      "UPDATE applications SET is_deleted = 1, deleted_at = NOW() WHERE id = ?",
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return jsonResponse({ success: false, error: "Application record not found." }, 404);
    }

    // Insert audit log
    await dbQuery(
      "INSERT INTO admin_audit_logs (action_type, application_id, details) VALUES (?, ?, ?)",
      [
        "SOFT_DELETE_APPLICATION",
        id,
        `Soft deleted application record ID: ${id}`,
      ]
    );

    return jsonResponse({
      success: true,
      message: "Application moved to Trash."
    });

  } catch (err) {
    console.error("applications delete crash:", err);
    if (isDatabaseConfigError(err)) {
      return jsonResponse({
        success: false,
        error: DATABASE_CONFIG_ERROR_MESSAGE
      }, 500);
    }

    return jsonResponse({ 
      success: false, 
      error: err instanceof Error ? err.message : "Internal server error database delete." 
    }, 500);
  }
}
