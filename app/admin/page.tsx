"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const ADMINS = ["adeyigbeminiyi414@gmail.com", "adeyigbeminiy414@gmail.com"];
const THEMES = { dark: { bg:"#080808", card:"rgba(255,255,255,.02)", border:"rgba(255,255,255,.07)", text:"#fff", sub:"rgba(255,255,255,.4)" }, light: { bg:"#f5f5f5", card:"#fff", border:"rgba(0,0,0,.08)", text:"#111", sub:"rgba(0,0,0,.5)" } };

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web3");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("posts");
  const [theme, setTheme] = useState<"dark"|"light">("dark");
  const [accentColor, setAccentColor] = useState("#34d399");
  const fileRef = useRef<HTMLInputElement>(null);
  const T = THEMES[theme];

  useEffect(() => { onAuthStateChanged(auth, u => setUser(u)); }, []);
  useEffect(() => { if (user) fetchPosts(); }, [user]);

  async function fetchPosts() {
    const snap = await getDocs(collection(db, "posts"));
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function login() {
    try {
      const u = await signInWithEmailAndPassword(auth, email, password);
      if (!ADMINS.includes(u.user.email!)) { await signOut(auth); setError("Not an admin."); }
    } catch { setError("Invalid credentials."); }
  }

  async function createPost() {
    if (!title || !content) return;
    setUploading(true);
    let imageUrl = "";
    if (imageFile) {
      const r = ref(storage, "posts/" + Date.now() + "_" + imageFile.name);
      await uploadBytes(r, imageFile);
      imageUrl = await getDownloadURL(r);
    }
    await addDoc(collection(db, "posts"), { title, category, content, imageUrl, status:"approved", type:"manual", date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}) });
    setTitle(""); setContent(""); setImageFile(null); setImagePreview(""); setUploading(false); fetchPosts(); setTab("posts");
  }

  async function approve(id: string) { await updateDoc(doc(db,"posts",id),{status:"approved"}); fetchPosts(); }
  async function remove(id: string) { await deleteDoc(doc(db,"posts",id)); fetchPosts(); }

  const inp = { width:"100%", background: theme==="dark"?"rgba(255,255,255,.05)":"rgba(0,0,0,.05)", border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 14px", color:T.text, fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" } as any;

  if (!user) return (
    <main style={{ fontFamily:"system-ui,sans-serif", background:T.bg, color:T.text, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:360, padding:32 }}>
        <h1 style={{ fontWeight:800, fontSize:24, marginBottom:24 }}>Sanctifi3d<span style={{ color:accentColor }}>Labs</span> Admin</h1>
        {error && <p style={{ color:"#f87171", marginBottom:12, fontSize:13 }}>{error}</p>}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} />
        <button onClick={login} style={{ width:"100%", background:accentColor, color:"#000", border:"none", borderRadius:8, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Login</button>
      </div>
    </main>
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", background:T.bg, color:T.text, minHeight:"100vh" }}>
      <nav style={{ background: theme==="dark"?"rgba(8,8,8,.9)":"rgba(255,255,255,.9)", borderBottom:`1px solid ${T.border}`, height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <span style={{ fontWeight:800 }}>Sanctifi3d<span style={{ color:accentColor }}>Labs</span> Admin</span>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>{theme==="dark"?"☀️ Light":"🌙 Dark"}</button>
          <button onClick={()=>signOut(auth)} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:32, flexWrap:"wrap" }}>
          {["posts","create","theme"].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ borderRadius:999, padding:"6px 18px", fontSize:13, fontWeight:600, border:`1px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit", background:tab===t?accentColor:"transparent", color:tab===t?"#000":T.sub }}>{t==="posts"?"All Posts":t==="create"?"Create Post":"Theme"}</button>
          ))}
        </div>

        {tab==="theme" && (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
            <h2 style={{ fontWeight:700, marginBottom:20 }}>Website Theme</h2>
            <p style={{ color:T.sub, fontSize:14, marginBottom:16 }}>Mode</p>
            <div style={{ display:"flex", gap:10, marginBottom:24 }}>
              {(["dark","light"] as const).map(m => (
                <button key={m} onClick={()=>setTheme(m)} style={{ borderRadius:8, padding:"10px 20px", fontSize:13, fontWeight:600, border:`1px solid ${T.border}`, cursor:"pointer", fontFamily:"inherit", background:theme===m?accentColor:"transparent", color:theme===m?"#000":T.sub }}>{m==="dark"?"🌙 Dark":"☀️ Light"}</button>
              ))}
            </div>
            <p style={{ color:T.sub, fontSize:14, marginBottom:12 }}>Accent Color</p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {["#34d399","#60a5fa","#f472b6","#fbbf24","#a78bfa","#fb923c"].map(c => (
                <button key={c} onClick={()=>setAccentColor(c)} style={{ width:36, height:36, borderRadius:"50%", background:c, border: accentColor===c?"3px solid white":"3px solid transparent", cursor:"pointer" }} />
              ))}
            </div>
          </div>
        )}

        {tab==="create" && (
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
            <h2 style={{ fontWeight:700, marginBottom:20 }}>New Post</h2>
            <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={inp} />
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{ ...inp, marginBottom:10 }}>
              {["Web3","Crypto","Design","AI Tools"].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ marginBottom:10 }}>
              <p style={{ color:T.sub, fontSize:13, marginBottom:8 }}>Cover Image</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f))}}} style={{ display:"none" }} />
              <button onClick={()=>fileRef.current?.click()} style={{ background:"transparent", border:`1px solid ${T.border}`, color:T.sub, borderRadius:8, padding:"8px 16px", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>📷 Choose Image</button>
              {imagePreview && <img src={imagePreview} style={{ display:"block", marginTop:10, maxWidth:"100%", borderRadius:8, maxHeight:200, objectFit:"cover" }} />}
            </div>
            <p style={{ color:T.sub, fontSize:13, marginBottom:8 }}>Content</p>
            <textarea placeholder="Write your full post here..." value={content} onChange={e=>setContent(e.target.value)} rows={12} style={{ ...inp, resize:"vertical", lineHeight:1.7 }} />
            <button onClick={createPost} disabled={uploading} style={{ background:accentColor, color:"#000", border:"none", borderRadius:8, padding:"10px 24px", fontSize:14, fontWeight:700, cursor:"pointer" }}>{uploading?"Publishing...":"Publish Post"}</button>
          </div>
        )}

        {tab==="posts" && (
          <div>
            <h2 style={{ fontWeight:700, marginBottom:20 }}>All Posts ({posts.length})</h2>
            {posts.length===0 ? <p style={{ color:T.sub }}>No posts yet.</p> : posts.map(p=>(
              <div key={p.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 20px", marginBottom:10 }}>
                {p.imageUrl && <img src={p.imageUrl} style={{ width:"100%", height:120, objectFit:"cover", borderRadius:8, marginBottom:10 }} />}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                  <div>
                    <span style={{ fontSize:11, fontWeight:700, color:accentColor, textTransform:"uppercase", marginRight:8 }}>{p.category}</span>
                    <span style={{ fontSize:11, color: p.status==="approved"?accentColor:"#fbbf24" }}>● {p.status}</span>
                    <p style={{ fontWeight:700, fontSize:15, margin:"6px 0 0" }}>{p.title}</p>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {p.status!=="approved" && <button onClick={()=>approve(p.id)} style={{ background:accentColor, color:"#000", border:"none", borderRadius:6, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Approve</button>}
                    <button onClick={()=>remove(p.id)} style={{ background:"rgba(248,113,113,.15)", color:"#f87171", border:"1px solid rgba(248,113,113,.3)", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
