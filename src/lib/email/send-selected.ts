import "server-only";
import { resend } from "@/lib/resend";

interface SelectedEmailProps {
  name: string;
  email: string;
  referenceId: string;
}

export async function sendSelectedEmail({
  name,
  email,
  referenceId,
}: SelectedEmailProps) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "CodeXa Apply <apply@codxa-agency.online>";
  const replyTo = process.env.RESEND_REPLY_TO || "ashuchinthapalli3900@gmail.com";
  const whatsappInvite = process.env.SELECTED_WHATSAPP_INVITE || "https://chat.whatsapp.com/KhQQhvFz3Zj9vFa52COntg";
  const discordInvite = process.env.SELECTED_DISCORD_INVITE || "https://discord.gg/tdAYaxEJ9B";

  return resend.emails.send({
    from: fromEmail,
    replyTo: replyTo,
    to: email,
    subject: "Congratulations — Welcome to CodeXa Developer Internship",
    html: `
      <div style="
        background:#050505;
        color:#ffffff;
        padding:40px;
        font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;
        border-radius:12px;
        max-width:580px;
        margin:0 auto;
        border:1px solid #ff1e2d;
      ">
        <div style="border-bottom:1px solid #222; padding-bottom:16px; margin-bottom:24px;">
          <h1 style="color:#ff1e2d; margin:0; font-size:24px; letter-spacing:2px;">
            CODEXA AGENCY
          </h1>
          <div style="color:#22c55e; font-size:12px; font-family:monospace; margin-top:4px; font-weight:bold;">
            OFFICIAL ADMISSION NOTICE // BATCH 2026
          </div>
        </div>

        <h2 style="color:#ff1e2d; font-size:22px; margin-top:0;">CONGRATULATIONS &mdash; YOU'RE SELECTED!</h2>
        <p style="color:#eee; font-size:15px; line-height:1.6;">Hello <strong>${name}</strong>,</p>
        <p style="color:#ccc; font-size:14px; line-height:1.6;">
          Your application and 8-round screening responses have been thoroughly reviewed by the CodeXa technical leadership team.
        </p>
        <p style="color:#ccc; font-size:14px; line-height:1.6;">
          We are thrilled to offer you a position in the <strong>CodeXa Developer Internship (Batch 2026)</strong>.
        </p>

        <div style="
          margin:24px 0;
          padding:16px;
          background:#111;
          border:1px solid #333;
          border-radius:10px;
          text-align:center;
        ">
          <small style="color:#888; letter-spacing:1px;">CANDIDATE REFERENCE ID</small>
          <div style="color:#fff; font-family:monospace; font-size:18px; font-weight:bold; margin-top:4px;">
            ${referenceId}
          </div>
        </div>

        <h3 style="color:#fff; font-size:14px; margin-top:24px;">NEXT STEPS & ONBOARDING CHANNELS:</h3>
        <p style="color:#aaa; font-size:13px; line-height:1.5;">
          Please join our official candidate communication hubs immediately using the private invite links below:
        </p>

        <div style="margin:25px 0; text-align:center;">
          <a
            href="${whatsappInvite}"
            target="_blank"
            style="
              background:#25D366;
              color:white;
              padding:13px 22px;
              text-decoration:none;
              border-radius:8px;
              display:inline-block;
              font-weight:bold;
              font-size:13px;
              margin-right:12px;
              margin-bottom:10px;
            "
          >
            Join WhatsApp Group &rarr;
          </a>
          <a
            href="${discordInvite}"
            target="_blank"
            style="
              background:#5865F2;
              color:white;
              padding:13px 22px;
              text-decoration:none;
              border-radius:8px;
              display:inline-block;
              font-weight:bold;
              font-size:13px;
              margin-bottom:10px;
            "
          >
            Join Discord Server &rarr;
          </a>
        </div>

        <p style="color:#aaa; font-size:13px; line-height:1.6;">
          Welcome aboard. Let&rsquo;s build world-class technology together.
        </p>

        <div style="border-top:1px solid #222; padding-top:16px; margin-top:30px; font-size:11px; color:#666; text-align:center;">
          Founder: Ashu &bull; Co-Founder: Deepak &bull; CEO: Kishore<br>
          CodeXa Agency &bull; <a href="https://www.codxa-agency.online" style="color:#888; text-decoration:none;">www.codxa-agency.online</a>
        </div>
      </div>
    `,
  });
}
