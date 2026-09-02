import jsPDF from "jspdf";
import { ApplicationData } from "@/types/application";

/**
 * Generates an applicant-facing PDF confirmation report.
 * (Omits internal formulas, scoring weights, and reviewer notes)
 */
export function generateApplicantPDF(data: ApplicationData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // dark navy
  doc.rect(0, 0, pageWidth, 28, "F");

  // Red accent line
  doc.setFillColor(239, 68, 68); // crimson red
  doc.rect(0, 28, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CODEXA DEVELOPER INTERNSHIP", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Official Application Confirmation & Profile Summary", 14, 18);
  doc.text(`Ref ID: ${data.reference_id || "CAX-PENDING"}`, 14, 24);

  doc.setTextColor(239, 68, 68);
  doc.setFont("helvetica", "bold");
  doc.text("CONFIRMED", pageWidth - 35, 18);

  y = 38;

  const addSectionHeading = (title: string) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, pageWidth - 28, 7, "F");
    doc.setFillColor(239, 68, 68);
    doc.rect(14, y - 4, 3, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), 20, y + 1);
    y += 9;
  };

  const addRow = (label: string, value?: string | null) => {
    if (!value) return;
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, 16, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const splitText = doc.splitTextToSize(String(value), pageWidth - 70);
    doc.text(splitText, 65, y);
    y += Math.max(5.5, splitText.length * 4.5);
  };

  // Section 1: Personal Profile
  addSectionHeading("1. Personal Profile");
  addRow("Full Name", data.full_name);
  addRow("Email Address", data.email);
  addRow("Phone Number", data.phone_number);
  addRow("WhatsApp Number", data.whatsapp_number);
  addRow("Date of Birth", data.date_of_birth);
  addRow("Location", `${data.city || ""}, ${data.state || ""}, ${data.country || ""}`);
  if (data.discord_username) addRow("Discord Handle", data.discord_username);
  if (data.hobbies && data.hobbies.length > 0) addRow("Interests", data.hobbies.join(", "));
  y += 2;

  // Section 2: Education
  addSectionHeading("2. Academic Details");
  addRow("College / Institution", data.college_name);
  addRow("University", data.university_name);
  addRow("Course & Branch", `${data.course || ""} — ${data.branch || ""}`);
  addRow("Academic Year / Sem", `Year ${data.academic_year || ""}, Semester ${data.semester || ""}`);
  addRow("Roll / PIN Number", data.roll_number);
  addRow("Graduation Year", data.expected_graduation);
  if (data.cgpa) addRow("CGPA / Percentage", data.cgpa);
  y += 2;

  // Section 3: Developer Presence & Projects
  addSectionHeading("3. Developer Presence & Projects");
  addRow("Coding Timeline", data.coding_start_timeline);
  addRow("Project Experience", data.has_built_projects);
  if (data.developer_links && data.developer_links.length > 0) {
    const links = data.developer_links.map((l) => `${l.platform}: ${l.url}`).join(" | ");
    addRow("Developer Profiles", links);
  }
  if (data.projects && data.projects.length > 0) {
    data.projects.forEach((p, idx) => {
      addRow(`Project ${idx + 1}`, `${p.name} (${p.techStack}) — ${p.description}`);
    });
  }
  y += 2;

  // Section 4: Availability & Hardware
  addSectionHeading("4. Availability & Hardware");
  addRow("Daily Availability", data.daily_availability);
  if (data.available_days) addRow("Available Days", data.available_days.join(", "));
  if (data.preferred_timing) addRow("Preferred Time Slots", data.preferred_timing.join(", "));
  addRow("Device / OS", `${data.laptop_status || ""} (${data.operating_system || ""}, ${data.ram_capacity || ""})`);
  addRow("Internet Stability", data.internet_stability);
  y += 2;

  // Section 5: Technical Profile Summary
  addSectionHeading("5. Technical Self-Assessment");
  addRow("C Language", data.c_level);
  addRow("Python", data.python_level);
  addRow("Java", data.java_level);
  addRow("HTML / Web", data.html_level);
  addRow("Vibe Coding & AI", data.vibe_coding_level);
  y += 2;

  // Section 6: Commitments
  addSectionHeading("6. Signed Declarations & Policy Acceptance");
  addRow("Information Integrity", data.commitment_accurate_info ? "Confirmed (Accurate & Genuine)" : "Pending");
  addRow("Independent Work", data.commitment_independent_work ? "Confirmed (Completed Independently)" : "Pending");
  addRow("CodeXa Policies", data.commitment_accept_policies ? "Accepted all program guidelines" : "Pending");

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CodeXa Agency — Application Ref: ${data.reference_id || "CAX-DEV"} | Page ${i} of ${totalPages}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text("https://www.codxa-agency.online", pageWidth - 60, doc.internal.pageSize.getHeight() - 8);
  }

  doc.save(`CodeXa_Application_${data.reference_id || "Report"}.pdf`);
}

