import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";

    await resend.emails.send({
      from: "Sanctifi3d Labs <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Sanctifi3d Labs ✦",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#080808;font-family:system-ui,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0;">Sanctifi3d<span style="color:#34d399;">Labs</span></h1>
              <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">AI-Powered Web3 Intelligence</p>
            </div>
            <div style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:32px;margin-bottom:24px;">
              <h2 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 12px;">Welcome to the Lab ✦</h2>
              <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 20px;">You're now subscribed to Sanctifi3d Labs. You'll receive:</p>
              <div style="margin-bottom:8px;"><span style="color:#34d399;">⚡</span> <span style="color:#d1fae5;font-size:14px;">Hot Web3 & crypto news as it drops</span></div>
              <div style="margin-bottom:8px;"><span style="color:#fbbf24;">💎</span> <span style="color:#d1fae5;font-size:14px;">Alpha opportunities — airdrops, bounties, grants</span></div>
              <div style="margin-bottom:8px;"><span style="color:#f472b6;">🎨</span> <span style="color:#d1fae5;font-size:14px;">Design resources and AI tools updates</span></div>
              <div style="margin-bottom:20px;"><span style="color:#38bdf8;">🤖</span> <span style="color:#d1fae5;font-size:14px;">AI-powered insights from the ecosystem</span></div>
              <a href="${siteUrl}" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:12px 28px;font-size:14px;font-weight:800;text-decoration:none;">Explore the Lab →</a>
            </div>
            <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
              Don't want emails? <a href="${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#6b7280;">Unsubscribe</a>
            </p>
          </div>
        </body>
        </html>
      `
    });

    return Response.json({ success: true });
  } catch(e: any) {
    console.error("Subscribe error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
