"use client";
import { useState } from "react";
import { useTheme } from "../../lib/ThemeContext";

export default function Settings() {
  const { dark, toggle } = useTheme();
  const [unsubEmail, setUnsubEmail] = useState("");
  const [unsubStatus, setUnsubStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [unsubMsg, setUnsubMsg] = useState("");

  async function handleUnsubscribe() {
    if (!unsubEmail.includes("@")) { setUnsubMsg("Enter a valid email."); return; }
    setUnsubStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe?email=" + encodeURIComponent(unsubEmail));
      const text = await res.text();
      if (text.includes("Unsubscribed")) {
        setUnsubStatus("done");
        setUnsubMsg("You've been unsubscribed successfully.");
      } else if (text.includes("not found")) {
        setUnsubStatus("error");
        setUnsubMsg("Email not found in our subscriber list.");
      } else {
        setUnsubStatus("done");
        setUnsubMsg("Done! You won't receive further emails.");
      }
    } catch(e) {
      setUnsubStatus("error");
      setUnsubMsg("Something went wrong. Try again.");
    }
  }

  const card = { background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"24px", marginBottom:16 } as any;
  const inp = { width:"100%", background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--fg)", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" } as any;

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"90px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <h1 style={{ fontSize:"clamp(24px,5vw,38px)", fontWeight:900, marginBottom:6, color:"var(--fg)" }}>Settings</h1>
        <p style={{ color:"var(--sub)", fontSize:14, marginBottom:32 }}>Manage your preferences</p>

        {/* THEME */}
        <div style={card}>
          <h2 style={{ fontWeight:800, fontSize:16, margin:"0 0 6px", color:"var(--fg)" }}>Appearance</h2>
          <p style={{ color:"var(--sub)", fontSize:13, margin:"0 0 18px" }}>Choose how Sanctifi3d Labs looks to you.</p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:dark?"rgba(255,255,255,.04)":"rgba(0,0,0,.04)", borderRadius:10, padding:"14px 18px" }}>
            <div>
              <p style={{ fontWeight:700, fontSize:14, margin:"0 0 3px", color:"var(--fg)" }}>{dark ? "🌙 Dark Mode" : "☀️ Light Mode"}</p>
              <p style={{ fontSize:12, color:"var(--sub)", margin:0 }}>{dark ? "Easy on the eyes" : "Bright and clean"}</p>
            </div>
            <button onClick={toggle} style={{
              width:52, height:28, borderRadius:999, border:"none", cursor:"pointer", position:"relative",
              background: dark ? "#34d399" : "rgba(0,0,0,.15)", transition:"background .3s"
            }}>
              <div style={{
                position:"absolute", top:3, width:22, height:22, borderRadius:"50%",
                background:"#fff", transition:"left .3s", left: dark ? 27 : 3,
                boxShadow:"0 1px 4px rgba(0,0,0,.3)"
              }} />
            </button>
          </div>
        </div>

        {/* PORTFOLIO */}
        <div style={card}>
          <h2 style={{ fontWeight:800, fontSize:16, margin:"0 0 6px", color:"var(--fg)" }}>Portfolio</h2>
          <p style={{ color:"var(--sub)", fontSize:13, margin:"0 0 18px" }}>View my design work and past projects.</p>
          <a href="https://bit.ly/AdeyiGbeminiyi" target="_blank" style={{ display:"inline-block", background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:700, color:"var(--fg)", textDecoration:"none" }}>
            🎨 View Portfolio →
          </a>
        </div>

        {/* FOLLOW */}
        <div style={card}>
          <h2 style={{ fontWeight:800, fontSize:16, margin:"0 0 6px", color:"var(--fg)" }}>Follow on 𝕏</h2>
          <p style={{ color:"var(--sub)", fontSize:13, margin:"0 0 18px" }}>Get real-time alpha and updates on X/Twitter.</p>
          <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ display:"inline-block", background:"#000", border:"1px solid #333", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:700, color:"#fff", textDecoration:"none" }}>
            𝕏 @Sanctifi3d_1
          </a>
        </div>

        {/* UNSUBSCRIBE */}
        <div style={{ ...card, border:"1px solid rgba(248,113,113,.2)" }}>
          <h2 style={{ fontWeight:800, fontSize:16, margin:"0 0 6px", color:"var(--fg)" }}>Unsubscribe from Newsletter</h2>
          <p style={{ color:"var(--sub)", fontSize:13, margin:"0 0 18px" }}>No longer want email updates? Enter your email below to unsubscribe.</p>
          {unsubStatus === "done" ? (
            <div style={{ background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.2)", borderRadius:8, padding:"14px 18px" }}>
              <p style={{ color:"#34d399", fontWeight:700, fontSize:14, margin:0 }}>✓ {unsubMsg}</p>
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="your@email.com"
                value={unsubEmail}
                onChange={e => { setUnsubEmail(e.target.value); setUnsubMsg(""); }}
                style={{ ...inp, marginBottom:10 }}
              />
              {unsubMsg && <p style={{ fontSize:13, color:unsubStatus==="error"?"#f87171":"var(--sub)", marginBottom:10 }}>{unsubMsg}</p>}
              <button onClick={handleUnsubscribe} disabled={unsubStatus==="loading"} style={{ background:"rgba(248,113,113,.12)", color:"#f87171", border:"1px solid rgba(248,113,113,.2)", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                {unsubStatus==="loading" ? "Processing..." : "Unsubscribe"}
              </button>
            </>
          )}
        </div>

        {/* VERSION */}
        <p style={{ textAlign:"center", fontSize:12, color:"var(--sub)", marginTop:24 }}>
          Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span> v1.0 · Built with ❤️ in Lagos
        </p>
      </div>
    </main>
  );
}
