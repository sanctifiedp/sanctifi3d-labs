"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { readingTime } from "../lib/readingTime";
import BookmarkButton from "../components/BookmarkButton";

const cc: Record<string,string> = { Web3:"#34d399", Crypto:"#fbbf24", Design:"#f472b6", "AI Tools":"#38bdf8" };

function Skeleton() {
  return (
    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
      <div style={{ width:"100%", height:170, background:"var(--border)", opacity:.5 }} />
      <div style={{ padding:"18px 20px" }}>
        <div style={{ width:60, height:16, borderRadius:999, background:"var(--border)", marginBottom:12 }} />
        <div style={{ width:"90%", height:14, borderRadius:6, background:"var(--border)", marginBottom:8 }} />
        <div style={{ width:"70%", height:14, borderRadius:6, background:"var(--border)", marginBottom:16 }} />
        <div style={{ width:40, height:11, borderRadius:6, background:"var(--border)" }} />
      </div>
    </div>
  );
}

export default function Home() {
  const [cat, setCat] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;
  const [views, setViews] = useState<Record<string,number>>({});

  useEffect(() => {
    getDocs(query(collection(db,"posts"), where("status","==","approved"))).then(snap => {
      const sorted = snap.docs
        .map(d => ({ id:d.id, ...d.data() as any }))
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(sorted);
      setLoading(false);
      // fetch view counts
      const { collection: col2, getDocs: gd2 } = await import('firebase/firestore');
      const vSnap = await gd2(col2(db, 'views'));
      const vMap: Record<string,number> = {};
      vSnap.docs.forEach(d => { vMap[d.id] = (d.data().count || 0); });
      setViews(vMap);
    });
  }, []);

  async function subscribe() {
    if (!email.includes("@")) return;
    setSubscribing(true);
    try {
      await fetch("/api/subscribe", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email }) });
      await addDoc(collection(db,"subscribers"), { email, subscribedAt: new Date().toISOString(), date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) });
      setDone(true);
    } catch(e) { console.error(e); }
    setSubscribing(false);
  }

  const filtered = posts.filter(p =>
    (cat==="All" || p.category===cat) &&
    (!search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", position:"relative", zIndex:1 }}>
      <style>{`
        .card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,.12); }
        .card { transition:transform .2s,box-shadow .2s; }
        a { text-decoration:none; }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .skeleton { animation:pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* HERO */}
      <section style={{ paddingTop:120, paddingBottom:80, textAlign:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.25)", borderRadius:999, padding:"5px 16px", fontSize:12, color:"#34d399", fontWeight:700, marginBottom:20, letterSpacing:".05em" }}>
          ✦ AI-POWERED NEWS & ALPHA
        </div>
        <h1 style={{ fontSize:"clamp(38px,8vw,72px)", fontWeight:900, letterSpacing:"-.04em", margin:"0 0 16px", lineHeight:1.1, color:"var(--fg)" }}>
          Web3. Crypto.<br />
          <span style={{ color:"var(--sub)" }}>Design. AI.</span>
        </h1>
        <p style={{ color:"var(--sub)", fontSize:16, maxWidth:420, margin:"0 auto 32px", lineHeight:1.7 }}>Human insight meets AI-powered aggregation. Stay ahead of the curve.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => document.getElementById("posts")?.scrollIntoView({ behavior:"smooth" })} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:800, cursor:"pointer" }}>Read Latest</button>
          <a href="/alpha" style={{ background:"var(--card)", color:"var(--fg)", border:"1px solid var(--border)", borderRadius:999, padding:"12px 28px", fontSize:14, fontWeight:700 }}>⚡ View Alpha</a>
        </div>
      </section>

      {/* POSTS */}
      <section id="posts" style={{ maxWidth:1100, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search posts..." style={{ flex:1, minWidth:180, borderRadius:999, padding:"9px 18px", fontSize:14, background:"var(--card)", border:"1px solid var(--border)", color:"var(--fg)", fontFamily:"inherit", outline:"none" }} />
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
          {["All","Web3","Crypto","Design","AI Tools"].map(c => (
            <button key={c} onClick={()=>setCat(c)} style={{ borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, border:"1px solid var(--border)", cursor:"pointer", fontFamily:"inherit", background:cat===c?"#34d399":"transparent", color:cat===c?"#000":"var(--sub)", transition:"all .2s" }}>{c}</button>
          ))}
        </div>


        {/* FEATURED + HOT */}
        {!loading && posts.length > 0 && cat === "All" && !search && (
          <>
            {/* FEATURED POST */}
            {(() => {
              const featured = posts[0];
              return (
                <a href={"/post/" + featured.id} style={{ display:"block", background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden", marginBottom:28, textDecoration:"none", color:"inherit", position:"relative" }}
                  onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
                  onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}
                  className="card">
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    {featured.imageUrl && <img src={featured.imageUrl} style={{ width:"100%", height:260, objectFit:"cover" }} />}
                    <div style={{ padding:"24px 28px" }}>
                      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
                        <span style={{ background:"#34d399", color:"#000", fontSize:11, fontWeight:800, borderRadius:999, padding:"3px 12px", letterSpacing:".04em" }}>✦ FEATURED</span>
                        <span style={{ fontSize:11, color:"var(--sub)", fontWeight:600 }}>{featured.category}</span>
                        {featured.type==="ai" && <span style={{ fontSize:10, color:"var(--sub)" }}>✦ AI</span>}
                      </div>
                      <h2 style={{ fontSize:"clamp(18px,3vw,26px)", fontWeight:900, lineHeight:1.3, marginBottom:10, color:"var(--fg)" }}>{featured.title}</h2>
                      <p style={{ fontSize:14, color:"var(--sub)", lineHeight:1.7, marginBottom:12 }} dangerouslySetInnerHTML={{ __html: featured.content?.replace(/<[^>]+>/g,"").slice(0,180)+"..." }} />
                      <span style={{ fontSize:12, color:"var(--sub)" }}>{featured.date}</span>
                    </div>
                  </div>
                </a>
              );
            })()}

            {/* HOT RIGHT NOW */}
            {posts.length > 1 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <span style={{ fontSize:18 }}>🔥</span>
                  <h3 style={{ fontWeight:900, fontSize:16, color:"var(--fg)" }}>Hot Right Now</h3>
                </div>
                <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8 }}>
                  {posts.slice(1, 5).map((p:any) => (
                    <a key={p.id} href={"/post/"+p.id} style={{ minWidth:220, maxWidth:220, background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", textDecoration:"none", color:"inherit", flexShrink:0, display:"block" }}
                      onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
                      onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}
                      className="card">
                      {p.imageUrl && <img src={p.imageUrl} style={{ width:"100%", height:110, objectFit:"cover" }} />}
                      <div style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:10, fontWeight:700, color:"#34d399", letterSpacing:".04em" }}>{p.category}</span>
                        <p style={{ fontSize:13, fontWeight:700, lineHeight:1.4, marginTop:4, color:"var(--fg)" }}>{p.title?.slice(0,60)}{p.title?.length > 60 ? "..." : ""}</p>
                        <p style={{ fontSize:11, color:"var(--sub)", marginTop:6 }}>{p.date}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton"><Skeleton /></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color:"var(--sub)", textAlign:"center" }}>No posts found.</p>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {filtered.slice(0, page * PAGE_SIZE).map((p:any) => (
              <a key={p.id} href={`/post/${p.id}`} className="card" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", display:"block", color:"inherit", backdropFilter:"blur(8px)" }}>
                {p.imageUrl && <img src={p.imageUrl} style={{ width:"100%", height:170, objectFit:"cover" }} />}
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 10px", background:(cc[p.category]||"#fff")+"22", color:cc[p.category]||"var(--fg)", textTransform:"uppercase" }}>{p.category}</span>
                    {p.type==="ai" && <span style={{ fontSize:10, color:"var(--sub)" }}>✦ AI</span>}
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:800, lineHeight:1.4, marginBottom:8, color:"var(--fg)" }}>{p.title}</h3>
                  <p style={{ fontSize:13, color:"var(--sub)", lineHeight:1.7, marginBottom:12 }} dangerouslySetInnerHTML={{ __html: p.content?.replace(/<[^>]+>/g,"").slice(0,120)+"..." }} />
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:8 }}><span style={{ fontSize:12, color:"var(--sub)" }}>{p.date}</span>
                    <span style={{ fontSize:11, color:"var(--sub)" }}>· {readingTime(p.content)}</span>
                    {views[p.id] && <span style={{ fontSize:11, color:"var(--sub)" }}>· {views[p.id]} views</span>}<BookmarkButton post={p} /></div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {filtered.length > page * PAGE_SIZE && (
          <div style={{ textAlign:"center", marginTop:32 }}>
            <button onClick={() => setPage(p => p + 1)} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:999, padding:"12px 36px", fontSize:14, fontWeight:700, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit" }}>
              Load More ↓
            </button>
          </div>
        )}
        {/* NEWSLETTER */}
      <section style={{ borderTop:"1px solid var(--border)", padding:"60px 20px", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, marginBottom:10, color:"var(--fg)" }}>Stay ahead of the curve.</h2>
        <p style={{ color:"var(--sub)", fontSize:15, marginBottom:28 }}>Weekly Web3, Crypto and AI updates — no spam.</p>
        {done ? (
          <div style={{ color:"#34d399", fontWeight:700, fontSize:18 }}>🎉 Welcome to the lab!</div>
        ) : (
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", maxWidth:420, margin:"0 auto" }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" onKeyDown={e=>e.key==="Enter"&&subscribe()}
              style={{ flex:1, minWidth:180, borderRadius:999, padding:"11px 20px", fontSize:14, background:"var(--card)", border:"1px solid var(--border)", color:"var(--fg)", fontFamily:"inherit", outline:"none" }} />
            <button onClick={subscribe} disabled={subscribing} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:999, padding:"11px 24px", fontSize:14, fontWeight:800, cursor:"pointer" }}>
              {subscribing ? "..." : "Subscribe"}
            </button>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"28px 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <span style={{ fontWeight:900, fontSize:15, color:"var(--fg)" }}>Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span></span>
          <div style={{ display:"flex", gap:20, fontSize:13 }}>
            <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ color:"var(--sub)" }}>𝕏 Twitter</a>
            <a href="/alpha" style={{ color:"var(--sub)" }}>⚡ Alpha</a>
            <a href="/about" style={{ color:"var(--sub)" }}>About</a>
            <a href="/legal" style={{ color:"var(--sub)" }}>Legal</a>
            <a href="/admin" style={{ color:"var(--sub)" }}>Admin</a>
            <a href="/widget/embed" style={{ color:"var(--sub)" }}>📡 Widget</a>
          </div>
          <span style={{ fontSize:12, color:"var(--sub)" }}>© 2026 Sanctifi3d Labs</span>
        </div>
      </footer>
    </main>
  );
}
