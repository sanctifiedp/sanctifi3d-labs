import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { title, excerpt, postId, type } = await request.json();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";
    const snap = await getDocs(collection(db, "subscribers"));
    const emails = snap.docs.map(d => d.data().email).filter(Boolean);
    if (emails.length === 0) return Response.json({ success: true, sent: 0 });

    const link = type === "alpha" ? `${siteUrl}/alpha` : `${siteUrl}/post/${postId}`;

    await Promise.all(emails.map(email =>
      resend.emails.send({
        from: "Sanctifi3d Labs <onboarding@resend.dev>",
        to: email,
        subject: `New: ${title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="margin:0;padding:0;background:#080808;font-family:system-ui,sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
              <h1 style="font-size:24px;font-weight:900;color:#fff;margin:0 0 4px;">Sanctifi3d<span style="color:#34d399;">Labs</span></h1>
              <p style="color:#6b7280;font-size:12px;margin:0 0 28px;">New ${type === "alpha" ? "Alpha Opportunity" : "Post"}</p>
              <div style="background:#111;border:1px solid #1f1f1f;border-radius:16px;padding:28px;margin-bottom:24px;">
                <h2 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 12px;">${title}</h2>
                <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px;">${excerpt?.slice(0,200)}...</p>
                <a href="${link}" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:11px 24px;font-size:14px;font-weight:800;text-decoration:none;">Read Now →</a>
              </div>
              <p style="color:#4b5563;font-size:12px;text-align:center;">
                <a href="${siteUrl}/api/unsubscribe?email=${encodeURIComponent(email)}" style="color:#6b7280;">Unsubscribe</a>
              </p>
            </div>
          </body>
          </html>
        `
      })
    ));

    return Response.json({ success: true, sent: emails.length });
  } catch(e: any) {
    console.error("Notify error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
