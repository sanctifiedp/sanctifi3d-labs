"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { db } from "../../lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function Profile() {
  const { user, loading, signIn, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"submissions"|"bookmarks"|"topics">("submissions");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [followedTopics, setFollowedTopics] = useState<string[]>([]);
  const TOPICS = ["Web3","Crypto","DeFi","NFT","Design","AI Tools","Airdrop","Bounty","Grant"];

  useEffect(() => {
    if (!loading && user) {
      loadProfile();
      loadSubmissions();
      loadBookmarks();
      loadTopics();
    }
  }, [user, loading]);

  async function loadProfile() {
    const snap = await getDoc(doc(db, "users", user!.uid));
    if (snap.exists()) {
      const d = snap.data();
      setProfile(d);
      setDisplayName(d.displayName || user!.displayName || "");
      setBio(d.bio || "");
    } else {
      // Create profile
      const newProfile = {
        uid: user!.uid,
        displayName: user!.displayName || "",
        email: user!.email || "",
        photoURL: user!.photoURL || "",
        bio: "",
        role: "user",
        joinedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", user!.uid), newProfile);
      setProfile(newProfile);
      setDisplayName(newProfile.displayName);
    }
  }

  async function loadSubmissions() {
    const snap = await getDocs(query(
      collection(db, "submissions"),
      where("uid", "==", user!.uid),
    ));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a:any,b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSubmissions(data);
  }

  async function loadTopics() {
    const snap = await getDoc(doc(db, "users", user!.uid));
    if (snap.exists()) setFollowedTopics(snap.data().followedTopics || []);
  }

  async function toggleTopic(topic: string) {
    const updated = followedTopics.includes(topic)
      ? followedTopics.filter(t => t !== topic)
      : [...followedTopics, topic];
    setFollowedTopics(updated);
    await setDoc(doc(db, "users", user!.uid), { followedTopics: updated }, { merge: true });
  }

  async function loadBookmarks() {
    const snap = await getDoc(doc(db, "user_bookmarks", user!.uid));
    if (snap.exists()) setBookmarks(snap.data().posts || []);
  }

  async function saveProfile() {
    setSaving(true);
    await setDoc(doc(db, "users", user!.uid), { displayName, bio }, { merge: true });
    setProfile((p:any) => ({ ...p, displayName, bio }));
    setEditing(false);
    setSaving(false);
    setMsg("Profile updated!");
    setTimeout(() => setMsg(""), 3000);
  }

  const statusColor = (s: string) => s === "approved" ? "#34d399" : s === "rejected" ? "#f87171" : "#fbbf24";

  if (loading) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <p style={{ color:"var(--sub)" }}>Loading...</p>
    </main>
  );

  if (!user) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>👤</div>
        <h1 style={{ fontSize:28, fontWeight:900, color:"var(--fg)", margin:"0 0 8px" }}>Your Profile</h1>
        <p style={{ color:"var(--sub)", fontSize:15, margin:"0 0 24px", lineHeight:1.7 }}>Sign in with Google to access your profile, submit posts, and join the community.</p>
        <button onClick={signIn} style={{ display:"inline-flex", alignItems:"center", gap:10, background:"#fff", color:"#000", border:"none", borderRadius:12, padding:"12px 24px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
      </div>
    </main>
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"100px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        {msg && <div style={{ background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.3)", borderRadius:10, padding:"12px 16px", marginBottom:20, color:"#34d399", fontSize:14, fontWeight:600 }}>{msg}</div>}

        {/* Profile Card */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, padding:"28px", marginBottom:24, display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width:80, height:80, borderRadius:"50%", border:"3px solid #34d399", objectFit:"cover" }} />
            ) : (
              <div style={{ width:80, height:80, borderRadius:"50%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:900, color:"#000" }}>
                {(profile?.displayName||user.email||"U")[0].toUpperCase()}
              </div>
            )}
            <div style={{ position:"absolute", bottom:0, right:0, width:20, height:20, background:"#34d399", borderRadius:"50%", border:"2px solid var(--card)" }} />
          </div>

          <div style={{ flex:1, minWidth:200 }}>
            {editing ? (
              <div>
                <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Display name"
                  style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:15, color:"var(--fg)", fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" as any }} />
                <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Short bio..." rows={3}
                  style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:13, color:"var(--fg)", fontFamily:"inherit", outline:"none", resize:"vertical" as any, marginBottom:12, boxSizing:"border-box" as any }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={saveProfile} disabled={saving} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"8px 20px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={()=>setEditing(false)} style={{ background:"transparent", color:"var(--sub)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <h1 style={{ fontSize:22, fontWeight:900, color:"var(--fg)", margin:0 }}>{profile?.displayName || user.displayName || "Anonymous"}</h1>
                  <span style={{ fontSize:11, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.2)", borderRadius:999, padding:"2px 10px", color:"#34d399", fontWeight:700 }}>
                    {profile?.role || "user"}
                  </span>
                </div>
                <p style={{ color:"var(--sub)", fontSize:13, margin:"0 0 4px" }}>{user.email}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                  <span style={{ fontSize:11, color:"var(--sub)" }}>🔗</span>
                  <a href={`/profile/${user.uid}`} target="_blank" style={{ fontSize:11, color:"#34d399", textDecoration:"none", fontWeight:600 }}>
                    sanctifi3d-labs.vercel.app/profile/{user.uid.slice(0,8)}...
                  </a>
                  <button onClick={()=>{ navigator.clipboard.writeText(`https://sanctifi3d-labs.vercel.app/profile/${user.uid}`); }} style={{ background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.2)", borderRadius:6, padding:"3px 8px", fontSize:10, color:"#34d399", cursor:"pointer", fontFamily:"inherit" }}>Copy</button>
                </div>
                {profile?.bio && <p style={{ color:"var(--fg)", fontSize:14, margin:"8px 0 0", lineHeight:1.7 }}>{profile.bio}</p>}
                <p style={{ color:"var(--sub)", fontSize:11, margin:"8px 0 0" }}>Joined {profile?.joinedAt?.slice(0,10)}</p>
              </div>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
            {!editing && (
              <button onClick={()=>setEditing(true)} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"7px 16px", fontSize:12, fontWeight:700, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit" }}>
                ✏️ Edit Profile
              </button>
            )}
            <a href="/submit" style={{ background:"#34d399", color:"#000", borderRadius:8, padding:"7px 16px", fontSize:12, fontWeight:800, textDecoration:"none", textAlign:"center" as any }}>
              + Submit Content
            </a>
            <button onClick={signOut} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"7px 16px", fontSize:12, color:"var(--sub)", cursor:"pointer", fontFamily:"inherit" }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Submissions", value:submissions.length, color:"#34d399" },
            { label:"Approved", value:submissions.filter((s:any)=>s.status==="approved").length, color:"#38bdf8" },
            { label:"Bookmarks", value:bookmarks.length, color:"#a78bfa" },
          ].map(s => (
            <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:24, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--sub)", fontWeight:700, marginTop:4, textTransform:"uppercase", letterSpacing:".04em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {(["submissions","bookmarks","topics"] as const).map(t => (
            <button key={t} onClick={()=>setActiveTab(t)} style={{ background:activeTab===t?"#34d399":"transparent", color:activeTab===t?"#000":"var(--sub)", border:"1px solid var(--border)", borderRadius:999, padding:"7px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Submissions */}
        {activeTab === "submissions" && (
          <div>
            {submissions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <p style={{ color:"var(--sub)", marginBottom:16 }}>No submissions yet.</p>
                <a href="/submit" style={{ background:"#34d399", color:"#000", borderRadius:8, padding:"10px 24px", fontWeight:800, fontSize:14, textDecoration:"none" }}>Submit Your First Post →</a>
              </div>
            ) : submissions.map((s:any) => (
              <div key={s.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 20px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#34d399", textTransform:"uppercase" }}>{s.type}</span>
                    <span style={{ fontSize:11, background:`${statusColor(s.status)}18`, color:statusColor(s.status), borderRadius:999, padding:"2px 10px", fontWeight:700 }}>{s.status}</span>
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:800, color:"var(--fg)", margin:"0 0 4px" }}>{s.title}</h3>
                  <p style={{ fontSize:12, color:"var(--sub)", margin:0 }}>{s.createdAt?.slice(0,10)}</p>
                  {s.adminNote && <p style={{ fontSize:12, color:"#fbbf24", margin:"6px 0 0", padding:"6px 10px", background:"rgba(251,191,36,.08)", borderRadius:6 }}>Admin note: {s.adminNote}</p>}
                </div>
                {s.status === "approved" && s.publishedId && (
                  <a href={`/post/${s.publishedId}`} style={{ fontSize:12, color:"#34d399", fontWeight:700, textDecoration:"none", whiteSpace:"nowrap" }}>View Post →</a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Topics */}
        {activeTab === "topics" && (
          <div>
            <p style={{ color:"var(--sub)", fontSize:14, marginBottom:20, lineHeight:1.7 }}>Follow topics to get personalized content recommendations. Your followed topics will influence what shows up first for you.</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
              {TOPICS.map(t => (
                <button key={t} onClick={()=>toggleTopic(t)} style={{ background:followedTopics.includes(t)?"#34d399":"var(--card)", color:followedTopics.includes(t)?"#000":"var(--sub)", border:`1px solid ${followedTopics.includes(t)?"#34d399":"var(--border)"}`, borderRadius:999, padding:"8px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", display:"flex", alignItems:"center", gap:6 }}>
                  {followedTopics.includes(t) ? "✓ " : "+ "}{t}
                </button>
              ))}
            </div>
            {followedTopics.length > 0 && (
              <p style={{ color:"#34d399", fontSize:13, marginTop:16, fontWeight:600 }}>✦ Following {followedTopics.length} topic{followedTopics.length>1?"s":""}: {followedTopics.join(", ")}</p>
            )}
          </div>
        )}

        {/* Bookmarks */}
        {activeTab === "bookmarks" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {bookmarks.length === 0 ? (
              <p style={{ color:"var(--sub)" }}>No bookmarks yet.</p>
            ) : bookmarks.map((p:any) => (
              <a key={p.id} href={`/post/${p.id}`} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", textDecoration:"none", color:"inherit", display:"block" }}>
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{ width:"100%", height:140, objectFit:"cover" }} />}
                <div style={{ padding:"14px 16px" }}>
                  <span style={{ fontSize:10, fontWeight:700, color:"#34d399" }}>{p.category}</span>
                  <h3 style={{ fontSize:14, fontWeight:800, color:"var(--fg)", margin:"6px 0 0", lineHeight:1.4 }}>{p.title}</h3>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
