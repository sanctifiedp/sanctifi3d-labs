"use client";
import { useState, useEffect } from "react";
import BookmarkButton from "../../components/BookmarkButton";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
      setBookmarks(saved);
    } catch { setBookmarks([]); }
  }, []);

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"90px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"var(--fg)", marginBottom:8 }}>🔖 Bookmarks</h1>
        <p style={{ color:"var(--sub)", fontSize:15, marginBottom:32 }}>Posts you've saved for later.</p>

        {bookmarks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <p style={{ fontSize:48, marginBottom:16 }}>📭</p>
            <p style={{ color:"var(--sub)", fontSize:16 }}>No bookmarks yet.</p>
            <a href="/" style={{ display:"inline-block", marginTop:16, background:"#34d399", color:"#000", borderRadius:999, padding:"10px 24px", fontWeight:800, fontSize:14, textDecoration:"none" }}>Browse Posts</a>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {bookmarks.map((p:any) => (
              <div key={p.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                <a href={"/post/" + p.id} style={{ color:"inherit", flex:1, display:"block", textDecoration:"none" }}>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{ width:"100%", height:170, objectFit:"cover" }} />}
                  <div style={{ padding:"18px 20px 12px" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#34d399" }}>{p.category}</span>
                    <h3 style={{ fontSize:15, fontWeight:800, lineHeight:1.4, margin:"8px 0", color:"var(--fg)" }}>{p.title}</h3>
                    <p style={{ fontSize:13, color:"var(--sub)", lineHeight:1.7 }}>{p.content?.replace(/<[^>]+>/g,"").slice(0,100)}...</p>
                  </div>
                </a>
                <div style={{ padding:"0 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"var(--sub)" }}>{p.date}</span>
                  <BookmarkButton post={p} onRemove={() => setBookmarks(b => b.filter((x:any) => x.id !== p.id))} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
