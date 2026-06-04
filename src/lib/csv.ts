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
    "Mindset Score",
    "Coding Score",
    "Auto Status",
    "Manual Status",
    "Created At",
  ];

  const escapeCsv = (str: any) => {
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
      app.mindset_score,
      app.coding_awareness_score,
      app.auto_status,
      app.manual_status,
      app.created_at,
    ];
    csvRows.push(values.map(escapeCsv).join(","));
  }

  return csvRows.join("\n");
}