/**
 * Generates an Admin Assessment Dossier PDF with complete scoring breakdown and answers.
 */
export function generateAdminPDF(data: ApplicationData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setFillColor(239, 68, 68);
  doc.rect(0, 32, pageWidth, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CODEXA ADMIN EVALUATION DOSSIER", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text(`Candidate: ${data.full_name} | Ref: ${data.reference_id}`, 14, 18);
  doc.text(`Status: ${data.status || "Submitted"} | Submitted: ${data.created_at ? new Date(data.created_at).toLocaleDateString() : "N/A"}`, 14, 24);

  // Score Badge
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(pageWidth - 45, 8, 32, 18, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.total_score || 0}/100`, pageWidth - 41, 17);
  doc.setFontSize(6.5);
  doc.text(data.score_band || "EVALUATED", pageWidth - 42, 22);

  y = 42;

  const addSectionHeading = (title: string) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, pageWidth - 28, 7, "F");
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y - 4, 3, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), 20, y + 1);
    y += 9;
  };

  const addRow = (label: string, value?: string | number | null) => {
    if (value === undefined || value === null || value === "") return;
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, 16, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const splitText = doc.splitTextToSize(String(value), pageWidth - 70);
    doc.text(splitText, 65, y);
    y += Math.max(5, splitText.length * 4.2);
  };

  // Section 1: Score Breakdown
  addSectionHeading("1. Official 100-Point Score Matrix");
  addRow("Total Score", `${data.total_score || 0} / 100 (${data.score_band || "N/A"})`);
  addRow("Commitment & Continuity", `${data.commitment_continuity_score || 0} / 25 (${data.commitment_signal || "N/A"})`);
  addRow("Genuineness & Integrity", `${data.genuineness_integrity_score || 0} / 25`);
  addRow("Mindset & Work Habits", `${data.mindset_habits_score || 0} / 20`);
  addRow("Technical Knowledge", `${data.technical_knowledge_score || 0} / 15`);
  addRow("Learning Potential", `${data.learning_potential_score || 0} / 10`);
  addRow("Interview & Written Quality", `${data.interview_communication_score || 0} / 10`);
  y += 2;

  // Section 2: Integrity & Telemetry
  addSectionHeading("2. Integrity & Anti-Cheat Audit");
  addRow("Copy/Paste Warnings", `${data.copy_paste_warnings_count || 0} / 3`);
  addRow("Tab Switch / Focus Lost", `${data.tab_switch_count || 0} occurrences`);
  if (data.skill_authenticity) {
    addRow(
      "Skill Claim Authenticity",
      `Overall: ${data.skill_authenticity.overall || "N/A"} (Python: ${data.skill_authenticity.python || "N/A"}, C: ${data.skill_authenticity.c || "N/A"}, Java: ${data.skill_authenticity.java || "N/A"}, HTML: ${data.skill_authenticity.html || "N/A"})`
    );
  }
  y += 2;

  // Section 3: Candidate Interview Essays
  addSectionHeading("3. Candidate Thought-Process Essays");
  addRow("Q1: Why Join CodeXa", data.interview_q1_why_codexa);
  addRow("Q2: Why Select", data.interview_q2_why_select);
  addRow("Q3: Expectations", data.interview_q3_expectations);
  addRow("Q4: Strongest Skills", data.interview_q4_strongest_skills);
  addRow("Q5: Weakest Area", data.interview_q5_weakest_area);
  addRow("Q6: Describe Project", data.interview_q6_describe_project);
  addRow("Q7: Difficult Problem", data.interview_q7_difficult_problem);
  addRow("Q8: AI Workflow", data.interview_q8_ai_coding_usage);
  addRow("Q9: College Balance", data.interview_q9_college_balance);
  addRow("Q10: Future Goal", data.interview_q10_future_goal);

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `CodeXa Recruitment Confidential — Dossier: ${data.reference_id} | Page ${i} of ${totalPages}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(`CodeXa_Admin_Report_${data.reference_id || "Candidate"}.pdf`);
}

export const generateReceiptPdf = generateApplicantPDF;
export const generateFullReportPdf = generateAdminPDF;

/**
 * Generates an official CodeXa Internship Offer Letter PDF.
 */
export function generateOfferLetterPDF(offer: any): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // dark navy
  doc.rect(0, 0, pageWidth, 32, "F");

  // Crimson accent line
  doc.setFillColor(239, 68, 68); // crimson red
  doc.rect(0, 32, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CODEXA AGENCY", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Engineering & Product Development Directorate", 14, 20);
  doc.text("Official Internship Appointment & Offer of Engagement", 14, 26);

  doc.setTextColor(239, 68, 68);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL OFFER", pageWidth - 45, 16);
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - 45, 22);
  doc.text(`Offer Ref: ${offer.reference_id || "CAX-2026"}`, pageWidth - 45, 27);

  y = 44;

  // Recipient Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("TO:", 14, y);
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text((offer.applicant_name || "Applicant").toUpperCase(), 14, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${offer.applicant_email || "N/A"}`, 14, y + 12);
  doc.text(`Candidate Reference ID: ${offer.reference_id}`, 14, y + 17);

  y += 26;

  // Congratulatory Opening
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Subject: Offer of Developer Internship — Batch " + (offer.batch_code || "2026-SEP"), 14, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const openingText = `Dear ${offer.applicant_name},\n\nWe are pleased to extend this formal offer of engagement for the CodeXa Developer Internship program. Following your comprehensive application review and technical assessment, our engineering evaluation committee has selected you to join our cohort. This program offers hands-on production engineering experience across modern web and AI development workflows.`;
  const splitOpening = doc.splitTextToSize(openingText, pageWidth - 28);
  doc.text(splitOpening, 14, y);
  y += splitOpening.length * 4.5 + 4;

  // Offer Terms Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 58, 2, 2, "FD");

  doc.setFillColor(239, 68, 68);
  doc.rect(14, y, 3, 58, "F");

  let boxY = y + 8;
  const terms = [
    ["Designation / Role:", offer.internship_role || "Full-Stack Developer Intern"],
    ["Department / Domain:", offer.department || "Engineering & Product Development"],
    ["Commencement Date:", offer.joining_date || "2026-09-15"],
    ["Tenure / Duration:", offer.duration || "12 Weeks"],
    ["Work Mode & Location:", `${offer.work_mode || "Remote"} (${offer.work_location || "Online"})`],
    ["Expected Daily Commitment:", offer.working_hours || "3-4 Hours Daily (Flexible Schedule)"],
    ["Compensation / Incentives:", offer.stipend_status || "Performance-Based Project Stipends"],
    ["Acceptance Deadline:", offer.acceptance_deadline || "2026-09-10"],
  ];

  terms.forEach(([lbl, val]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, 20, boxY);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), 80, boxY);
    boxY += 6;
  });

  y += 66;

  // Key Responsibilities & Code of Conduct
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Key Terms & Code of Engagement:", 14, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const policies = [
    "1. Intellectual Property & Confidentiality: All code, designs, and materials created remain proprietary to CodeXa Agency.",
    "2. Quality & Integrity: Strict adherence to high-quality code standards, version control practices, and zero plagiarism.",
    "3. Regular Attendance & Check-ins: Active participation in weekly virtual standups and timely sprint milestone delivery.",
    "4. Certificate of Completion & Letter of Recommendation will be awarded upon satisfactory milestone completion.",
  ];
  policies.forEach((p) => {
    doc.text(p, 14, y);
    y += 4.5;
  });

  y += 6;

  // Signatures & Authorized Seal
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("ISSUED ON BEHALF OF CODEXA AGENCY:", 14, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38);
  doc.text(offer.authorized_person || "Ashu Chinthapalli", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(offer.designation || "Founder & Chief Executive Officer", 14, y + 4.5);
  doc.text("CodeXa Agency — Engineering Directorate", 14, y + 9);

  // Digital Verification Stamp
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 75, y - 6, 61, 20, 2, 2, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(239, 68, 68);
  doc.text("DIGITALLY SIGNED & VERIFIED", pageWidth - 72, y);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("CodeXa Secure Document Service", pageWidth - 72, y + 5);
  doc.text(`Hash: ${offer.token?.slice(0, 16) || "CAX-VERIFIED-AUTH"}`, pageWidth - 72, y + 9);

  // Bottom Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official CodeXa Appointment Document — Reference: ${offer.reference_id} | Verify at: https://www.codeaxisapply.xyz/status`,
    14,
    pageHeight - 8
  );

  doc.save(`CodeXa_Offer_Letter_${offer.reference_id || "Candidate"}.pdf`);
}

