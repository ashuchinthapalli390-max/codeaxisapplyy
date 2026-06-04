import { NextRequest, NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { exportToCsv } from "@/lib/csv";
import { exportToJson } from "@/lib/jsonExport";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const correctKey = process.env.ADMIN_PASSKEY || "Ashu×Luger";
    const expectedToken = `CAX-AUTH-SESSION-${Buffer.from(correctKey).toString("base64")}`;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const applications = await dbQuery("SELECT * FROM applications ORDER BY created_at DESC");

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
    return NextResponse.json({ success: false, error: "Internal server error during data compile." }, { status: 500 });
  }
}
