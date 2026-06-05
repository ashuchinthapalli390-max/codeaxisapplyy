import { NextRequest, NextResponse } from "next/server";
import {
  DATABASE_CONFIG_ERROR_MESSAGE,
  dbQuery,
  isDatabaseConfigError,
} from "@/lib/db";
import { exportToCsv } from "@/lib/csv";
import { exportToJson } from "@/lib/jsonExport";
import { jsonResponse } from "@/lib/safeJson";
import { ApplicationData } from "@/types/application";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const correctKey = process.env.ADMIN_PASSKEY || "Ashu×Luger";
    const expectedToken = `CAX-AUTH-SESSION-${Buffer.from(correctKey).toString("base64")}`;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return jsonResponse({ success: false, error: "Unauthorized access." }, 401);
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const applications = await dbQuery<ApplicationData[]>("SELECT * FROM applications ORDER BY created_at DESC");

    if (format === "csv") {
      const csvData = exportToCsv(applications);
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="CodeAxis-All-Applicants-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    const jsonData = exportToJson(applications);
    return new NextResponse(jsonData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="CodeAxis-All-Applicants-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });

  } catch (err) {
    console.error("applications export API crash:", err);
    if (isDatabaseConfigError(err)) {
      return jsonResponse({
        success: false,
        error: DATABASE_CONFIG_ERROR_MESSAGE
      }, 500);
    }

    return jsonResponse({ 
      success: false, 
      error: err instanceof Error ? err.message : "Internal server error during data compile." 
    }, 500);
  }
}
