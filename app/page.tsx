"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useTheme } from "../lib/ThemeContext";
import BlobBackground from "../components/BlobBackground";

const cc: Record<string,string> = { Web3:"#34d399", Crypto:"#fbbf24", Design:"#f472b6", "AI Tools":"#38bdf8" };

export default function Home() {
  const { dark, toggle } = useTheme();
  const [cat, setCat] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const fg = dark ? "#fff" : "#111";
  const sub = dark ? "rgba(255,255,255,.45)" : "#555";
  const cardBg = dark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.85)";
  const cardBorder = dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)";
  const navBg = dark ? "rgba(8,8,8,.85)" : "rgba(240,240,240,.85)";

  useEffect(() => {
    async function fetchPosts() {
      const q = query(collection(db,"posts"), where("status","==","approved"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const filtered = posts.filter(p =>
    (cat === "All" || p.category === cat) &&
    (!search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", color:fg, minHeight:"100vh", position:"relative" }}>
      <BlobBackground />
      <style>{`
        .card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.15)}
        .card{transition:transform .2s,box-shadow .2s}
        a{text-decoration:none}
        input::placeholder{color:${sub}}
      `}</style>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:navBg, backdropFilter:"blur(16px)", borderBottom:`1px solid ${cardBorder}`, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px" }}>
        <span style={{ fontWeight:900, fontSize:17, color:fg }}>Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span></span>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <a href="/alpha" style={{ fontSize:13, fontWeight:700, color:"#fbbf24", textDecoration:"none" }}>⚡ Alpha</a>
          <span style={{ fontSize:12, color:"#34d399", fontWeight:600 }}>● Live</span>
          <button onClick={toggle} style={{ background:"transparent", border:`1px solid ${cardBorder}`, borderRadius:999, padding:"4px 12px", fontSize:13, color:fg, cursor:"pointer", fontFamily:"inherit" }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop:130, paddingBottom:80, textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.25)", borderRadius:999, padding:"5px 16px", fontSize:12, color:"#34d399", fontWeight:700, marginBottom:20, letterSpacing:".05em" }}>
          ✦ AI-POWERED NEWS & ALPHA
        </div>
        <h1 style={{ fontSize:"clamp(38px,8vw,72px)", fontWeight:900, letterSpacing:"-.04em", margin:"0 0 16px", lineHeight:1.1, color:fg }}>
          Web3. Crypto.<br />
          <span style={{ color: dark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)" }}>Design. AI.</span>
        </h1>
        <p style={{ color:sub, fontSize:16, maxWidth:420, margin:"0 auto 32px", lineHeight:1.7 }}>Human insight meets AI-powered aggregation. Stay ahead of the curve.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => document.getElementById("posts")?.scrollIntoView({ behavior:"smooth" })} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:800, cursor:"pointer" }}>Read Latest</button>
          <a href="/alpha" style={{ background:dark?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)", color:fg, border:`1px solid ${cardBorder}`, borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:700, textDecoration:"none" }}>⚡ View Alpha</a>
        </div>
      </section>

      {/* POSTS */}
      <section id="posts" style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px", position:"relative", zIndex:1 }}>
        {/* SEARCH + FILTERS */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:24, alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search posts..." style={{ flex:1, minWidth:180, borderRadius:999, padding:"8px 18px", fontSize:14, background:cardBg, border:`1px solid ${cardBorder}`, color:fg, fontFamily:"inherit", outline:"none" }} />
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
          {["All","Web3","Crypto","Design","AI Tools"].map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{ borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, border:`1px solid ${cardBorder}`, cursor:"pointer", fontFamily:"inherit", background:cat===c?"#34d399":"transparent", color:cat===c?"#000":sub, transition:"all .2s" }}>{c}</button>
          ))}
        </div>

        {loading ? <p style={{ color:sub, textAlign:"center" }}>Loading posts...</p> :
        filtered.length === 0 ? <p style={{ color:sub, textAlign:"center" }}>No posts found.</p> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {filtered.map((p:any) => (
              <a key={p.id} href={`/post/${p.id}`} className="card" style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:16, overflow:"hidden", display:"block", color:"inherit", backdropFilter:"blur(8px)" }}>
                {p.imageUrl && <img src={p.imageUrl} style={{ width:"100%", height:170, objectFit:"cover" }} />}
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(cc[p.category]||"#fff")+"20", color:cc[p.category]||fg, textTransform:"uppercase" }}>{p.category}</span>
                    {p.type==="ai"&&<span style={{ fontSize:10, color:sub }}>✦ AI</span>}
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:800, lineHeight:1.4, marginBottom:8, color:fg }}>{p.title}</h3>
                  <p style={{ fontSize:13, color:sub, lineHeight:1.7, marginBottom:12 }} dangerouslySetInnerHTML={{ __html: p.content?.replace(/<[^>]+>/g,"").slice(0,120)+"..." }} />
                  <span style={{ fontSize:12, color:dark?"rgba(255,255,255,.2)":"rgba(0,0,0,.25)" }}>{p.date}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* NEWSLETTER */}
      <section style={{ borderTop:`1px solid ${cardBorder}`, padding:"60px 20px", textAlign:"center", position:"relative", zIndex:1 }}>
        <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, marginBottom:10, color:fg }}>Stay ahead of the curve.</h2>
        <p style={{ color:sub, fontSize:15, marginBottom:28 }}>Weekly Web3, Crypto and AI updates.</p>
        {done ? <span style={{ color:"#34d399", fontWeight:700 }}>Welcome to the lab! 🎉</span> : (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", maxWidth:420, margin:"0 auto" }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{ flex:1, minWidth:180, borderRadius:999, padding:"11px 20px", fontSize:14, background:cardBg, border:`1px solid ${cardBorder}`, color:fg, fontFamily:"inherit", outline:"none" }} />
            <button onClick={()=>email.includes("@")&&setDone(true)} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:999, padding:"11px 24px", fontSize:14, fontWeight:800, cursor:"pointer" }}>Subscribe</button>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${cardBorder}`, padding:"28px 24px", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <span style={{ fontWeight:900, fontSize:15, color:fg }}>Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span></span>
          <div style={{ display:"flex", gap:20, fontSize:13 }}>
            <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ color:sub }}>𝕏 Twitter</a>
            <a href="/alpha" style={{ color:sub }}>⚡ Alpha</a>
            <a href="/legal" style={{ color:sub }}>Legal</a>
            <a href="/admin" style={{ color:sub }}>Admin</a>
          </div>
          <span style={{ fontSize:12, color:dark?"rgba(255,255,255,.2)":"rgba(0,0,0,.2)" }}>© 2026 Sanctifi3d Labs</span>
        </div>
      </footer>
    </main>
  );
}
