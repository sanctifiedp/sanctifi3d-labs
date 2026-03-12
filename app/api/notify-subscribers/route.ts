import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { sendNotification } from "../../../lib/mailer";

export async function POST(request: Request) {
  try {
    const { title, excerpt, postId, type } = await request.json();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanctifi3d-labs.vercel.app";
    const snap = await getDocs(collection(db, "subscribers"));
    const emails = snap.docs.map(d => d.data().email).filter(Boolean);
    if (emails.length === 0) return Response.json({ success: true, sent: 0 });
    const link = type === "alpha" ? `${siteUrl}/alpha` : `${siteUrl}/post/${postId}`;
    await Promise.all(emails.map(email => sendNotification(email, title, excerpt, link, type)));
    return Response.json({ success: true, sent: emails.length });
  } catch(e: any) {
    console.error("Notify error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
