import "server-only";
import { resend } from "@/lib/resend";

interface ApplicationReceivedEmailProps {
  name: string;
  email: string;
  referenceId: string;
}

export async function sendApplicationReceivedEmail({
  name,
  email,
  referenceId,
}: ApplicationReceivedEmailProps) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "CodeXa Apply <apply@codxa-agency.online>";
  const replyTo = process.env.RESEND_REPLY_TO || "ashuchinthapalli3900@gmail.com";
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

  return resend.emails.send({
    from: fromEmail,
    replyTo: replyTo,
    to: email,
    subject: `CodeXa Internship Application Received — Ref: ${referenceId}`,
    html: `
      <div style="
        background:#050505;
        color:#ffffff;
        padding:40px;
        font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
        border-radius:12px;
        max-width:580px;
        margin:0 auto;
        border:1px solid #7a0008;
      ">
        <div style="border-bottom:1px solid #222; padding-bottom:16px; margin-bottom:24px;">
          <h1 style="color:#ff1e2d; margin:0; font-size:24px; letter-spacing:2px;">
            CODEXA APPLY
          </h1>
          <div style="color:#888; font-size:12px; font-family:monospace; margin-top:4px;">
            RECRUITMENT UNIVERSE // BATCH 2026
          </div>
        </div>

        <h2 style="color:#fff; font-size:18px; margin-top:0;">Application Received</h2>
        <p style="color:#ccc; font-size:14px; line-height:1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color:#ccc; font-size:14px; line-height:1.6;">
          Your application for the CodeXa Developer Internship has been successfully submitted and logged into our evaluation pipeline.
        </p>

        <div style="
          margin:24px 0;
          padding:20px;
          background:#111;
          border:1px solid #7a0008;
          border-radius:12px;
          text-align:center;
        ">
          <div style="font-size:11px; color:#888; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
            OFFICIAL REFERENCE ID
          </div>
          <h2 style="color:#ff1e2d; font-family:monospace; font-size:22px; margin:0 0 8px 0; letter-spacing:2px;">
            ${referenceId}
          </h2>
          <p style="color:#aaa; font-size:12px; margin:0;">
            Current Status: <strong style="color:#22c55e;">Under Review</strong>
          </p>
        </div>

        <p style="color:#aaa; font-size:13px; line-height:1.6;">
          Please keep your reference ID safe. You can track your application status anytime on our live status portal.
        </p>

        <div style="text-align:center; margin:30px 0;">
          <a href="${baseUrl}/status?ref=${encodeURIComponent(referenceId)}" style="
            background:linear-gradient(135deg, #ff1e2d, #b91c1c);
            color:#ffffff;
            padding:12px 28px;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
            font-size:13px;
            display:inline-block;
            letter-spacing:1px;
          ">
            TRACK STATUS NOW &rarr;
          </a>
        </div>

        <div style="border-top:1px solid #222; padding-top:16px; margin-top:30px; font-size:11px; color:#666; text-align:center;">
          &mdash; CodeXa Agency &bull; Building Technology. Building Developers.
        </div>
      </div>
    `,
  });
}
