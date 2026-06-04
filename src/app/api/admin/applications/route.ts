import { NextRequest } from "next/server";
import { dbQuery } from "@/lib/db";
import { jsonResponse } from "@/lib/safeJson";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const correctKey = process.env.ADMIN_PASSKEY || "Ashu×Luger";
    const expectedToken = `CAX-AUTH-SESSION-${Buffer.from(correctKey).toString("base64")}`;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return jsonResponse({ success: false, error: "Unauthorized access." }, 401);
    }

    const applications = await dbQuery("SELECT * FROM applications ORDER BY created_at DESC");
    
    return jsonResponse({
      success: true,
      data: applications
    });

  } catch (err) {
    console.error("applications fetch crash:", err);
    return jsonResponse({ success: false, error: "Internal server error database query." }, 500);
  }
}
