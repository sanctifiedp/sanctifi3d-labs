"use client";
import { useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import RichPostEditor from "../../components/RichPostEditor";

export default function Submit() {
  const { user, loading, signIn } = useAuth();
  const [type, setType] = useState<"post"|"alpha">("post");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Web3");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "submissions"), {
        uid: user!.uid,
        authorName: user!.displayName || user!.email,
        authorEmail: user!.email,
        authorPhoto: user!.photoURL || "",
        type,
        title: title.trim(),
        content: content.trim(),
        category,
        sourceUrl: sourceUrl.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      });
      setSubmitted(true);
    } catch(e) { console.error(e); }
    setSubmitting(false);
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"var(--card)", border:"1px solid var(--border)",
    borderRadius:10, padding:"10px 14px", fontSize:14, color:"var(--fg)",
    fontFamily:"inherit", outline:"none", boxSizing:"border-box"
  };

  if (loading) return null;

  if (!user) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✍️</div>
        <h1 style={{ fontSize:24, fontWeight:900, color:"var(--fg)", margin:"0 0 8px" }}>Submit Content</h1>
        <p style={{ color:"var(--sub)", fontSize:14, margin:"0 0 24px", lineHeight:1.7 }}>Sign in to submit posts and alpha opportunities.</p>
        <button onClick={signIn} style={{ display:"inline-flex", alignItems:"center", gap:10, background:"#fff", color:"#000", border:"none", borderRadius:12, padding:"12px 24px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>
      </div>
    </main>
  );

  if (submitted) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:420 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontSize:24, fontWeight:900, color:"var(--fg)", margin:"0 0 8px" }}>Submitted!</h1>
        <p style={{ color:"var(--sub)", fontSize:15, margin:"0 0 28px", lineHeight:1.7 }}>Your {type} has been submitted for review. Track its status on your profile.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <a href="/profile" style={{ background:"#34d399", color:"#000", borderRadius:10, padding:"10px 24px", fontWeight:800, fontSize:14, textDecoration:"none" }}>View Profile →</a>
          <button onClick={()=>{ setSubmitted(false); setTitle(""); setContent(""); setSourceUrl(""); }} style={{ background:"var(--card)", color:"var(--fg)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 24px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
            Submit Another
          </button>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"100px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:780, margin:"0 auto" }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:"clamp(24px,5vw,36px)", fontWeight:900, color:"var(--fg)", margin:"0 0 8px" }}>Submit Content</h1>
          <p style={{ color:"var(--sub)", fontSize:15, margin:0 }}>Share a post or alpha opportunity with the community.</p>
        </div>

        {/* Type selector */}
        <div style={{ display:"flex", gap:10, marginBottom:28 }}>
          {(["post","alpha"] as const).map(t => (
            <button key={t} onClick={()=>setType(t)} style={{ flex:1, background:type===t?"#34d399":"var(--card)", color:type===t?"#000":"var(--sub)", border:`1px solid ${type===t?"#34d399":"var(--border)"}`, borderRadius:12, padding:"14px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}>
              {t === "post" ? "📝 Blog Post" : "⚡ Alpha Opportunity"}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Title */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--sub)", marginBottom:8, textTransform:"uppercase", letterSpacing:".05em" }}>Title *</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={type==="post"?"Give your post a compelling title...":"Alpha opportunity name..."} style={{ ...inp, fontSize:18, fontWeight:700, padding:"14px 16px" }} />
          </div>

          {/* Category */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--sub)", marginBottom:8, textTransform:"uppercase", letterSpacing:".05em" }}>Category</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {(type==="post"?["Web3","Crypto","DeFi","Design","AI Tools"]:["Airdrop","Bounty","Grant","IDO","NFT Mint","Testnet"]).map(c => (
                <button key={c} onClick={()=>setCategory(c)} style={{ background:category===c?"#34d399":"var(--card)", color:category===c?"#000":"var(--sub)", border:`1px solid ${category===c?"#34d399":"var(--border)"}`, borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Rich Editor */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--sub)", marginBottom:8, textTransform:"uppercase", letterSpacing:".05em" }}>Content *</label>
            <RichPostEditor content={content} onChange={setContent} placeholder={type==="post"?"Write your post here. Use the toolbar to format, add links, images...":"Describe the opportunity — how to participate, requirements, deadlines, links..."} />
          </div>

          {/* Source URL */}
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--sub)", marginBottom:8, textTransform:"uppercase", letterSpacing:".05em" }}>Source / Reference URL {type==="alpha"&&<span style={{color:"#f87171"}}>*</span>}</label>
            <input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..." style={inp} />
          </div>

          {/* Author */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"rgba(52,211,153,.05)", border:"1px solid rgba(52,211,153,.15)", borderRadius:12 }}>
            {user.photoURL && <img src={user.photoURL} alt="" style={{ width:36, height:36, borderRadius:"50%", border:"2px solid #34d399" }} />}
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"var(--fg)", margin:0 }}>Submitting as {user.displayName || user.email}</p>
              <p style={{ fontSize:11, color:"var(--sub)", margin:0 }}>Your submission will be reviewed by an admin before publishing</p>
            </div>
          </div>

          <button onClick={submit} disabled={submitting||!title.trim()||!content.trim()} style={{ background:(!title.trim()||!content.trim())?"rgba(52,211,153,.3)":"#34d399", color:"#000", border:"none", borderRadius:12, padding:"16px", fontSize:15, fontWeight:800, cursor:(!title.trim()||!content.trim())?"not-allowed":"pointer", fontFamily:"inherit", transition:"all .2s" }}>
            {submitting ? "Submitting..." : "Submit for Review →"}
          </button>
        </div>
      </div>
    </main>
  );
}
