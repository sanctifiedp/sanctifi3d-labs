import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";

function baseTemplate(content: string, email?: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:system-ui,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;">Sanctifi3d<span style="color:#34d399;">Labs</span></h1>
    <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">AI-Powered Web3 Intelligence</p>
  </div>
  <div style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:32px;margin-bottom:24px;">
    ${content}
  </div>
  ${email ? `<p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">Don't want emails? <a href="${SITE}/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#6b7280;">Unsubscribe</a></p>` : ""}
</div>
</body></html>`;
}

export async function sendWelcomeEmail(email: string) {
  await transporter.sendMail({
    from: `"Sanctifi3d Labs" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Welcome to Sanctifi3d Labs ✦",
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 12px;">Welcome to the Lab ✦</h2>
      <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">You're now subscribed. You'll receive:</p>
      <div style="margin-bottom:8px;"><span style="color:#34d399;">⚡</span> <span style="color:#d1fae5;font-size:14px;">Hot Web3 & crypto news as it drops</span></div>
      <div style="margin-bottom:8px;"><span style="color:#fbbf24;">💎</span> <span style="color:#d1fae5;font-size:14px;">Alpha opportunities — airdrops, bounties, grants</span></div>
      <div style="margin-bottom:8px;"><span style="color:#f472b6;">🎨</span> <span style="color:#d1fae5;font-size:14px;">Design resources and AI tools</span></div>
      <div style="margin-bottom:20px;"><span style="color:#38bdf8;">🤖</span> <span style="color:#d1fae5;font-size:14px;">AI-powered insights</span></div>
      <a href="${SITE}" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:12px 28px;font-size:14px;font-weight:800;text-decoration:none;">Explore the Lab →</a>
    `, email)
  });
}

export async function sendNotification(email: string, title: string, excerpt: string, link: string, type: string) {
  await transporter.sendMail({
    from: `"Sanctifi3d Labs" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `New ${type === "alpha" ? "Alpha" : "Post"}: ${title}`,
    html: baseTemplate(`
      <p style="color:#34d399;font-size:11px;font-weight:800;letter-spacing:.06em;margin:0 0 12px;">NEW ${type === "alpha" ? "ALPHA OPPORTUNITY" : "POST"}</p>
      <h2 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 12px;">${title}</h2>
      <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px;">${excerpt?.slice(0,200)}...</p>
      <a href="${link}" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:11px 24px;font-size:14px;font-weight:800;text-decoration:none;">Read Now →</a>
    `, email)
  });
}

export async function sendNewsletter(email: string, subject: string, body: string) {
  await transporter.sendMail({
    from: `"Sanctifi3d Labs" <${process.env.GMAIL_USER}>`,
    to: email,
    subject,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 16px;">${subject}</h2>
      <div style="color:#9ca3af;font-size:14px;line-height:1.8;">${body}</div>
    `, email)
  });
}
