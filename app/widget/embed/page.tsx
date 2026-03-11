"use client";
import { useState } from "react";

export default function WidgetEmbed() {
  const [copied, setCopied] = useState(false);
  const code = `<iframe src="https://sanctifi3d-labs.vercel.app/widget" width="320" height="500" frameborder="0" style="border-radius:16px;border:1px solid rgba(255,255,255,.1);"></iframe>`;

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"90px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"var(--fg)", marginBottom:8 }}>📡 Crypto News Widget</h1>
        <p style={{ color:"var(--sub)", fontSize:15, marginBottom:40 }}>Embed live Web3 and crypto news from Sanctifi3d Labs on your website for free.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:32 }}>
          <div>
            <h2 style={{ fontWeight:800, fontSize:18, color:"var(--fg)", marginBottom:16 }}>Preview</h2>
            <iframe src="/widget" height="500" style={{ borderRadius:16, border:"1px solid var(--border)", width:"100%" }} />
          </div>
          <div>
            <h2 style={{ fontWeight:800, fontSize:18, color:"var(--fg)", marginBottom:16 }}>How to embed</h2>
            <p style={{ color:"var(--sub)", fontSize:14, marginBottom:16, lineHeight:1.7 }}>Copy and paste this into any webpage or blog. It shows your latest posts automatically.</p>
            <div style={{ background:"#1e1e1e", borderRadius:10, padding:16, marginBottom:12 }}>
              <p style={{ fontSize:12, color:"#34d399", fontFamily:"monospace", wordBreak:"break-all", lineHeight:1.6 }}>{code}</p>
            </div>
            <button onClick={copy} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"10px 24px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              {copied ? "Copied!" : "Copy Embed Code"}
            </button>
            <div style={{ marginTop:32 }}>
              <h3 style={{ fontWeight:800, fontSize:15, color:"var(--fg)", marginBottom:12 }}>Why embed it?</h3>
              <p style={{ color:"var(--sub)", fontSize:13, lineHeight:1.8 }}>
                Free Web3 news on your site<br/>
                Always updated automatically<br/>
                Drives traffic back to Sanctifi3d Labs<br/>
                No API key needed<br/>
                Works on any website
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
