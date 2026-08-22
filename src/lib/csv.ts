import { ApplicationData } from "@/types/application";

export function exportToCsv(applications: ApplicationData[]): string {
  const headers = [
    "Reference ID",
    "Full Name",
    "Email",
    "Phone",
    "WhatsApp",
    "Discord",
    "College",
    "Course",
    "Branch",
    "Roll Number",
    "Total Score",
    "Score Band",
    "Commitment Signal",
    "Status",
    "Created At",
  ];

  const escapeCsv = (str: unknown) => {
    if (str === null || str === undefined) return "";
    const cleanStr = String(str).replace(/"/g, '""');
    return cleanStr.includes(",") || cleanStr.includes("\n") || cleanStr.includes('"')
      ? `"${cleanStr}"`
      : cleanStr;
  };

  const csvRows = [];
  csvRows.push(headers.join(","));

  for (const app of applications) {
    const values = [
      app.reference_id,
      app.full_name,
      app.email,
      app.phone_number,
      app.whatsapp_number,
      app.discord_username,
      app.college_name,
      app.course,
      app.branch,
      app.roll_number,
      app.total_score,
      app.score_band,
      app.commitment_signal,
      app.status,
      app.created_at,
    ];
    csvRows.push(values.map(escapeCsv).join(","));
  }

  return csvRows.join("\n");
}
