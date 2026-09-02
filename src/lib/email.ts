import { ApplicationData } from "@/types/application";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.EMAIL_FROM?.trim() || "CodeXa Apply <onboarding@resend.dev>";

  if (!apiKey) {
    return { success: true }; // Graceful fallback when Resend API key is not configured
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Email Service] Resend API error:", data);
      return { success: false, error: data?.message || "Failed to send email" };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Network error";
    console.error("[Email Service] Failed to send email:", error);
    return { success: false, error: errorMsg };
  }
}

export async function sendApplicantConfirmationEmail(app: ApplicationData): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apply.codxa-agency.online";
  const refId = app.reference_id || "";
  const trackUrl = `${appUrl}/status?ref=${encodeURIComponent(refId)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background-color: #0b0b14; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 30px; }
    .header { text-align: center; border-bottom: 1px solid #1e1e2e; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { color: #ef4444; font-size: 22px; font-weight: 900; letter-spacing: 2px; }
    .ref-box { background-color: #121220; border: 1px dashed #ef4444; border-radius: 12px; padding: 15px; text-align: center; margin: 25px 0; }
    .ref-id { font-size: 20px; font-weight: bold; color: #ef4444; letter-spacing: 2px; font-family: monospace; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 15px; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e1e2e; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">CODEXA AGENCY</div>
      <div style="font-size: 12px; color: #ef4444; margin-top: 5px; font-family: monospace;">DEVELOPER RECRUITMENT UNIVERSE</div>
    </div>

    <p style="font-size: 16px; color: #ffffff;">Hello <strong>${app.full_name}</strong>,</p>
    
    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
      Your application for the <strong>CodeXa Developer Internship (Batch 2026)</strong> has been successfully received and queued for human evaluation.
    </p>

    <div class="ref-box">
      <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Your Application Reference ID</div>
      <div class="ref-id">${app.reference_id}</div>
    </div>

    <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
      Please save this Reference ID. You can use it along with your registered email (<code>${app.email}</code>) to track your review status anytime.
    </p>

    <div style="text-align: center;">
      <a href="${trackUrl}" class="btn">Track Application Status &rarr;</a>
    </div>

    <div class="footer">
      CodeXa Agency &bull; Building Technology. Building Developers.<br>
      Founder: Ashu &bull; Co-Founder: Deepak &bull; CEO: Kishore
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: app.email,
    subject: `Application Received — Ref: ${app.reference_id} | CodeXa Developer Internship`,
    html,
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || "ashuchinthapalli3900@gmail.com";
  if (adminEmail) {
    const adminHtml = `
      <div style="font-family: monospace; background: #030712; color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #ef4444;">
        <h3 style="color: #ef4444;">🚨 New CodeXa Application Received</h3>
        <p><strong>Candidate:</strong> ${app.full_name} (${app.email})</p>
        <p><strong>Phone:</strong> ${app.phone_number}</p>
        <p><strong>College:</strong> ${app.college_name} (${app.branch})</p>
        <p><strong>Reference:</strong> ${app.reference_id}</p>
        <p><strong>Total Score:</strong> ${app.total_score || 0}/100 [Band: ${app.score_band || "Under Review"}]</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `[New Candidate] ${app.full_name} applied — Ref: ${app.reference_id} (${app.score_band || "Review"})`,
      html: adminHtml,
    });
  }
}

