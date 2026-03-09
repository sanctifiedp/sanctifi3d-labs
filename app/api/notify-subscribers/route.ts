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
  const body = await req.json();
  const { type, title, excerpt, itemId, category, adminKey } = body;
  if (adminKey !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";
  const link = type === "alpha" ? base + "/alpha" : base + "/post/" + itemId;
  const unsub = (email: string) => base + "/api/unsubscribe?email=" + encodeURIComponent(email);
  const accent = type === "alpha" ? "#fbbf24" : "#34d399";
  const subject = (type === "alpha" ? "New Alpha: " : "New Post: ") + title;
  const html = (email: string) => [
    "<div style=font-family:system-ui;max-width:580px;margin:0 auto;background:#080808;color:#fff;border-radius:16px;border:1px solid rgba(255,255,255,.08)>",
    "<div style=padding:32px;border-bottom:1px solid rgba(255,255,255,.1)>",
    "<p style=margin:0 0 8px;font-size:11px;color:" + accent + ";font-weight:800>" + (type==="alpha"?"NEW ALPHA":"NEW POST") + "</p>",
    "<h1 style=margin:0 0 10px;font-size:22px;font-weight:900;color:#fff>" + title + "</h1>",
    "<span style=font-size:11px;background:" + accent + ";color:#000;border-radius:999px;padding:3px 12px>" + category + "</span>",
    "</div><div style=padding:28px 32px>",
    "<p style=color:rgba(255,255,255,.65);font-size:15px;line-height:1.8;margin:0 0 24px>" + excerpt + "</p>",
    "<a href=" + link + " style=display:inline-block;background:" + accent + ";color:#000;border-radius:999px;padding:13px 30px;font-size:14px;font-weight:800;text-decoration:none>" + (type==="alpha"?"View Opportunity":"Read Post") + " &rarr;</a>",
    "</div><div style=padding:16px 32px;border-top:1px solid rgba(255,255,255,.06)>",
    "<p style=margin:0;font-size:12px;color:rgba(255,255,255,.25)>SanctifiedLabs &middot; <a href=https://x.com/Sanctifi3d_1 style=color:#34d399>@Sanctifi3d_1</a> &middot; <a href=" + unsub(email) + " style=color:rgba(255,255,255,.25);text-decoration:underline>Unsubscribe</a></p>",
    "</div></div>"
  ].join("");
  try {
    const snap = await getDocs(collection(db, "subscribers"));
    const subs = snap.docs.map(d => d.data() as any).filter(d => d.email);
    if (!subs.length) return NextResponse.json({ sent: 0, total: 0 });
    const results = await Promise.allSettled(
      subs.map(s => resend.emails.send({ from: "Sanctifi3d Labs <onboarding@resend.dev>", to: s.email, subject, html: html(s.email) }))
    );
    return NextResponse.json({ success: true, sent: results.filter(r => r.status === "fulfilled").length, total: subs.length });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}