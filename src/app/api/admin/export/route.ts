import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleAdminAuthError } from "@/lib/admin/session";
import { getApplications } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const result = await getApplications({ limit: 10000 });
    const applications = result.applications;

    if (format === "csv") {
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

      const rows = applications.map((a) => [
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
    }

    return new NextResponse(JSON.stringify(applications, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="CodeXa_Applications_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    return handleAdminAuthError(err);
  }
}
