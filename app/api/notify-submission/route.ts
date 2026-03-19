import { sendWelcomeEmail } from "../../../lib/mailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";

export async function POST(request: Request) {
  try {
    const { email, name, title, status, link, note } = await request.json();

    const isApproved = status === "approved";

    await resend.emails.send({
      from: "Sanctifi3d Labs <onboarding@resend.dev>",
      to: email,
      subject: isApproved ? `🎉 Your submission was approved: ${title}` : `Update on your submission: ${title}`,
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#080808;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 4px;">Sanctifi3d<span style="color:#34d399;">Labs</span></h1>
  <p style="color:#6b7280;font-size:13px;margin:0 0 28px;">Submission Update</p>
  <div style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:28px;">
    <div style="font-size:40px;margin-bottom:16px;">${isApproved ? "🎉" : "📋"}</div>
    <h2 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 8px;">
      ${isApproved ? "Your submission was approved!" : "Submission update"}
    </h2>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 16px;">
      ${isApproved
        ? `Great news! Your submission "<strong style="color:#fff;">${title}</strong>" has been approved and is now live on Sanctifi3d Labs.`
        : `Your submission "<strong style="color:#fff;">${title}</strong>" has been reviewed. Unfortunately it wasn't approved at this time.`
      }
    </p>
    ${note ? `<div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.2);border-radius:8px;padding:12px 16px;margin-bottom:16px;"><p style="color:#fbbf24;font-size:13px;margin:0;">Admin note: ${note}</p></div>` : ""}
    ${isApproved && link ? `<a href="${link}" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:11px 24px;font-size:14px;font-weight:800;text-decoration:none;">View Your Post →</a>` : ""}
    ${!isApproved ? `<a href="${SITE}/submit" style="display:inline-block;background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.3);border-radius:999px;padding:11px 24px;font-size:14px;font-weight:700;text-decoration:none;">Submit Again →</a>` : ""}
  </div>
</div>
</body>
</html>`
    });

    return Response.json({ success: true });
  } catch(e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
