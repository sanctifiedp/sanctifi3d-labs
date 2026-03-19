"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import BookmarkButton from "../../components/BookmarkButton";

export default function Bookmarks() {
  const { user, loading, signIn, signOut } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      loadCloudBookmarks();
    } else {
      loadLocalBookmarks();
    }
  }, [user, loading]);

  function loadLocalBookmarks() {
    try {
      const saved = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
      setBookmarks(saved);
    } catch { setBookmarks([]); }
  }

  async function loadCloudBookmarks() {
    setSyncing(true);
    try {
      const snap = await getDoc(doc(db, "user_bookmarks", user!.uid));
      if (snap.exists()) {
        setBookmarks(snap.data().posts || []);
      } else {
        // Migrate local bookmarks to cloud
        const local = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
        if (local.length > 0) {
          await setDoc(doc(db, "user_bookmarks", user!.uid), { posts: local });
          setBookmarks(local);
        }
      }
    } catch(e) { loadLocalBookmarks(); }
    setSyncing(false);
  }

  async function removeBookmark(id: string) {
    const updated = bookmarks.filter((b:any) => b.id !== id);
    setBookmarks(updated);
    if (user) {
      await setDoc(doc(db, "user_bookmarks", user.uid), { posts: updated });
    } else {
      localStorage.setItem("s3d_bookmarks", JSON.stringify(updated));
    }
  }

  if (loading) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <p style={{ color:"var(--sub)" }}>Loading...</p>
    </main>
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"100px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, color:"var(--fg)", margin:"0 0 6px" }}>🔖 Bookmarks</h1>
            <p style={{ color:"var(--sub)", fontSize:14, margin:0 }}>
              {user ? `Saved to your account · ${bookmarks.length} posts` : `Saved locally · ${bookmarks.length} posts`}
            </p>
          </div>

          {/* Auth */}
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {user.photoURL && <img src={user.photoURL} alt="" style={{ width:32, height:32, borderRadius:"50%", border:"2px solid #34d399" }} />}
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"var(--fg)", margin:0 }}>{user.displayName}</p>
                  <p style={{ fontSize:11, color:"var(--sub)", margin:0 }}>Bookmarks sync across devices</p>
                </div>
              </div>
              <button onClick={signOut} style={{ background:"rgba(255,255,255,.06)", border:"1px solid var(--border)", borderRadius:8, padding:"7px 14px", fontSize:12, color:"var(--sub)", cursor:"pointer", fontFamily:"inherit" }}>
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", maxWidth:280 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--fg)", margin:"0 0 4px" }}>☁️ Sync across devices</p>
              <p style={{ fontSize:12, color:"var(--sub)", margin:"0 0 12px", lineHeight:1.6 }}>Sign in with Google to access your bookmarks on any device.</p>
              <button onClick={signIn} style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", color:"#000", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", width:"100%" }}>
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>

        {syncing && <p style={{ color:"var(--sub)", fontSize:13, marginBottom:16 }}>Syncing bookmarks...</p>}

        {/* Bookmarks grid */}
        {bookmarks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <p style={{ fontSize:48, marginBottom:16 }}>📭</p>
            <p style={{ color:"var(--sub)", fontSize:16, marginBottom:20 }}>No bookmarks yet.</p>
            <a href="/" style={{ display:"inline-block", background:"#34d399", color:"#000", borderRadius:999, padding:"10px 24px", fontWeight:800, fontSize:14, textDecoration:"none" }}>Browse Posts</a>
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
                  </div>
                </a>
                <div style={{ padding:"0 20px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"var(--sub)" }}>{p.date}</span>
                  <button onClick={() => removeBookmark(p.id)} style={{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.2)", borderRadius:8, padding:"5px 10px", fontSize:11, color:"#f87171", cursor:"pointer", fontFamily:"inherit" }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
