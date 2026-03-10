"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function About() {
  const [counts, setCounts] = useState({ posts: 0, alphas: 0 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    Promise.all([
      getDocs(query(collection(db,"posts"), where("status","==","approved"))),
      getDocs(query(collection(db,"alpha"), where("status","==","approved")))
    ]).then(([p, a]) => setCounts({ posts: p.size, alphas: a.size }));
  }, []);

  // Animated counter
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 50);
    return () => clearInterval(t);
  }, []);

  const skills = [
    { icon: "🎨", label: "Brand Identity", desc: "Logos, color systems, visual language" },
    { icon: "📱", label: "Twitter / X Design", desc: "Headers, PFPs, thread graphics" },
    { icon: "📄", label: "CV & Portfolio", desc: "Clean, professional document design" },
    { icon: "🌐", label: "Web3 Content", desc: "Ecosystem promotion, ambassador roles" },
    { icon: "⚡", label: "Alpha Curation", desc: "Airdrops, bounties, grants, contests" },
    { icon: "🤖", label: "AI-Powered Tools", desc: "Building autonomous Web3 platforms" },
  ];

  const timeline = [
    { year: "2024", event: "Started freelance graphic design for Web3 clients" },
    { year: "2024", event: "Ambassador at Haayaa Africa, Trenches, Interchained" },
    { year: "2025", event: "Launched Sanctifi3d Studio — first web project" },
    { year: "2025", event: "Deep dive into Web3 content creation & ecosystem promotion" },
    { year: "2026", event: "Built Sanctifi3d Labs — AI-powered news & alpha aggregator" },
  ];

  const stats = [
    { label: "Posts Published", value: counts.posts, color: "#34d399" },
    { label: "Alpha Opportunities", value: counts.alphas, color: "#fbbf24" },
    { label: "Categories Covered", value: 4, color: "#38bdf8" },
    { label: "X Followers Goal", value: "10K", color: "#f472b6" },
  ];

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", position:"relative", zIndex:1 }}>

      {/* HERO */}
      <section style={{ paddingTop:110, paddingBottom:70, textAlign:"center", borderBottom:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(52,211,153,.08), transparent)", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:700, margin:"0 auto", padding:"0 24px" }}>
          <div style={{ width:88, height:88, borderRadius:"50%", background:"linear-gradient(135deg,#34d399,#6366f1)", margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, boxShadow:"0 0 40px rgba(52,211,153,.3)" }}>
            S
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.2)", borderRadius:999, padding:"4px 14px", fontSize:11, color:"#34d399", fontWeight:700, marginBottom:16, letterSpacing:".06em" }}>
            ✦ BASED IN LAGOS, NIGERIA
          </div>
          <h1 style={{ fontSize:"clamp(32px,7vw,58px)", fontWeight:900, letterSpacing:"-.03em", margin:"0 0 16px", lineHeight:1.1, color:"var(--fg)" }}>
            I'm <span style={{ color:"#34d399" }}>Sanctifi3d</span>
          </h1>
          <p style={{ color:"var(--sub)", fontSize:16, lineHeight:1.8, maxWidth:520, margin:"0 auto 28px" }}>
            Graphic designer, Web3 content creator and builder. I bridge visual design with blockchain culture — from brand identity to AI-powered content platforms.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/" style={{ background:"#34d399", color:"#000", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:800, textDecoration:"none" }}>Read the Lab →</a>
            <a href="/alpha" style={{ background:"var(--card)", color:"var(--fg)", border:"1px solid var(--border)", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:700, textDecoration:"none" }}>⚡ Alpha Feed</a>
            <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ background:"var(--card)", color:"var(--fg)", border:"1px solid var(--border)", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:700, textDecoration:"none" }}>𝕏 Follow</a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"48px 20px 0" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"20px 18px", textAlign:"center", backdropFilter:"blur(8px)" }}>
              <p style={{ fontSize:32, fontWeight:900, color:s.color, margin:"0 0 6px" }}>{s.value}</p>
              <p style={{ fontSize:12, color:"var(--sub)", margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT I DO */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"56px 20px 0" }}>
        <h2 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:900, marginBottom:8, color:"var(--fg)" }}>What I Do</h2>
        <p style={{ color:"var(--sub)", fontSize:15, marginBottom:32, maxWidth:480 }}>My work sits at the intersection of design, Web3, and AI-driven content.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
          {skills.map(s => (
            <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"20px", backdropFilter:"blur(8px)", transition:"transform .2s" }}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
              <span style={{ fontSize:28 }}>{s.icon}</span>
              <p style={{ fontWeight:800, fontSize:15, margin:"10px 0 6px", color:"var(--fg)" }}>{s.label}</p>
              <p style={{ fontSize:13, color:"var(--sub)", margin:0, lineHeight:1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT THIS SITE */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"56px 20px 0" }}>
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:"32px", backdropFilter:"blur(8px)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, right:0, width:200, height:200, background:"radial-gradient(circle, rgba(52,211,153,.06), transparent)", borderRadius:"50%", transform:"translate(50%,-50%)" }} />
          <h2 style={{ fontSize:"clamp(20px,4vw,30px)", fontWeight:900, marginBottom:16, color:"var(--fg)" }}>About This Platform</h2>
          <p style={{ color:"var(--sub)", fontSize:15, lineHeight:1.9, marginBottom:16 }}>
            Sanctifi3d Labs is an AI-powered intelligence platform for the Web3 and crypto space. Every hour, our AI engine scans top crypto news sources and generates detailed summaries. Our Alpha Hunter automatically scouts airdrops, bounties, grants, hackathons, and gigs — so you never miss an opportunity.
          </p>
          <p style={{ color:"var(--sub)", fontSize:15, lineHeight:1.9, margin:0 }}>
            All AI-generated content is labeled <strong style={{ color:"var(--fg)" }}>✦ AI</strong> and reviewed before publishing. Human-written posts are crafted with firsthand Web3 knowledge and experience from active participation in the ecosystem.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"56px 20px 0" }}>
        <h2 style={{ fontSize:"clamp(20px,4vw,30px)", fontWeight:900, marginBottom:32, color:"var(--fg)" }}>Journey</h2>
        <div style={{ position:"relative", paddingLeft:28 }}>
          <div style={{ position:"absolute", left:8, top:0, bottom:0, width:2, background:"linear-gradient(to bottom, #34d399, transparent)" }} />
          {timeline.map((t, i) => (
            <div key={i} style={{ position:"relative", marginBottom:28 }}>
              <div style={{ position:"absolute", left:-24, top:4, width:12, height:12, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 10px rgba(52,211,153,.5)" }} />
              <span style={{ fontSize:11, fontWeight:800, color:"#34d399", letterSpacing:".06em" }}>{t.year}</span>
              <p style={{ color:"var(--fg)", fontSize:14, fontWeight:600, margin:"4px 0 0", lineHeight:1.6 }}>{t.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"56px 20px 80px", textAlign:"center" }}>
        <div style={{ background:"linear-gradient(135deg, rgba(52,211,153,.08), rgba(99,102,241,.08))", border:"1px solid var(--border)", borderRadius:20, padding:"48px 24px" }}>
          <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, margin:"0 0 12px", color:"var(--fg)" }}>Let's Work Together</h2>
          <p style={{ color:"var(--sub)", fontSize:15, marginBottom:28, maxWidth:400, margin:"0 auto 28px" }}>Need branding, Web3 design, CV, or content strategy? I'm available for freelance work.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ background:"#34d399", color:"#000", borderRadius:999, padding:"13px 30px", fontSize:14, fontWeight:800, textDecoration:"none" }}>DM on 𝕏 →</a>
            <a href="https://bit.ly/AdeyiGbeminiyi" target="_blank" style={{ background:"var(--card)", color:"var(--fg)", border:"1px solid var(--border)", borderRadius:999, padding:"13px 30px", fontSize:14, fontWeight:700, textDecoration:"none" }}>View Portfolio</a>
          </div>
        </div>
      </section>

    </main>
  );
}
