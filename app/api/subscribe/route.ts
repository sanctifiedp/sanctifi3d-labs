import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  try {
    await resend.emails.send({
      from: "Sanctifi3d Labs <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Sanctifi3d Labs ✦",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#080808;color:#fff;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#34d399,#6366f1);padding:40px 32px;text-align:center">
            <h1 style="margin:0;font-size:28px;font-weight:900;color:#000">Sanctifi3d<span style="color:#fff">Labs</span></h1>
            <p style="margin:8px 0 0;color:rgba(0,0,0,.7);font-size:14px">AI-Powered Web3 & Crypto Intelligence</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#fff">Welcome to the Lab! 🎉</h2>
            <p style="color:rgba(255,255,255,.7);font-size:15px;line-height:1.7;margin:0 0 20px">
              You're now part of the Sanctifi3d Labs community — where Web3 builders, crypto traders, designers and AI enthusiasts get their edge.
            </p>
            <p style="color:rgba(255,255,255,.7);font-size:15px;line-height:1.7;margin:0 0 24px">
              Here's what you'll get:<br/>
              <span style="color:#34d399">✦</span> Daily AI-curated Web3 & crypto news<br/>
              <span style="color:#fbbf24">⚡</span> Alpha drops — airdrops, bounties, contests & gigs<br/>
              <span style="color:#f472b6">🎨</span> Design opportunities and resources<br/>
              <span style="color:#38bdf8">🤖</span> AI tool launches and grants
            </p>
            <a href="https://sanctifi3d-labs.vercel.app" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:12px 28px;font-size:14px;font-weight:800;text-decoration:none">Read Latest Posts →</a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.08);text-align:center">
            <p style="color:rgba(255,255,255,.3);font-size:12px;margin:0">
              Follow us on <a href="https://x.com/Sanctifi3d_1" style="color:#34d399">𝕏 @Sanctifi3d_1</a> · 
              <a href="https://sanctifi3d-labs.vercel.app/legal" style="color:rgba(255,255,255,.3)">Unsubscribe</a>
            </p>
          </div>
        </div>
      `
    });
    return NextResponse.json({ success: true });
  } catch(e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
