import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { sendNewsletter } from "../../../lib/mailer";

export async function POST(request: Request) {
  try {
    const { subject, body, secret, adminKey, html } = await request.json();
    const bodyContent = body || html;
    if ((secret || adminKey) !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const snap = await getDocs(collection(db, "subscribers"));
    const emails = snap.docs.map(d => d.data().email).filter(Boolean);
    if (emails.length === 0) return Response.json({ success: true, sent: 0 });
    await Promise.all(emails.map(email => sendNewsletter(email, subject, bodyContent)));
    return Response.json({ success: true, sent: emails.length });
  } catch(e: any) {
    console.error("Newsletter error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
