import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);

const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

export async function POST(req: NextRequest) {
  const { subject, html, adminKey } = await req.json();
  if (adminKey !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!subject || !html) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    const snap = await getDocs(collection(db, "subscribers"));
    const emails = snap.docs.map(d => (d.data() as any).email).filter(Boolean);
    if (emails.length === 0) return NextResponse.json({ error: "No subscribers" }, { status: 400 });

    const results = await Promise.allSettled(
      emails.map(email =>
        resend.emails.send({
          from: "Sanctifi3d Labs <onboarding@resend.dev>",
          to: email,
          subject,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#080808;color:#fff;border-radius:16px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#34d399,#6366f1);padding:32px;text-align:center">
                <h1 style="margin:0;font-size:24px;font-weight:900;color:#000">Sanctifi3d<span style="color:#fff">Labs</span></h1>
              </div>
              <div style="padding:32px">${html}</div>
              <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,.08);text-align:center">
                <p style="color:rgba(255,255,255,.3);font-size:12px;margin:0">
                  <a href="https://x.com/Sanctifi3d_1" style="color:#34d399">𝕏 @Sanctifi3d_1</a>
                </p>
              </div>
            </div>
          `
        })
      )
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    return NextResponse.json({ success: true, sent, total: emails.length });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
