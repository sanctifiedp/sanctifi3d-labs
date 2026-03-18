"use client";
import AdminGuard from "../../../components/AdminGuard";
import { useState, useEffect } from "react";
import { db, storage } from "../../../lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ADMIN_KEY = "sanctifi3d_admin_2026";

export default function AdminSettings() {
  const [authed, setAuthed] = useState(false);
  const [key, setKey] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [siteTitle, setSiteTitle] = useState("Sanctifi3d Labs");
  const [siteDesc, setSiteDesc] = useState("AI-Powered Web3 Intelligence");
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_key");
    if (stored === ADMIN_KEY) {
      setAuthed(true);
      loadSettings();
    }
  }, []);

  async function loadSettings() {
    const snap = await getDoc(doc(db, "settings", "site"));
    if (snap.exists()) {
      const d = snap.data();
      setLogoUrl(d.logoUrl || "");
      setSiteTitle(d.siteTitle || "Sanctifi3d Labs");
      setSiteDesc(d.siteDesc || "AI-Powered Web3 Intelligence");
    }
    const subs = await getDocs(collection(db, "subscribers"));
    setSubscriberCount(subs.size);
  }

  function login() {
    if (key === ADMIN_KEY) {
      localStorage.setItem("admin_key", ADMIN_KEY);
      setAuthed(true);
      loadSettings();
    } else {
      setMsg("Wrong password.");
    }
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    try {
      const storageRef = ref(storage, "settings/logo");
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, "settings", "site"), { logoUrl: url }, { merge: true });
      setLogoUrl(url);
      flash("Logo updated!");
    } catch(e) { flash("Upload failed."); }
    setUploading(false);
  }

  async function saveSettings() {
    await setDoc(doc(db, "settings", "site"), { siteTitle, siteDesc }, { merge: true });
    flash("Settings saved!");
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  const card: React.CSSProperties = { background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: 24, marginBottom: 20 };
  const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#9ca3af", marginBottom: 8, letterSpacing: ".04em", textTransform: "uppercase" };
  const input: React.CSSProperties = { width: "100%", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#fff", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const btn = (bg: string, color: string): React.CSSProperties => ({ background: bg, color, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s" });

  if (!authed) return (
    <main style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: 360, padding: 32, background: "#111", border: "1px solid #1f1f1f", borderRadius: 20 }}>
        <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: "0 0 4px" }}>Admin Settings</h1>
        <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 24px" }}>Enter your admin password to continue.</p>
        {msg && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{msg}</p>}
        <input type="password" placeholder="Admin password" value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} style={{ ...input, marginBottom: 12 }} />
        <button onClick={login} style={{ ...btn("#34d399", "#000"), width: "100%" }}>Login</button>
      </div>
    </main>
  );

  return (
    <AdminGuard>
    <main style={{ minHeight: "100vh", background: "#080808", fontFamily: "system-ui,sans-serif", padding: "90px 20px 60px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 28, margin: "0 0 4px" }}>⚙ Settings</h1>
            <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>Manage your site configuration</p>
          </div>
          <a href="/admin" style={{ color: "#34d399", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>← Back to Admin</a>
        </div>

        {msg && <div style={{ background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#34d399", fontSize: 14, fontWeight: 600 }}>{msg}</div>}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Subscribers", value: subscriberCount, color: "#34d399" },
            { label: "Platform", value: "Vercel", color: "#38bdf8" },
            { label: "Database", value: "Firebase", color: "#fbbf24" },
            { label: "AI Model", value: "Groq", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, padding: "16px" }}>
              <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 20, fontWeight: 900, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Logo Upload */}
        <div style={card}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>Site Logo</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>Upload a square image. Shown as a circle next to your site name on all pages.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid #34d399" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1f1f1f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏷️</div>
            )}
            <div>
              <p style={{ color: "#9ca3af", fontSize: 12, margin: "0 0 8px" }}>Recommended: 200×200px PNG or JPG</p>
              <label style={{ ...btn("#34d399", "#000"), display: "inline-block", cursor: "pointer" }}>
                {uploading ? "Uploading..." : "Choose Image"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

        {/* Site Info */}
        <div style={card}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>Site Information</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>Basic info used across the site and in emails.</p>
          <label style={label}>Site Name</label>
          <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} style={{ ...input, marginBottom: 16 }} />
          <label style={label}>Tagline</label>
          <input value={siteDesc} onChange={e => setSiteDesc(e.target.value)} style={{ ...input, marginBottom: 20 }} />
          <button onClick={saveSettings} style={btn("#34d399", "#000")}>Save Changes</button>
        </div>

        {/* Links */}
        <div style={card}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 16px" }}>Quick Links</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "Live Site", href: "https://sanctifi3d-labs.vercel.app" },
              { label: "Admin Panel", href: "/admin" },
              { label: "Subscribers", href: "/admin?tab=subscribers" },
              { label: "RSS Feed", href: "/feed.xml" },
              { label: "Sitemap", href: "/sitemap.xml" },
              { label: "Widget", href: "/widget/embed" },
            ].map(l => (
              <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined}
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#9ca3af", textDecoration: "none", fontWeight: 600 }}>
                {l.label} →
              </a>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...card, border: "1px solid rgba(248,113,113,.2)" }}>
          <h2 style={{ color: "#f87171", fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>Danger Zone</h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 16px" }}>Irreversible actions. Be careful.</p>
          <button onClick={() => { localStorage.removeItem("admin_key"); window.location.href = "/admin/settings"; }}
            style={btn("rgba(248,113,113,.1)", "#f87171")}>
            Sign Out of Admin
          </button>
        </div>

      </div>
    </main>
    </AdminGuard>
  );
