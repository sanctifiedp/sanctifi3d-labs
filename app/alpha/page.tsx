"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const ac: Record<string,string> = { Crypto:"#fbbf24", Web3:"#34d399", "Graphic Design":"#f472b6", "AI Tools":"#38bdf8" };
const tc: Record<string,string> = { Airdrop:"#34d399", Bounty:"#60a5fa", Contest:"#f472b6", Presale:"#fbbf24", Grant:"#a78bfa", Hackathon:"#fb923c", Gig:"#38bdf8" };

export default function Alpha() {
  const [alphas, setAlphas] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    getDocs(query(collection(db,"alpha"),where("status","==","approved"))).then(snap=>{
      setAlphas(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    });
  }, []);

  const filters = ["All","Airdrop","Bounty","Contest","Presale","Grant","Hackathon","Gig"];
  const filtered = filter==="All" ? alphas : alphas.filter(a=>a.type===filter);

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", position:"relative", zIndex:1 }}>
      <section style={{ paddingTop:100, paddingBottom:48, textAlign:"center", borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.2)", borderRadius:999, padding:"4px 14px", fontSize:12, color:"#34d399", fontWeight:700, marginBottom:16 }}>
          ✦ AI-Curated Opportunities
        </div>
        <h1 style={{ fontSize:"clamp(28px,6vw,52px)", fontWeight:900, letterSpacing:"-.03em", margin:"0 0 12px", color:"var(--fg)" }}>Alpha Hunter</h1>
        <p style={{ color:"var(--sub)", fontSize:15, maxWidth:480, margin:"0 auto" }}>Verified earning opportunities for Web3, Crypto, Design & AI. Always DYOR.</p>
      </section>

      <section style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:32 }}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, border:"1px solid var(--border)", cursor:"pointer", fontFamily:"inherit", background:filter===f?"#34d399":"transparent", color:filter===f?"#000":"var(--sub)", transition:"all .2s" }}>{f}</button>
          ))}
        </div>

        {loading ? <p style={{ color:"var(--sub)", textAlign:"center" }}>Loading alphas...</p> :
        filtered.length===0 ? <p style={{ color:"var(--sub)", textAlign:"center" }}>No opportunities found.</p> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
            {filtered.map(a=>(
              <div key={a.id} onClick={()=>setSelected(a)} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"transform .2s", backdropFilter:"blur(8px)" }}
                onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
                onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
                {a.imageUrl && <img src={a.imageUrl} style={{ width:"100%", height:140, objectFit:"cover" }} />}
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(tc[a.type]||"#fff")+"22", color:tc[a.type]||"var(--fg)", textTransform:"uppercase" }}>{a.type}</span>
                    <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(ac[a.audience]||"#fff")+"22", color:ac[a.audience]||"var(--fg)" }}>{a.audience}</span>
                  </div>
                  <h3 style={{ fontSize:14, fontWeight:700, lineHeight:1.4, marginBottom:8, color:"var(--fg)" }}>{a.title}</h3>
                  <p style={{ fontSize:13, color:"var(--sub)", lineHeight:1.6, marginBottom:10 }}>{a.content?.replace(/<[^>]+>/g,"").slice(0,100)}...</p>
                  <span style={{ fontSize:12, color:"var(--sub)" }}>{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL */}
      {selected && (
        <div onClick={()=>setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:200, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"20px", overflowY:"auto", backdropFilter:"blur(6px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"var(--nav)", border:"1px solid var(--border)", borderRadius:16, maxWidth:680, width:"100%", marginTop:40 }}>
            {selected.imageUrl && <img src={selected.imageUrl} style={{ width:"100%", height:220, objectFit:"cover", borderRadius:"16px 16px 0 0" }} />}
            <div style={{ padding:"28px 28px 32px" }}>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(tc[selected.type]||"#fff")+"22", color:tc[selected.type]||"var(--fg)", textTransform:"uppercase" }}>{selected.type}</span>
                <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(ac[selected.audience]||"#fff")+"22", color:ac[selected.audience]||"var(--fg)" }}>{selected.audience}</span>
              </div>
              <h2 style={{ fontSize:22, fontWeight:900, lineHeight:1.3, marginBottom:20, color:"var(--fg)" }}>{selected.title}</h2>
              <div style={{ fontSize:15, color:"var(--fg)", lineHeight:1.9, marginBottom:24 }} dangerouslySetInnerHTML={{ __html: selected.content }} />
              {selected.sourceUrl && (
                <div style={{ marginBottom:20 }}>
                  <a href={selected.sourceUrl} target="_blank" style={{ display:"inline-block", background:"#34d399", color:"#000", borderRadius:8, padding:"10px 20px", fontSize:14, fontWeight:800, textDecoration:"none" }}>
                    👉 Participate Here
                  </a>
                </div>
              )}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(selected.title+" via @Sanctifi3d_1")}`} target="_blank" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 16px", fontSize:13, color:"var(--fg)", textDecoration:"none" }}>Share on 𝕏</a>
                <button onClick={()=>setSelected(null)} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"8px 16px", fontSize:13, color:"var(--sub)", cursor:"pointer" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
