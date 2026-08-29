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
