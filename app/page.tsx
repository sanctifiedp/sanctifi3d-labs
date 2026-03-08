"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const cc: Record<string,string> = { Web3:"#34d399", Crypto:"#fbbf24", Design:"#f472b6", "AI Tools":"#38bdf8" };

export default function Home() {
  const [cat, setCat] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const q = query(collection(db, "posts"), where("status","==","approved"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchPosts();
  }, []);

  const filtered = cat === "All" ? posts : posts.filter((p:any) => p.category === cat);

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", background:"#080808", color:"#fff", minHeight:"100vh" }}>
      <style>{`.card:hover{transform:translateY(-4px)} .card{transition:transform .2s} a{text-decoration:none}`}</style>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, background:"rgba(8,8,8,.9)", borderBottom:"1px solid rgba(255,255,255,.07)", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px" }}>
        <span style={{ fontWeight:800, fontSize:16 }}>Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span></span>
        <span style={{ fontSize:12, color:"#34d399" }}>● AI Live</span>
      </nav>
      <section style={{ paddingTop:100, paddingBottom:80, textAlign:"center", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <h1 style={{ fontSize:"clamp(36px,8vw,64px)", fontWeight:800, letterSpacing:"-.03em", margin:"0 0 16px" }}>Web3. Crypto.<br /><span style={{ color:"rgba(255,255,255,.25)" }}>Design. AI.</span></h1>
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:16, maxWidth:400, margin:"0 auto 28px" }}>Human insight meets AI-powered news aggregation.</p>
        <button onClick={() => document.getElementById("posts")?.scrollIntoView({ behavior:"smooth" })} style={{ background:"#fff", color:"#000", border:"none", borderRadius:999, padding:"10px 24px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Read Latest</button>
      </section>
      <section id="posts" style={{ maxWidth:1100, margin:"0 auto", padding:"48px 20px" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:32 }}>
          {["All","Web3","Crypto","Design","AI Tools"].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, border:"1px solid rgba(255,255,255,.12)", cursor:"pointer", fontFamily:"inherit", background:cat===c?"#fff":"transparent", color:cat===c?"#000":"rgba(255,255,255,.55)" }}>{c}</button>
          ))}
        </div>
        {loading ? (
          <p style={{ color:"rgba(255,255,255,.3)", textAlign:"center" }}>Loading posts...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color:"rgba(255,255,255,.3)", textAlign:"center" }}>No posts yet.</p>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:14 }}>
            {filtered.map((p:any) => (
              <article key={p.id} className="card" style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, overflow:"hidden", cursor:"pointer" }}>
                {p.imageUrl && <img src={p.imageUrl} style={{ width:"100%", height:160, objectFit:"cover" }} />}
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(cc[p.category]||"#fff")+"18", color:cc[p.category]||"#fff", textTransform:"uppercase" }}>{p.category}</span>
                    {p.type==="ai" && <span style={{ fontSize:10, color:"rgba(255,255,255,.3)" }}>AI</span>}
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:700, lineHeight:1.4, marginBottom:8 }}>{p.title}</h3>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", lineHeight:1.65, marginBottom:12 }}>{p.content?.slice(0,120)}...</p>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>{p.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"60px 20px", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:800, marginBottom:10 }}>Stay ahead of the curve.</h2>
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:15, marginBottom:28 }}>Weekly Web3, Crypto and AI updates.</p>
        {done ? <span style={{ color:"#34d399", fontWeight:700 }}>Welcome to the lab!</span> : (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", maxWidth:420, margin:"0 auto" }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex:1, minWidth:180, borderRadius:999, padding:"10px 20px", fontSize:14, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", fontFamily:"inherit", outline:"none" }} />
            <button onClick={() => email.includes("@") && setDone(true)} style={{ background:"#fff", color:"#000", border:"none", borderRadius:999, padding:"10px 22px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Subscribe</button>
          </div>
        )}
      </section>
      <footer style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"32px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <span style={{ fontWeight:800, fontSize:15, color:"#fff" }}>Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span></span>
          <div style={{ display:"flex", gap:20, fontSize:13, color:"rgba(255,255,255,.4)" }}>
            <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ color:"rgba(255,255,255,.4)" }}>𝕏 Twitter</a>
            <a href="/legal" style={{ color:"rgba(255,255,255,.4)" }}>Legal</a>
            <a href="/admin" style={{ color:"rgba(255,255,255,.4)" }}>Admin</a>
          </div>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.25)" }}>© 2026 Sanctifi3d · AI content is labeled and reviewed</span>
        </div>
      </footer>
    </main>
  );
}
