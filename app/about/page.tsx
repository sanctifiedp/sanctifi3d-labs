"use client";

export default function About() {
  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"80px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.25)", borderRadius:999, padding:"5px 16px", fontSize:12, color:"#34d399", fontWeight:700, marginBottom:20 }}>
          ✦ THE LAB
        </div>
        <h1 style={{ fontSize:"clamp(32px,7vw,56px)", fontWeight:900, letterSpacing:"-.03em", lineHeight:1.1, marginBottom:20, color:"var(--fg)" }}>
          Built for the<br /><span style={{ color:"#34d399" }}>ones who move first.</span>
        </h1>
        <p style={{ fontSize:16, color:"var(--sub)", lineHeight:1.8, marginBottom:24 }}>
          Sanctifi3d Labs is an AI-powered content and alpha aggregation platform for Web3 builders, crypto traders, graphic designers and AI enthusiasts. We combine human curation with AI automation to surface what matters — faster than anyone else.
        </p>
        <p style={{ fontSize:16, color:"var(--sub)", lineHeight:1.8, marginBottom:24 }}>
          Every post, every alpha drop, every earning opportunity is reviewed before it reaches you. No spam. No noise. Just signal.
        </p>
        <p style={{ fontSize:16, color:"var(--sub)", lineHeight:1.8, marginBottom:40 }}>
          Built and curated by <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ color:"#34d399", fontWeight:700 }}>@Sanctifi3d_1</a> — a Web3-native graphic designer and content creator based in Nigeria.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, marginBottom:48 }}>
          {[["📰","AI News","Auto-aggregated from top Web3 & crypto sources"],["⚡","Alpha Hunter","Airdrops, bounties, contests & gigs curated daily"],["🎨","Design","Resources and opportunities for graphic designers"],["🤖","AI Tools","Latest AI launches, grants and opportunities"]].map(([icon,title,desc])=>(
            <div key={title} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 16px", backdropFilter:"blur(8px)" }}>
              <span style={{ fontSize:28 }}>{icon}</span>
              <p style={{ fontWeight:800, fontSize:14, margin:"10px 0 6px", color:"var(--fg)" }}>{title}</p>
              <p style={{ fontSize:12, color:"var(--sub)", lineHeight:1.6, margin:0 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <a href="/" style={{ background:"#34d399", color:"#000", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:800, textDecoration:"none" }}>Read Latest</a>
          <a href="/alpha" style={{ background:"var(--card)", border:"1px solid var(--border)", color:"var(--fg)", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:700, textDecoration:"none" }}>⚡ View Alpha</a>
          <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ background:"var(--card)", border:"1px solid var(--border)", color:"var(--fg)", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:700, textDecoration:"none" }}>𝕏 Follow</a>
        </div>
      </div>
    </main>
  );
}
