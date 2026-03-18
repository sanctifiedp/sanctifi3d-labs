"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, setDoc, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTheme } from "../../lib/ThemeContext";
import RichEditor from "../../components/RichEditor";

const ADMINS = ["adeyigbeminiyi414@gmail.com","adeyigbeminiy414@gmail.com"];
const ADMIN_KEY = "sanctifi3d_admin_2026";

type Tab = "posts" | "alpha" | "create" | "create-alpha" | "subscribers" | "siteSettings";

export default function Admin() {
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [alphas, setAlphas] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>("posts");
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  // Edit state
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingAlpha, setEditingAlpha] = useState<any>(null);

  // Create Post
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Web3");
  const [coverUrl, setCoverUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Create Alpha
  const [alphaTitle, setAlphaTitle] = useState("");
  const [alphaContent, setAlphaContent] = useState("");
  const [alphaType, setAlphaType] = useState("Airdrop");
  const [alphaAudience, setAlphaAudience] = useState("Crypto");
  const [alphaSource, setAlphaSource] = useState("");
  const [alphaCover, setAlphaCover] = useState("");
  const alphaFileRef = useRef<HTMLInputElement>(null);

  // Newsletter
  const [nlSubject, setNlSubject] = useState("");
  const [nlBody, setNlBody] = useState("");
  const [sending, setSending] = useState(false);

  const fg = "var(--fg)";
  const sub = "var(--sub)";
  const cardBg = "var(--card)";
  const border = "var(--border)";

  const inp = { width:"100%", background:"var(--card)", border:`1px solid var(--border)`, borderRadius:8, padding:"10px 14px", color:"var(--fg)", fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" } as any;
  const btn = (bg2:string, col:string, extra?:any) => ({ background:bg2, color:col, border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", ...extra } as any);

  useEffect(() => { auth.onAuthStateChanged(u => { if(u && ADMINS.includes(u.email||"")) setUser(u); }); },[]);
  useEffect(() => { if(user){ fetchAll(); } },[user]);

  async function fetchAll() { await Promise.all([fetchPosts(), fetchAlphas(), fetchSubs()]); }
  async function fetchPosts() { const s = await getDocs(query(collection(db,"posts"),orderBy("createdAt","desc"))); setPosts(s.docs.map(d=>({id:d.id,...d.data()}))); }
  async function fetchAlphas() { const s = await getDocs(query(collection(db,"alpha"),orderBy("createdAt","desc"))); setAlphas(s.docs.map(d=>({id:d.id,...d.data()}))); }
  async function fetchSubs() { const s = await getDocs(query(collection(db,"subscribers"),orderBy("subscribedAt","desc"))); setSubscribers(s.docs.map(d=>({id:d.id,...d.data()}))); }

  function flash(m:string) { setMsg(m); setTimeout(()=>setMsg(""),4000); }

  async function login() {
    try { const u = await signInWithEmailAndPassword(auth,loginEmail,loginPass); setUser(u.user); }
    catch(e:any) { flash("❌ "+e.message); }
  }

  async function approve(item:any, col:string) {
    await updateDoc(doc(db,col,item.id),{status:"approved"});
    // Auto-notify subscribers
    try {
      const excerpt = (item.content||"").replace(/<[^>]+>/g,"").slice(0,160)+"...";
      await fetch("/api/notify-subscribers",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:col==="posts"?"post":"alpha", title:item.title, excerpt, itemId:item.id, category:item.category||item.type||"", adminKey:ADMIN_KEY })
      });
    } catch(e) { console.error("Notify error",e); }
    col==="posts"?fetchPosts():fetchAlphas();
    flash("✅ Approved & subscribers notified!");
  }

  async function remove(id:string, col:string) {
    if(!confirm("Delete this item?")) return;
    await deleteDoc(doc(db,col,id));
    col==="posts"?fetchPosts():fetchAlphas();
    flash("🗑 Deleted.");
  }

  async function uploadImg(file:File, set:(u:string)=>void) {
    setUploading(true);
    const r = ref(storage,`covers/${Date.now()}_${file.name}`);
    await uploadBytes(r,file);
    set(await getDownloadURL(r));
    setUploading(false);
  }

  async function saveEditPost() {
    if(!editingPost) return;
    await updateDoc(doc(db,"posts",editingPost.id),{
      title:editingPost.title, content:editingPost.content,
      category:editingPost.category, imageUrl:editingPost.imageUrl||""
    });
    setEditingPost(null); fetchPosts(); flash("✅ Post updated!");
  }

  async function saveEditAlpha() {
    if(!editingAlpha) return;
    await updateDoc(doc(db,"alpha",editingAlpha.id),{
      title:editingAlpha.title, content:editingAlpha.content,
      type:editingAlpha.type, audience:editingAlpha.audience,
      sourceUrl:editingAlpha.sourceUrl||"", imageUrl:editingAlpha.imageUrl||""
    });
    setEditingAlpha(null); fetchAlphas(); flash("✅ Alpha updated!");
  }

  async function createPost() {
    if(!title||!content){flash("⚠️ Title and content required");return;}
    await addDoc(collection(db,"posts"),{title,content,category,imageUrl:coverUrl,type:"manual",status:"approved",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),createdAt:new Date().toISOString()});
    setTitle("");setContent("");setCoverUrl("");
    fetchPosts();setTab("posts");flash("✅ Post published!");
  }

  async function createAlpha() {
    if(!alphaTitle||!alphaContent){flash("⚠️ Title and content required");return;}
    await addDoc(collection(db,"alpha"),{title:alphaTitle,content:alphaContent,type:alphaType,audience:alphaAudience,sourceUrl:alphaSource,imageUrl:alphaCover,status:"approved",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),createdAt:new Date().toISOString()});
    setAlphaTitle("");setAlphaContent("");setAlphaSource("");setAlphaCover("");
    fetchAlphas();setTab("alpha");flash("✅ Alpha published!");
  }

  async function sendNewsletter() {
    if(!nlSubject||!nlBody){flash("⚠️ Subject and body required");return;}
    setSending(true);
    try {
      const res = await fetch("/api/send-newsletter",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subject:nlSubject,html:nlBody,adminKey:ADMIN_KEY})});
      const data = await res.json();
      if(data.success) flash(`✅ Sent to ${data.sent}/${data.total} subscribers!`);
      else flash("❌ Error: "+data.error);
    } catch(e:any){ flash("❌ "+e.message); }
    setSending(false);
  }

  // ---- LOGIN SCREEN ----
  if(!user) return (
    <main style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1}}>
      <div style={{width:"100%",maxWidth:360,padding:24,background:cardBg,borderRadius:16,border:`1px solid ${border}`}}>
        <h2 style={{fontWeight:800,fontSize:22,marginBottom:6,color:fg}}>Admin Login</h2>
        <p style={{color:sub,fontSize:13,marginBottom:24}}>Sanctifi3d Labs</p>
        {msg&&<p style={{color:"#f87171",fontSize:13,marginBottom:12}}>{msg}</p>}
        <input placeholder="Email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} style={inp}/>
        <input placeholder="Password" type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} style={inp}/>
        <button onClick={login} style={{...btn("#34d399","#000"),width:"100%",padding:12,fontSize:15}}>Login →</button>
      </div>
    </main>
  );

  const pending = posts.filter(p=>p.status==="pending");
  const pendingA = alphas.filter(a=>a.status==="pending");

  // ---- EDIT POST MODAL ----
  if(editingPost) return (
    <main style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",padding:"32px 20px",position:"relative",zIndex:1}}>
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontWeight:800,fontSize:18,color:fg}}>✏️ Edit Post</h2>
          <button onClick={()=>setEditingPost(null)} style={btn("transparent",sub)}>← Cancel</button>
        </div>
        <input value={editingPost.title} onChange={e=>setEditingPost({...editingPost,title:e.target.value})} style={inp} placeholder="Title"/>
        <select value={editingPost.category} onChange={e=>setEditingPost({...editingPost,category:e.target.value})} style={{...inp}}>
          {["Web3","Crypto","Design","AI Tools"].map(c=><option key={c}>{c}</option>)}
        </select>
        <input value={editingPost.imageUrl||""} onChange={e=>setEditingPost({...editingPost,imageUrl:e.target.value})} style={inp} placeholder="Cover image URL"/>
        {editingPost.imageUrl&&<img src={editingPost.imageUrl} style={{width:"100%",height:140,objectFit:"cover",borderRadius:8,marginBottom:10}}/>}
        <p style={{fontSize:13,color:sub,marginBottom:8}}>Content</p>
        <RichEditor value={editingPost.content||""} onChange={v=>setEditingPost({...editingPost,content:v})} dark={dark}/>
        {msg&&<p style={{color:"#34d399",marginTop:12,fontWeight:600}}>{msg}</p>}
        <div style={{display:"flex",gap:12,marginTop:20}}>
          <button onClick={saveEditPost} style={btn("#34d399","#000",{padding:"12px 32px"})}>Save Changes</button>
          <button onClick={()=>setEditingPost(null)} style={btn("transparent",sub,{border:`1px solid ${border}`,padding:"12px 24px"})}>Cancel</button>
        </div>
      </div>
    </main>
  );

  // ---- EDIT ALPHA MODAL ----
  if(editingAlpha) return (
    <main style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",padding:"32px 20px",position:"relative",zIndex:1}}>
      <div style={{maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontWeight:800,fontSize:18,color:fg}}>✏️ Edit Alpha</h2>
          <button onClick={()=>setEditingAlpha(null)} style={btn("transparent",sub)}>← Cancel</button>
        </div>
        <input value={editingAlpha.title} onChange={e=>setEditingAlpha({...editingAlpha,title:e.target.value})} style={inp} placeholder="Title"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <select value={editingAlpha.type} onChange={e=>setEditingAlpha({...editingAlpha,type:e.target.value})} style={{...inp,margin:0}}>
            {["Airdrop","Bounty","Contest","Presale","Grant","Hackathon","Gig"].map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={editingAlpha.audience} onChange={e=>setEditingAlpha({...editingAlpha,audience:e.target.value})} style={{...inp,margin:0}}>
            {["Crypto","Web3","Graphic Design","AI Tools"].map(a=><option key={a}>{a}</option>)}
          </select>
        </div>
        <input value={editingAlpha.sourceUrl||""} onChange={e=>setEditingAlpha({...editingAlpha,sourceUrl:e.target.value})} style={inp} placeholder="Source URL"/>
        <input value={editingAlpha.imageUrl||""} onChange={e=>setEditingAlpha({...editingAlpha,imageUrl:e.target.value})} style={inp} placeholder="Cover image URL"/>
        {editingAlpha.imageUrl&&<img src={editingAlpha.imageUrl} style={{width:"100%",height:140,objectFit:"cover",borderRadius:8,marginBottom:10}}/>}
        <p style={{fontSize:13,color:sub,marginBottom:8}}>Content</p>
        <RichEditor value={editingAlpha.content||""} onChange={v=>setEditingAlpha({...editingAlpha,content:v})} dark={dark}/>
        {msg&&<p style={{color:"#34d399",marginTop:12,fontWeight:600}}>{msg}</p>}
        <div style={{display:"flex",gap:12,marginTop:20}}>
          <button onClick={saveEditAlpha} style={btn("#fbbf24","#000",{padding:"12px 32px"})}>Save Changes</button>
          <button onClick={()=>setEditingAlpha(null)} style={btn("transparent",sub,{border:`1px solid ${border}`,padding:"12px 24px"})}>Cancel</button>
        </div>
      </div>
    </main>
  );

  // ---- MAIN DASHBOARD ----

  async function bulkApprove(type: 'posts' | 'alpha') {
    const items = type === 'posts' ? posts : alphas;
    const pending = items.filter((p: any) => p.status === 'pending');
    if (pending.length === 0) return alert('No pending items.');
    const col = collection(db, type === 'posts' ? 'posts' : 'alpha');
    await Promise.all(pending.map((p: any) =>
      updateDoc(doc(db, type === 'posts' ? 'posts' : 'alpha', p.id), { status: 'approved' })
    ));
    if (type === 'posts') setPosts(prev => prev.map((p: any) => ({ ...p, status: p.status === 'pending' ? 'approved' : p.status })));
    else setAlphas(prev => prev.map((p: any) => ({ ...p, status: p.status === 'pending' ? 'approved' : p.status })));
    alert('All approved!');
  }

  async function uploadLogo(file: File) {
    try {
      const storageRef = ref(storage, "settings/logo");
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, "settings", "site"), { logoUrl: url }, { merge: true });
      alert("Logo updated successfully!");
    } catch(e) {
      console.error(e);
      alert("Failed to upload logo.");
    }
  }

  return (
    <main style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",position:"relative",zIndex:1}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 20px"}}>

        {/* HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <h1 style={{fontWeight:900,fontSize:20,color:fg}}>Sanctifi3d<span style={{color:"#34d399"}}>Labs</span> Admin</h1>
          <div style={{display:"flex",gap:10}}>
            <button onClick={toggle} style={btn("var(--card)",fg,{border:`1px solid ${border}`})}>{dark?"☀️ Light":"🌙 Dark"}</button>
            <button onClick={()=>signOut(auth).then(()=>setUser(null))} style={btn("rgba(248,113,113,.15)","#f87171")}>Logout</button>
          </div>
        </div>

        {/* STATS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:28}}>
          {([["Posts",posts.length,"#34d399"],["Pending",pending.length,"#fbbf24"],["Alphas",alphas.length,"#38bdf8"],["Pending α",pendingA.length,"#f472b6"],["Subscribers",subscribers.length,"#a78bfa"]] as const).map(([l,v,c])=>(
            <div key={l} style={{background:cardBg,border:`1px solid ${border}`,borderRadius:12,padding:"14px 16px"}}>
              <p style={{fontSize:22,fontWeight:800,color:c,margin:"0 0 4px"}}>{v}</p>
              <p style={{fontSize:12,color:sub,margin:0}}>{l}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          {([["posts","📰 Posts"],["alpha","⚡ Alpha"],["create","✍️ Write Post"],["create-alpha","🎯 Write Alpha"],["subscribers","📧 Subscribers"]] as const).map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={btn(tab===t?"#34d399":"transparent",tab===t?"#000":sub,{border:`1px solid ${border}`})}>
              {label}{t==="posts"&&pending.length>0?` (${pending.length})`:t==="alpha"&&pendingA.length>0?` (${pendingA.length})`:t==="subscribers"?` (${subscribers.length})`:""}
            </button>
          ))}
        </div>

        {msg&&<p style={{color:"#34d399",marginBottom:16,fontWeight:600,fontSize:14}}>{msg}</p>}

        {/* POSTS LIST */}
        {tab==="posts"&&(<>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12,gap:8}}><button onClick={()=>bulkApprove("posts")} style={{...btn("rgba(52,211,153,.12)","#34d399"),border:"1px solid rgba(52,211,153,.3)"}}>✓ Bulk Approve</button></div>
          {posts.length===0?<p style={{color:sub}}>No posts yet.</p>:posts.map(p=>(
            <div key={p.id} style={{background:cardBg,border:`1px solid ${p.status==="pending"?"rgba(251,191,36,.4)":border}`,borderRadius:12,padding:"14px 18px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,background:"var(--card)",border:`1px solid ${border}`,borderRadius:4,padding:"2px 8px",color:sub}}>{p.category}</span>
                    <span style={{fontSize:11,color:p.status==="pending"?"#fbbf24":"#34d399",fontWeight:600}}>● {p.status}</span>
                    {p.type==="ai"&&<span style={{fontSize:11,color:sub}}>✦ AI</span>}
                  </div>
                  <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px",color:fg}}>{p.title}</p>
                  <p style={{fontSize:12,color:sub,margin:0}}>{p.date}</p>
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-start"}}>
                  {p.status==="pending"&&<button onClick={()=>approve(p,"posts")} style={btn("#34d399","#000")}>✓ Approve</button>}
                  <button onClick={()=>setEditingPost(p)} style={btn("var(--card)",fg,{border:`1px solid ${border}`})}>✏️ Edit</button>
                  <button onClick={()=>remove(p.id,"posts")} style={btn("rgba(248,113,113,.12)","#f87171")}>🗑</button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* ALPHA LIST */}
        {tab==="alpha"&&(<>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12,gap:8}}><button onClick={()=>bulkApprove("alpha")} style={{...btn("rgba(52,211,153,.12)","#34d399"),border:"1px solid rgba(52,211,153,.3)"}}>✓ Bulk Approve</button></div>
          {alphas.length===0?<p style={{color:sub}}>No alpha posts yet.</p>:alphas.map(a=>(
            <div key={a.id} style={{background:cardBg,border:`1px solid ${a.status==="pending"?"rgba(251,191,36,.4)":border}`,borderRadius:12,padding:"14px 18px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,background:"rgba(251,191,36,.15)",borderRadius:4,padding:"2px 8px",color:"#fbbf24",fontWeight:700}}>{a.type}</span>
                    <span style={{fontSize:11,background:"rgba(56,189,248,.15)",borderRadius:4,padding:"2px 8px",color:"#38bdf8",fontWeight:700}}>{a.audience}</span>
                    <span style={{fontSize:11,color:a.status==="pending"?"#fbbf24":"#34d399",fontWeight:600}}>● {a.status}</span>
                  </div>
                  <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px",color:fg}}>{a.title}</p>
                  {a.sourceUrl&&<a href={a.sourceUrl} target="_blank" style={{fontSize:12,color:"#34d399"}}>{a.sourceUrl.slice(0,50)}...</a>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-start"}}>
                  {a.status==="pending"&&<button onClick={()=>approve(a,"alpha")} style={btn("#34d399","#000")}>✓ Approve</button>}
                  <button onClick={()=>setEditingAlpha(a)} style={btn("var(--card)",fg,{border:`1px solid ${border}`})}>✏️ Edit</button>
                  <button onClick={()=>remove(a.id,"alpha")} style={btn("rgba(248,113,113,.12)","#f87171")}>🗑</button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* CREATE POST */}
        {tab==="create"&&(
          <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
            <h3 style={{fontWeight:800,fontSize:16,marginBottom:18,color:fg}}>✍️ Write New Post</h3>
            <input placeholder="Post title" value={title} onChange={e=>setTitle(e.target.value)} style={inp}/>
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{...inp}}>
              {["Web3","Crypto","Design","AI Tools"].map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{marginBottom:14}}>
              <p style={{fontSize:13,color:sub,marginBottom:8}}>Cover Image</p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <button onClick={()=>fileRef.current?.click()} style={btn("var(--card)",fg,{border:`1px solid ${border}`})}>{uploading?"Uploading...":"📁 Upload"}</button>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&uploadImg(e.target.files[0],setCoverUrl)}/>
                <input placeholder="Or paste image URL" value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} style={{...inp,margin:0,flex:1}}/>
              </div>
              {coverUrl&&<img src={coverUrl} style={{marginTop:10,width:"100%",height:150,objectFit:"cover",borderRadius:8}}/>}
            </div>
            <p style={{fontSize:13,color:sub,marginBottom:8}}>Content</p>
            <RichEditor value={content} onChange={setContent} dark={dark}/>
            <button onClick={createPost} style={{...btn("#34d399","#000"),marginTop:20,padding:"12px 32px",fontSize:15}}>Publish Post</button>
          </div>
        )}

        {/* CREATE ALPHA */}
        {tab==="create-alpha"&&(
          <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
            <h3 style={{fontWeight:800,fontSize:16,marginBottom:18,color:fg}}>🎯 Write Alpha Post</h3>
            <input placeholder="Title e.g. 'Airdrop: Claim 500 USDT from XYZ Protocol'" value={alphaTitle} onChange={e=>setAlphaTitle(e.target.value)} style={inp}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <select value={alphaType} onChange={e=>setAlphaType(e.target.value)} style={{...inp,margin:0}}>
                {["Airdrop","Bounty","Contest","Presale","Grant","Hackathon","Gig"].map(t=><option key={t}>{t}</option>)}
              </select>
              <select value={alphaAudience} onChange={e=>setAlphaAudience(e.target.value)} style={{...inp,margin:0}}>
                {["Crypto","Web3","Graphic Design","AI Tools"].map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
            <input placeholder="Source URL (where to participate)" value={alphaSource} onChange={e=>setAlphaSource(e.target.value)} style={inp}/>
            <div style={{marginBottom:14}}>
              <p style={{fontSize:13,color:sub,marginBottom:8}}>Cover Image</p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <button onClick={()=>alphaFileRef.current?.click()} style={btn("var(--card)",fg,{border:`1px solid ${border}`})}>{uploading?"Uploading...":"📁 Upload"}</button>
                <input ref={alphaFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&uploadImg(e.target.files[0],setAlphaCover)}/>
                <input placeholder="Or paste image URL" value={alphaCover} onChange={e=>setAlphaCover(e.target.value)} style={{...inp,margin:0,flex:1}}/>
              </div>
              {alphaCover&&<img src={alphaCover} style={{marginTop:10,width:"100%",height:150,objectFit:"cover",borderRadius:8}}/>}
            </div>
            <p style={{fontSize:13,color:sub,marginBottom:8}}>Details</p>
            <RichEditor value={alphaContent} onChange={setAlphaContent} dark={dark}/>
            <button onClick={createAlpha} style={{...btn("#fbbf24","#000"),marginTop:20,padding:"12px 32px",fontSize:15}}>Publish Alpha</button>
          </div>
        )}

        {/* SUBSCRIBERS */}
        {tab==="siteSettings"&&(
          <div style={{ maxWidth:480 }}>
            <h2 style={{ fontWeight:900, fontSize:20, color:"var(--fg)", marginBottom:8 }}>Site Settings</h2>
            <p style={{ color:"var(--sub)", fontSize:14, marginBottom:28 }}>Upload a logo. It appears as a small circle next to your site name on all pages.</p>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
              <h3 style={{ fontWeight:800, fontSize:16, color:"var(--fg)", marginBottom:16 }}>Site Logo</h3>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} style={{ display:"block", marginBottom:16, color:"var(--fg)", fontSize:14 }} />
              <p style={{ fontSize:12, color:"var(--sub)" }}>Recommended: 200x200px square PNG or JPG</p>
            </div>
          </div>
        )}
        {tab==="subscribers"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* SEND NEWSLETTER */}
            <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
              <h3 style={{fontWeight:800,fontSize:16,marginBottom:4,color:fg}}>📨 Send Newsletter</h3>
              <p style={{fontSize:13,color:sub,marginBottom:18}}>Will be sent to all {subscribers.length} subscribers</p>
              <input placeholder="Subject line" value={nlSubject} onChange={e=>setNlSubject(e.target.value)} style={inp}/>
              <p style={{fontSize:13,color:sub,marginBottom:8}}>Body (HTML supported)</p>
              <RichEditor value={nlBody} onChange={setNlBody} dark={dark}/>
              <button onClick={sendNewsletter} disabled={sending} style={{...btn("#34d399","#000"),marginTop:16,padding:"11px 28px"}}>
                {sending?"Sending...":"📨 Send to All Subscribers"}
              </button>
            </div>

            {/* SUBSCRIBER LIST */}
            <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
              <h3 style={{fontWeight:800,fontSize:16,marginBottom:18,color:fg}}>📋 Subscribers ({subscribers.length})</h3>
              {subscribers.length===0?<p style={{color:sub}}>No subscribers yet.</p>:
                subscribers.map(s=>(
                  <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${border}`}}>
                    <div>
                      <p style={{fontWeight:600,fontSize:14,margin:"0 0 2px",color:fg}}>{s.email}</p>
                      <p style={{fontSize:12,color:sub,margin:0}}>{s.date}</p>
                    </div>
                    <span style={{fontSize:11,color:"#34d399",fontWeight:700}}>✓ Active</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
