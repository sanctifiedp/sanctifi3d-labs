"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function PublicProfile() {
  const params = useParams();
  const uid = params.uid as string;
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uid) loadProfile();
  }, [uid]);

  async function loadProfile() {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setProfile(snap.data());
      loadSubmissions();
    }
    setLoading(false);
  }

  async function loadSubmissions() {
    const snap = await getDocs(query(collection(db, "submissions"), where("uid","==",uid), where("status","==","approved")));
    const data = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    data.sort((a:any,b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSubmissions(data);
  }

  if (loading) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <p style={{ color:"var(--sub)" }}>Loading...</p>
    </main>
  );

  if (!profile) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:48, marginBottom:16 }}>👤</p>
        <h1 style={{ color:"var(--fg)", fontWeight:900, fontSize:24, margin:"0 0 8px" }}>User not found</h1>
        <a href="/" style={{ color:"#34d399", textDecoration:"none" }}>← Back to home</a>
      </div>
    </main>
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"100px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>

        {/* Profile header */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, padding:28, marginBottom:24, display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="" style={{ width:80, height:80, borderRadius:"50%", border:"3px solid #34d399", objectFit:"cover", flexShrink:0 }} />
          ) : (
            <div style={{ width:80, height:80, borderRadius:"50%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:900, color:"#000", flexShrink:0 }}>
              {(profile.displayName||"U")[0].toUpperCase()}
            </div>
          )}
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <h1 style={{ fontSize:22, fontWeight:900, color:"var(--fg)", margin:0 }}>{profile.displayName || "Anonymous"}</h1>
              <span style={{ fontSize:11, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.2)", borderRadius:999, padding:"2px 10px", color:"#34d399", fontWeight:700 }}>
                {profile.role || "member"}
              </span>
            </div>
            {profile.bio && <p style={{ color:"var(--fg)", fontSize:14, lineHeight:1.7, margin:"8px 0 0" }}>{profile.bio}</p>}
            <p style={{ color:"var(--sub)", fontSize:11, margin:"8px 0 0" }}>Joined {profile.joinedAt?.slice(0,10)}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Published Posts", value:submissions.length, color:"#34d399" },
            { label:"Member Since", value:profile.joinedAt?.slice(0,7) || "—", color:"#38bdf8" },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16, textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--sub)", fontWeight:700, marginTop:4, textTransform:"uppercase", letterSpacing:".04em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Published posts */}
        <h2 style={{ fontWeight:800, fontSize:18, color:"var(--fg)", margin:"0 0 16px" }}>Published Posts</h2>
        {submissions.length === 0 ? (
          <p style={{ color:"var(--sub)" }}>No published posts yet.</p>
        ) : submissions.map((s:any) => (
          <a key={s.id} href={s.publishedId ? `/post/${s.publishedId}` : "#"} style={{ display:"block", background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", marginBottom:12, textDecoration:"none", color:"inherit" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#34d399", textTransform:"uppercase" }}>{s.category}</span>
              <span style={{ fontSize:11, color:"var(--sub)" }}>· {s.date}</span>
            </div>
            <h3 style={{ fontSize:15, fontWeight:800, color:"var(--fg)", margin:0 }}>{s.title}</h3>
          </a>
        ))}

      </div>
    </main>
  );
}
