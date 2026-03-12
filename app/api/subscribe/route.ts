import { sendWelcomeEmail } from "../../../lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    await sendWelcomeEmail(email);
    return Response.json({ success: true });
  } catch(e: any) {
    console.error("Subscribe error:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
