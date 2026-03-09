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

function makeHtml(type: string, title: string, excerpt: string, link: string, category: string, unsubUrl: string): string {
  const accent = type === "alpha" ? "#fbbf24" : "#34d399";
  const icon = type === "alpha" ? "&#9889;" : "&#10022;";
  const label = type === "alpha" ? "New Alpha Opportunity" : "New Post Published";
  const btnText = type === "alpha" ? "View Opportunity &rarr;" : "Read Full Post &rarr;";
  const parts: string[] = [];
  parts.push("<div style=\"font-family:system-ui,sans-serif;max-width:580px;margin:0 auto;background:#080808;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08)\">");
  parts.push("<div style=\"padding:32px;border-bottom:1px solid rgba(255,255,255,.08)\">");
  parts.push("<p style=\"margin:0 0 8px;font-size:11px;color:" + accent + ";font-weight:800;text-transform:uppercase\">" + icon + " " + label + "</p>");
  parts.push("<h1 style=\"margin:0 0 10px;font-size:22px;font-weight:900;color:#fff\">" + title + "</h1>");
  parts.push("<span style=\"font-size:11px;color:#000;background:" + accent + ";border-radius:999px;padding:3px 12px;font-weight:700\">" + category + "</span>");
  parts.push("</div>");
  parts.push("<div style=\"padding:28px 32px\">");
  parts.push("<p style=\"color:rgba(255,255,255,.65);font-size:15px;line-height:1.8;margin:0 0 24px\">" + excerpt + "</p>");
  parts.push("<a href=\"" + link + "\" style=\"display:inline-block;background:" + accent + ";color:#000;border-radius:999px;padding:13px 30px;font-size:14px;font-weight:800;text-decoration:none\">" + btnText + "</a>");
  parts.push("</div>");
  parts.push("<div style=\"padding:16px 32px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.06)\">");
  parts.push("<p style=\"margin:0;font-size:12px;color:rgba(255,255,255,.25)\">Sanctifi3dLabs &nbsp;&middot;&nbsp; <a href=\"https://x.com/Sanctifi3d_1\" style=\"color:#34d399;text-decoration:none\">@Sanctifi3d_1</a> &nbsp;&middot;&nbsp; <a href=\"" + unsubUrl + "\" style=\"color:rgba(255,255,255,.25);text-decoration:underline\">Unsubscribe</a></p>");
  parts.push("</div></div>");
  return parts.join("");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, title, excerpt, itemId, category, adminKey } = body;
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";
  const link = type === "alpha" ? baseUrl + "/alpha" : baseUrl + "/post/" + itemId;
  const subject = type === "alpha" ? "New Alpha: " + title : "New Post: " + title;
  try {
    const snap = await getDocs(collection(db, "subscribers"));
    const subs = snap.docs.map(d => d.data() as any).filter(d => d.email);
    if (!subs.length) return NextResponse.json({ sent: 0, total: 0 });
    const results = await Promise.allSettled(
      subs.map(s => {
        const unsubUrl = baseUrl + "/api/unsubscribe?email=" + encodeURIComponent(s.email);
        return resend.emails.send({
          from: "Sanctifi3d Labs <onboarding@resend.dev>",
          to: s.email,
          subject,
          html: makeHtml(type, title, excerpt, link, category, unsubUrl)
        });
      })
    );
    const sent = results.filter(r => r.status === "fulfilled").length;
    return NextResponse.json({ success: true, sent, total: subs.length });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
