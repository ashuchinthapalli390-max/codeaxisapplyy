import { NextRequest, NextResponse } from "next/server";
import { getApplications, addAuditLog } from "@/lib/storage";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { format, status, scoreBand } = (await req.json()) as {
      format: "csv" | "json";
      status?: string;
      scoreBand?: string;
    };

    const result = await getApplications({ status, scoreBand, limit: 10000 });
    const apps = result.applications;

    await addAuditLog("EXPORT", `Exported ${apps.length} applications in ${format.toUpperCase()} format`);

    if (format === "json") {
      return new NextResponse(JSON.stringify(apps, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="CodeXa_Applications_Export_${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    // CSV format generator
    const headers = [
      "Reference ID",
      "Full Name",
      "Email",
      "Phone",
      "College",
      "Branch",
      "Year",
      "Total Score",
      "Score Band",
      "Commitment Signal",
      "Status",
      "Submission Date",
    ];

    const rows = apps.map((a) => [
      `"${a.reference_id || ""}"`,
      `"${(a.full_name || "").replace(/"/g, '""')}"`,
      `"${a.email || ""}"`,
      `"${a.phone_number || ""}"`,
      `"${(a.college_name || "").replace(/"/g, '""')}"`,
      `"${a.branch || ""}"`,
      `"${a.academic_year || ""}"`,
      a.total_score || 0,
      `"${a.score_band || ""}"`,
      `"${a.commitment_signal || ""}"`,
      `"${a.status || ""}"`,
      `"${a.created_at || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CodeXa_Applications_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
