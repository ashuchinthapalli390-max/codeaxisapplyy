import { jsPDF } from "jspdf";
import { ApplicationData } from "@/types/application";

export function generateReceiptPdf(data: ApplicationData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const referenceId = data.reference_id || "CAX-2026-000000";

  // Styles & Colors
  const darkBlue = [3, 7, 18];
  const cyan = [6, 182, 212];
  const textDark = [50, 50, 50];
  const textMuted = [120, 120, 120];

  // Draw Header Border line
  doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
  doc.setLineWidth(1);
  doc.line(15, 15, 195, 15);

  // Header Title
  doc.setFont("courier", "bold");
  doc.setFontSize(22);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text("CODEAXIS / CODEXA", 15, 27);

  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  doc.setTextColor(cyan[0], cyan[1], cyan[2]);
  doc.text("DEVELOPER INTERNSHIP APPLICATION PORTAL", 15, 33);

  // Receipt Label
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text("SUBMISSION RECEIPT", 15, 45);

  // Reference & Date Info Box
  doc.setFillColor(240, 248, 255);
  doc.rect(15, 50, 180, 22, "F");
  doc.setDrawColor(200, 220, 240);
  doc.setLineWidth(0.3);
  doc.rect(15, 50, 180, 22, "S");

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text(`Reference ID:   ${referenceId}`, 20, 57);
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  
  const submitDate = data.created_at 
    ? new Date(data.created_at).toLocaleString() 
    : new Date().toLocaleString();
  doc.text(`Submitted On:   ${submitDate}`, 20, 64);
  doc.text("Status:         SUBMITTED SUCCESSFULLY", 20, 69);

  // Grid Layout Helper
  let y = 82;
  const drawSectionHeader = (title: string) => {
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.setTextColor(cyan[0], cyan[1], cyan[2]);
    doc.text(title, 15, y);
    doc.setDrawColor(cyan[0], cyan[1], cyan[2]);
    doc.setLineWidth(0.2);
    doc.line(15, y + 2, 195, y + 2);
    y += 8;
  };

  const drawRow = (label: string, val: string) => {
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(label, 15, y);
    doc.setFont("courier", "normal");
    doc.text(val || "N/A", 70, y);
    y += 6;
  };

  // Section 1: Candidate Identity
  drawSectionHeader("1. IDENTITY & CONTACT INFORMATION");
  drawRow("Full Name:", data.full_name);
  drawRow("Date of Birth:", data.date_of_birth);
  drawRow("Email Address:", data.email);
  drawRow("Phone Number:", data.phone_number);
  if (data.whatsapp_number) drawRow("WhatsApp Number:", data.whatsapp_number);
  if (data.discord_username) drawRow("Discord Username:", data.discord_username);
  drawRow("City & State:", data.city_state);

  y += 4;

  // Section 2: Academic Profile
  drawSectionHeader("2. ACADEMIC MODULE PROFILE");
  drawRow("College Name:", data.college_name);
  drawRow("Course / Branch:", `${data.course} - ${data.branch}`);
  drawRow("Academic Year / Sem:", `Year ${data.academic_year} / Sem ${data.semester}`);
  drawRow("Roll Number / PIN:", data.roll_number);

  y += 4;

  // Section 3: Readiness Scan
  drawSectionHeader("3. READINESS & EXPERIENCE SCAN");
  drawRow("Coding Level:", data.coding_level);
  drawRow("Hardware Status:", data.device_status);
  drawRow("Availability:", data.daily_availability);
  drawRow("Project Experience:", data.project_experience);

  y += 12;

  // Footer / Disclaimer Box
  doc.setDrawColor(230, 230, 230);
  doc.line(15, 265, 195, 265);

  doc.setFont("courier", "italic");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  
  // Disclaimer paragraphs
  const disclaimerText = 
    "Note: This PDF is only an application submission receipt. It is not a selection confirmation. " +
    "Selection depends on application review, written evaluation, seriousness, and slot availability. " +
    "CodeAxis / Codexa will contact shortlisted applicants directly via Email or WhatsApp.";
  
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, 180);
  doc.text(splitDisclaimer, 15, 270);

  // Save the PDF
  doc.save(`CodeAxis-Application-Receipt-${referenceId}.pdf`);
}