export async function sendInterviewInvitationEmail(interview: any): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || "https://www.codeaxisapply.xyz";
  const trackUrl = `${baseUrl}/status?ref=${encodeURIComponent(interview.reference_id)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #0b0b14; border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 16px; padding: 32px; }
    .header { text-align: center; border-bottom: 1px solid #1e1e2e; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { color: #ef4444; font-size: 22px; font-weight: 900; letter-spacing: 2px; }
    .title { font-size: 18px; font-weight: bold; color: #ffffff; margin-top: 10px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #121220; border-radius: 12px; overflow: hidden; }
    .info-table td { padding: 12px 16px; border-bottom: 1px solid #1e1e2e; font-size: 13px; }
    .label { color: #94a3b8; width: 35%; font-weight: 600; }
    .value { color: #f8fafc; font-weight: bold; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; font-size: 15px; margin: 20px 0; letter-spacing: 0.5px; }
    .instructions { background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444; padding: 14px 18px; border-radius: 0 10px 10px 0; margin: 20px 0; font-size: 12px; color: #e2e8f0; line-height: 1.6; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e1e2e; padding-top: 15px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">CODEXA AGENCY</div>
      <div class="title">Interview Invitation: Developer Internship</div>
      <div style="font-size: 12px; color: #ef4444; font-family: monospace; margin-top: 4px;">REFERENCE: ${interview.reference_id}</div>
    </div>

    <p style="font-size: 15px; color: #ffffff;">Dear <strong>${interview.applicant_name}</strong>,</p>

    <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
      Congratulations! Following our review of your application, our engineering team is pleased to invite you for a virtual technical and mindset discussion for the <strong>CodeXa Developer Internship</strong>.
    </p>

    <table class="info-table">
      <tr>
        <td class="label">Interview Round:</td>
        <td class="value">${interview.interview_round || "Technical & Mindset Review"}</td>
      </tr>
      <tr>
        <td class="label">Date:</td>
        <td class="value">${interview.interview_date}</td>
      </tr>
      <tr>
        <td class="label">Time:</td>
        <td class="value">${interview.start_time} (${interview.timezone || "Asia/Kolkata"})</td>
      </tr>
      <tr>
        <td class="label">Duration:</td>
        <td class="value">${interview.duration_minutes || 30} Minutes</td>
      </tr>
      <tr>
        <td class="label">Platform:</td>
        <td class="value">${interview.platform || "Google Meet"}</td>
      </tr>
      <tr>
        <td class="label">Interviewer:</td>
        <td class="value">${interview.interviewer_name || "Ashu Chinthapalli"}</td>
      </tr>
    </table>

    <div style="text-align: center;">
      <a href="${interview.meeting_link}" target="_blank" class="btn">🚀 Join Virtual Meeting Room</a>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 5px;">Link: <a href="${interview.meeting_link}" style="color: #ef4444;">${interview.meeting_link}</a></div>
    </div>

    ${
      interview.instructions
        ? `
    <div class="instructions">
      <strong>Important Candidate Instructions:</strong><br>
      ${interview.instructions.replace(/\n/g, "<br>")}
    </div>
    `
        : ""
    }

    <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
      Please ensure you join with a stable internet connection and quiet surroundings. Have your development environment or GitHub projects handy if you wish to showcase your work.
    </p>

    <div style="text-align: center; margin-top: 15px;">
      <a href="${trackUrl}" style="color: #ef4444; font-size: 12px; text-decoration: underline;">View Application Status & History &rarr;</a>
    </div>

    <div class="footer">
      CodeXa Developer Recruitment Universe &bull; CodeXa Agency<br>
      Support: <a href="mailto:apply@codxa-agency.online" style="color: #cbd5e1;">apply@codxa-agency.online</a>
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmail({
    to: interview.applicant_email,
    subject: `Interview Scheduled: CodeXa Developer Internship — ${interview.applicant_name} (Ref: ${interview.reference_id})`,
    html,
  });
}

export async function sendOfferLetterEmail(offer: any): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || "https://www.codeaxisapply.xyz";
  const respondUrl = `${baseUrl}/offer/respond?token=${encodeURIComponent(offer.token)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 620px; margin: 0 auto; background-color: #0b0b14; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 16px; padding: 32px; }
    .header { text-align: center; border-bottom: 1px solid #1e1e2e; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { color: #ef4444; font-size: 24px; font-weight: 900; letter-spacing: 2px; }
    .congrats { color: #22c55e; font-size: 14px; font-weight: 800; letter-spacing: 1.5px; margin-top: 8px; text-transform: uppercase; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #121220; border-radius: 12px; overflow: hidden; }
    .info-table td { padding: 12px 16px; border-bottom: 1px solid #1e1e2e; font-size: 13px; }
    .label { color: #94a3b8; width: 38%; font-weight: 600; }
    .value { color: #f8fafc; font-weight: bold; }
    .btn-accept { display: inline-block; background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; margin: 6px; }
    .btn-decline { display: inline-block; background: #1e1e2e; color: #cbd5e1 !important; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: bold; font-size: 14px; margin: 6px; border: 1px solid #334155; }
    .btn-view { display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-weight: bold; font-size: 14px; margin-bottom: 15px; }
    .deadline-box { background: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; border-radius: 12px; padding: 14px; text-align: center; margin: 20px 0; font-size: 12px; color: #fca5a5; }
    .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e1e2e; padding-top: 15px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo">CODEXA AGENCY</div>
      <div class="congrats">&#10024; OFFICIAL INTERNSHIP APPOINTMENT &#10024;</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Candidate Ref: <span style="color: #ef4444; font-family: monospace;">${offer.reference_id}</span></div>
    </div>

    <p style="font-size: 16px; color: #ffffff;">Dear <strong>${offer.applicant_name}</strong>,</p>

    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
      We are delighted to formally offer you the position of <strong>${offer.internship_role || "Full-Stack Developer Intern"}</strong> at <strong>CodeXa Agency</strong> for Batch <strong>${offer.batch_code || "2026-SEP"}</strong>!
    </p>

    <table class="info-table">
      <tr>
        <td class="label">Position / Role:</td>
        <td class="value">${offer.internship_role || "Full-Stack Developer Intern"}</td>
      </tr>
      <tr>
        <td class="label">Department:</td>
        <td class="value">${offer.department || "Engineering & Product Development"}</td>
      </tr>
      <tr>
        <td class="label">Commencement Date:</td>
        <td class="value">${offer.joining_date}</td>
      </tr>
      <tr>
        <td class="label">Tenure / Duration:</td>
        <td class="value">${offer.duration || "12 Weeks"}</td>
      </tr>
      <tr>
        <td class="label">Work Mode:</td>
        <td class="value">${offer.work_mode || "Remote"} (${offer.work_location || "Online"})</td>
      </tr>
      <tr>
        <td class="label">Daily Commitment:</td>
        <td class="value">${offer.working_hours || "3-4 Hours Daily (Flexible)"}</td>
      </tr>
      <tr>
        <td class="label">Stipend & Rewards:</td>
        <td class="value">${offer.stipend_status || "Performance-Based Project Incentives"}</td>
      </tr>
    </table>

    <div class="deadline-box">
      <strong>Response Required By: ${offer.acceptance_deadline}</strong><br>
      Please confirm your acceptance or notify us if you wish to decline before this deadline.
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <div style="margin-bottom: 12px;">
        <a href="${respondUrl}" class="btn-view">&#128196; View Official Offer Letter & Respond Online &rarr;</a>
      </div>
      <div>
        <a href="${respondUrl}&action=accept" class="btn-accept">&#10003; Accept Offer</a>
        <a href="${respondUrl}&action=decline" class="btn-decline">&#10007; Decline Offer</a>
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 10px;">
        Clicking either option will open your secure one-time confirmation screen.
      </div>
    </div>

    <div class="footer">
      CodeXa Agency &bull; Engineering & Product Development Directorate<br>
      Authorized Signatory: ${offer.authorized_person || "Ashu Chinthapalli"} (${offer.designation || "Founder & CEO"})<br>
      Inquiries: <a href="mailto:apply@codxa-agency.online" style="color: #cbd5e1;">apply@codxa-agency.online</a>
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmail({
    to: offer.applicant_email,
    subject: `Congratulations! CodeXa Internship Offer – ${offer.applicant_name}`,
    html,
  });
}

