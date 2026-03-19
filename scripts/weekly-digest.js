const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require("firebase/firestore");
const { Resend } = require("resend");

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE = "https://sanctifi3d-labs.vercel.app";

async function run() {
  console.log("Running weekly digest...");

  // Get posts from the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const postsSnap = await getDocs(query(
    collection(db, "posts"),
    where("status", "==", "approved"),
    where("createdAt", ">=", weekAgo),
  ));

  let posts = postsSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  // If less than 3 posts this week, grab latest approved posts
  if (posts.length < 3) {
    const fallbackSnap = await getDocs(query(
      collection(db, "posts"),
      where("status", "==", "approved"),
    ));
    posts = fallbackSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  // Get top alpha from the week
  const alphaSnap = await getDocs(query(
    collection(db, "alpha"),
    where("status", "==", "approved"),
    where("createdAt", ">=", weekAgo),
  ));
  const alphas = alphaSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .slice(0, 3);

  // Get subscriber count
  const subsSnap = await getDocs(collection(db, "subscribers"));
  const subscribers = subsSnap.docs.map(d => d.data().email).filter(Boolean);

  if (subscribers.length === 0) {
    console.log("No subscribers. Skipping.");
    return;
  }

  console.log(`Sending to ${subscribers.length} subscribers...`);

  const weekStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const postsHTML = posts.map((p, i) => `
    <a href="${SITE}/post/${p.id}" style="display:block;text-decoration:none;color:inherit;background:#111;border:1px solid #1f1f1f;border-radius:14px;overflow:hidden;margin-bottom:12px;">
      ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.title}" style="width:100%;height:180px;object-fit:cover;display:block;" />` : ""}
      <div style="padding:16px 20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          ${i === 0 ? `<span style="background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);border-radius:999px;padding:2px 10px;font-size:10px;color:#34d399;font-weight:700;">🔥 TOP THIS WEEK</span>` : ""}
          <span style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;">${p.category || ""}</span>
        </div>
        <h3 style="font-size:16px;font-weight:800;color:#fff;margin:0 0 8px;line-height:1.4;">${p.title}</h3>
        <p style="font-size:13px;color:#9ca3af;margin:0 0 12px;line-height:1.6;">${(p.content || "").replace(/<[^>]+>/g, "").slice(0, 120)}...</p>
        <span style="font-size:12px;color:#34d399;font-weight:700;">Read more →</span>
      </div>
    </a>
  `).join("");

  const alphaHTML = alphas.length > 0 ? `
    <div style="background:#0a0a0a;border:1px solid rgba(52,211,153,.2);border-radius:14px;padding:20px;margin-bottom:24px;">
      <h3 style="font-size:16px;font-weight:900;color:#34d399;margin:0 0 14px;">⚡ Alpha This Week</h3>
      ${alphas.map(a => `
        <a href="${SITE}/alpha" style="display:block;text-decoration:none;padding:10px 0;border-bottom:1px solid #1f1f1f;">
          <div style="font-size:11px;color:#fbbf24;font-weight:700;text-transform:uppercase;margin-bottom:4px;">${a.type || "Alpha"}</div>
          <div style="font-size:14px;font-weight:700;color:#fff;">${a.title}</div>
        </a>
      `).join("")}
      <a href="${SITE}/alpha" style="display:inline-block;margin-top:12px;font-size:12px;color:#34d399;font-weight:700;text-decoration:none;">View all alpha →</a>
    </div>
  ` : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid #1f1f1f;">
      <h1 style="font-size:28px;font-weight:900;color:#fff;margin:0 0 4px;">Sanctifi3d<span style="color:#34d399;">Labs</span></h1>
      <p style="color:#6b7280;font-size:13px;margin:0;">Weekly Digest · ${weekStr}</p>
    </div>

    <!-- Intro -->
    <div style="background:linear-gradient(135deg,rgba(52,211,153,.08),rgba(56,189,248,.08));border:1px solid rgba(52,211,153,.15);border-radius:14px;padding:20px;margin-bottom:28px;">
      <p style="color:#d1fae5;font-size:15px;font-weight:700;margin:0 0 6px;">Your weekly Web3 & crypto roundup is here 🚀</p>
      <p style="color:#9ca3af;font-size:13px;margin:0;line-height:1.7;">Here's what happened in the ecosystem this week — the top stories, alpha opportunities, and insights you need to stay ahead.</p>
    </div>

    <!-- Alpha -->
    ${alphaHTML}

    <!-- Top posts -->
    <h2 style="font-size:18px;font-weight:900;color:#fff;margin:0 0 16px;">📰 Top Stories This Week</h2>
    ${postsHTML}

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0;">
      <a href="${SITE}" style="display:inline-block;background:#34d399;color:#000;border-radius:999px;padding:13px 32px;font-size:14px;font-weight:800;text-decoration:none;">Visit Sanctifi3d Labs →</a>
    </div>

    <!-- Community -->
    <div style="background:#111;border:1px solid #1f1f1f;border-radius:14px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="color:#fff;font-size:14px;font-weight:800;margin:0 0 6px;">💬 Join the Community Rooms</p>
      <p style="color:#9ca3af;font-size:12px;margin:0 0 12px;">Discuss Web3, share alpha, and connect with other builders.</p>
      <a href="${SITE}/rooms" style="display:inline-block;background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.3);border-radius:999px;padding:8px 20px;font-size:13px;font-weight:700;text-decoration:none;">Explore Rooms →</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:20px;border-top:1px solid #1f1f1f;">
      <p style="color:#4b5563;font-size:12px;margin:0 0 8px;">You're receiving this because you subscribed to Sanctifi3d Labs.</p>
      <p style="color:#4b5563;font-size:12px;margin:0;">
        <a href="${SITE}" style="color:#6b7280;text-decoration:none;">Visit site</a> ·
        <a href="${SITE}/rooms" style="color:#6b7280;text-decoration:none;">Community</a> ·
        <a href="${SITE}/api/unsubscribe?email={{EMAIL}}" style="color:#6b7280;text-decoration:none;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  // Send to all subscribers
  let sent = 0;
  let failed = 0;

  for (const email of subscribers) {
    try {
      await resend.emails.send({
        from: "Sanctifi3d Labs <onboarding@resend.dev>",
        to: email,
        subject: `🗞️ Weekly Digest — ${weekStr}`,
        html: html.replace("{{EMAIL}}", encodeURIComponent(email)),
      });
      sent++;
      console.log(`✓ Sent to ${email}`);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    } catch(e) {
      console.error(`✗ Failed for ${email}:`, e.message);
      failed++;
    }
  }

  console.log(`\nDone! Sent: ${sent}, Failed: ${failed}, Total: ${subscribers.length}`);
}

run().catch(console.error);
