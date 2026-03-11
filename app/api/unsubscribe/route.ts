import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where, deleteDoc } from "firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return new Response(html("Invalid Request", "No email provided."), { headers: { "Content-Type": "text/html" } });
  }

  try {
    const snap = await getDocs(query(collection(db, "subscribers"), where("email", "==", email)));
    if (snap.empty) {
      return new Response(html("Not Found", `${email} was not found in our subscriber list.`), { headers: { "Content-Type": "text/html" } });
    }
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    return new Response(html("Unsubscribed ✓", `${email} has been successfully removed from all Sanctifi3d Labs emails.`), { headers: { "Content-Type": "text/html" } });
  } catch(e) {
    return new Response(html("Error", "Something went wrong. Please try again."), { headers: { "Content-Type": "text/html" } });
  }
}

function html(title: string, message: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title} — Sanctifi3d Labs</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#080808;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}</style>
</head>
<body>
<div style="text-align:center;max-width:440px">
  <div style="font-size:48px;margin-bottom:16px">${title.includes("✓") ? "✅" : title.includes("Not") ? "🔍" : "⚠️"}</div>
  <h1 style="font-size:24px;font-weight:900;margin-bottom:12px;color:#fff">${title}</h1>
  <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin-bottom:28px">${message}</p>
  <a href="https://sanctifi3d-labs.vercel.app" style="background:#34d399;color:#000;border-radius:999px;padding:12px 28px;font-size:14px;font-weight:800;text-decoration:none">← Back to Sanctifi3d Labs</a>
</div>
</body>
</html>`;
}
