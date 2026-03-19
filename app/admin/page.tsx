"use client";
import AdminGuard from "../../components/AdminGuard";
import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../lib/firebase";
import { collection, setDoc, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTheme } from "../../lib/ThemeContext";
import RichEditor from "../../components/RichEditor";

const ADMINS = ["adeyigbeminiyi414@gmail.com","adeyigbeminiy414@gmail.com"];
const ADMIN_KEY = "sanctifi3d_admin_2026";

type Tab = "posts" | "alpha" | "create" | "create-alpha" | "subscribers" | "analytics" | "userSubmissions";

export default function Admin() {
  const { dark, toggle } = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [alphas, setAlphas] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [submissions, setUserSubmissions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{totalViews:number, topPosts:any[], recentSubs:any[], subsByDay:any[], viewsByPost:any[]}>({totalViews:0, topPosts:[], recentSubs:[], subsByDay:[], viewsByPost:[]});
  const [tab, setTab] = useState<Tab>("posts");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [selectedAlphas, setSelectedAlphas] = useState<string[]>([]);
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

  useEffect(() => { fetchAll(); },[]);

  async function fetchAll() { await Promise.all([fetchPosts(), fetchAlphas(), fetchSubs()]); }
  async function fetchPosts() { const s = await getDocs(query(collection(db,"posts"),orderBy("createdAt","desc"))); setPosts(s.docs.map(d=>({id:d.id,...d.data()}))); }
  async function fetchAlphas() { const s = await getDocs(query(collection(db,"alpha"),orderBy("createdAt","desc"))); setAlphas(s.docs.map(d=>({id:d.id,...d.data()}))); }
  async function fetchUserSubmissions() {
    const snap = await getDocs(query(collection(db, "submissions"), orderBy("createdAt","desc")));
    setUserSubmissions(snap.docs.map(d => ({ id:d.id, ...d.data() })));
  }

  async function approveSubmission(sub: any) {
    // Move to posts or alpha collection
    const col = sub.type === "alpha" ? "alpha" : "posts";
    const ref = await addDoc(collection(db, col), {
      title: sub.title,
      content: sub.content,
      category: sub.category,
      sourceUrl: sub.sourceUrl || "",
      sourceLabel: sub.authorName || "Community",
      type: "community",
      status: "approved",
      date: sub.date,
      createdAt: sub.createdAt,
      authorName: sub.authorName,
      authorUid: sub.uid,
    });
    await updateDoc(doc(db, "submissions", sub.id), { status:"approved", publishedId: ref.id });
    setUserSubmissions(s => s.map(x => x.id===sub.id ? {...x, status:"approved", publishedId:ref.id} : x));
    flash("Submission approved and published!");
  }

  async function rejectSubmission(id: string, note: string) {
    await updateDoc(doc(db, "submissions", id), { status:"rejected", adminNote: note });
    setUserSubmissions(s => s.map(x => x.id===id ? {...x, status:"rejected", adminNote:note} : x));
    flash("Submission rejected.");
  }

  async function fetchAnalytics() {
    // Get views
    const viewsSnap = await getDocs(collection(db, "views"));
    const viewsByPost: any[] = [];
    let totalViews = 0;
    viewsSnap.docs.forEach(d => {
      totalViews += d.data().count || 0;
      viewsByPost.push({ id: d.id, count: d.data().count || 0 });
    });
    viewsByPost.sort((a,b) => b.count - a.count);

    // Get top posts with titles
    const postsSnap = await getDocs(query(collection(db, "posts"), where("status","==","approved")));
    const postMap: Record<string,string> = {};
    postsSnap.docs.forEach(d => { postMap[d.id] = (d.data() as any).title || "Untitled"; });
    const topPosts = viewsByPost.slice(0,5).map(v => ({ ...v, title: postMap[v.id] || "Unknown" }));

    // Get subscribers by day (last 7 days)
    const subsSnap = await getDocs(collection(db, "subscribers"));
    const allSubs = subsSnap.docs.map(d => d.data());
    const recentSubs = allSubs.slice(-5).reverse();

    // Group subs by day
    const dayMap: Record<string,number> = {};
    allSubs.forEach((s:any) => {
      if (s.subscribedAt) {
        const day = s.subscribedAt.slice(0,10);
        dayMap[day] = (dayMap[day]||0) + 1;
      }
    });
    const subsByDay = Object.entries(dayMap).sort((a,b)=>a[0].localeCompare(b[0])).slice(-7).map(([date,count])=>({date,count}));

    setAnalytics({ totalViews, topPosts, recentSubs, subsByDay, viewsByPost });
  }

  async function fetchSubs() { const s = await getDocs(query(collection(db,"subscribers"),orderBy("subscribedAt","desc"))); setSubscribers(s.docs.map(d=>({id:d.id,...d.data()}))); }

  function flash(m:string) { setMsg(m); setTimeout(()=>setMsg(""),4000); }

  

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
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><a href="/admin/settings" style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#9ca3af",textDecoration:"none",fontWeight:600}}>⚙ Settings →</a></div>
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
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><a href="/admin/settings" style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#9ca3af",textDecoration:"none",fontWeight:600}}>⚙ Settings →</a></div>
        {msg&&<p style={{color:"#34d399",marginTop:12,fontWeight:600}}>{msg}</p>}
        <div style={{display:"flex",gap:12,marginTop:20}}>
          <button onClick={saveEditAlpha} style={btn("#fbbf24","#000",{padding:"12px 32px"})}>Save Changes</button>
          <button onClick={()=>setEditingAlpha(null)} style={btn("transparent",sub,{border:`1px solid ${border}`,padding:"12px 24px"})}>Cancel</button>
        </div>
      </div>
    </main>
  );

  // ---- MAIN DASHBOARD ----

  async function approveSelected(type: "posts" | "alpha") {
    const ids = type === "posts" ? selectedPosts : selectedAlphas;
    if (ids.length === 0) return alert("Select items first.");
    await Promise.all(ids.map(id => updateDoc(doc(db, type === "posts" ? "posts" : "alpha", id), { status: "approved" })));
    if (type === "posts") { setPosts(p => p.map(x => ids.includes(x.id) ? {...x, status:"approved"} : x)); setSelectedPosts([]); }
    else { setAlphas(a => a.map(x => ids.includes(x.id) ? {...x, status:"approved"} : x)); setSelectedAlphas([]); }
    flash("Approved!");
  }

  async function deleteSelected(type: "posts" | "alpha") {
    const ids = type === "posts" ? selectedPosts : selectedAlphas;
    if (ids.length === 0) return alert("Select items first.");
    if (!confirm(`Delete ${ids.length} items?`)) return;
    await Promise.all(ids.map(id => deleteDoc(doc(db, type === "posts" ? "posts" : "alpha", id))));
    if (type === "posts") { setPosts(p => p.filter(x => !ids.includes(x.id))); setSelectedPosts([]); }
    else { setAlphas(a => a.filter(x => !ids.includes(x.id))); setSelectedAlphas([]); }
    flash("Deleted!");
  }

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
    <AdminGuard>
    <main style={{fontFamily:"system-ui,sans-serif",minHeight:"100vh",position:"relative",zIndex:1}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 20px"}}>

        {/* HEADER */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <h1 style={{fontWeight:900,fontSize:20,color:fg}}>Sanctifi3d<span style={{color:"#34d399"}}>Labs</span> Admin</h1>
          <div style={{display:"flex",gap:10}}>
            <button onClick={toggle} style={btn("var(--card)",fg,{border:`1px solid ${border}`})}>{dark?"☀️ Light":"🌙 Dark"}</button>
            <button onClick={()=>{sessionStorage.removeItem("s3d_admin");window.location.reload();}} style={btn("rgba(248,113,113,.15)","#f87171")}>Logout</button>
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

        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><a href="/admin/settings" style={{background:"#1a1a1a",border:"1px solid #2a2a2a",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#9ca3af",textDecoration:"none",fontWeight:600}}>⚙ Settings →</a></div>
        {msg&&<p style={{color:"#34d399",marginBottom:16,fontWeight:600,fontSize:14}}>{msg}</p>}

        {/* POSTS LIST */}
        {tab==="posts"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="checkbox" onChange={e => setSelectedPosts(e.target.checked ? posts.map(p=>p.id) : [])} checked={selectedPosts.length===posts.length && posts.length>0} />
                <span style={{color:sub,fontSize:13}}>{selectedPosts.length > 0 ? `${selectedPosts.length} selected` : "Select all"}</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>approveSelected("posts")} style={{...btn("rgba(52,211,153,.12)","#34d399"),border:"1px solid rgba(52,211,153,.3)",opacity:selectedPosts.length?1:.4}}>✓ Approve Selected</button>
                <button onClick={()=>deleteSelected("posts")} style={{...btn("rgba(248,113,113,.12)","#f87171"),border:"1px solid rgba(248,113,113,.3)",opacity:selectedPosts.length?1:.4}}>🗑 Delete Selected</button>
                <button onClick={()=>bulkApprove("posts")} style={{...btn("rgba(52,211,153,.08)","#34d399"),border:"1px solid rgba(52,211,153,.2)",fontSize:11}}>Approve All</button>
              </div>
            </div>
            {posts.length===0?<p style={{color:sub}}>No posts yet.</p>:posts.map(p=>(
            <div key={p.id} style={{background:cardBg,border:`1px solid ${selectedPosts.includes(p.id)?"rgba(52,211,153,.5)":p.status==="pending"?"rgba(251,191,36,.4)":border}`,borderRadius:12,padding:"14px 18px",marginBottom:10,cursor:"pointer"}} onClick={()=>setSelectedPosts(s=>s.includes(p.id)?s.filter(x=>x!==p.id):[...s,p.id])}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <input type="checkbox" checked={selectedPosts.includes(p.id)} onChange={()=>{}} onClick={e=>e.stopPropagation()} />
                  <span style={{fontSize:11,color:selectedPosts.includes(p.id)?"#34d399":sub}}>{selectedPosts.includes(p.id)?"Selected":""}</span>
                </div>
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
            }
          </div>
        )}

        {/* ALPHA LIST */}
        {tab==="alpha"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="checkbox" onChange={e => setSelectedAlphas(e.target.checked ? alphas.map(a=>a.id) : [])} checked={selectedAlphas.length===alphas.length && alphas.length>0} />
                <span style={{color:sub,fontSize:13}}>{selectedAlphas.length > 0 ? `${selectedAlphas.length} selected` : "Select all"}</span>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>approveSelected("alpha")} style={{...btn("rgba(52,211,153,.12)","#34d399"),border:"1px solid rgba(52,211,153,.3)",opacity:selectedAlphas.length?1:.4}}>✓ Approve Selected</button>
                <button onClick={()=>deleteSelected("alpha")} style={{...btn("rgba(248,113,113,.12)","#f87171"),border:"1px solid rgba(248,113,113,.3)",opacity:selectedAlphas.length?1:.4}}>🗑 Delete Selected</button>
                <button onClick={()=>bulkApprove("alpha")} style={{...btn("rgba(52,211,153,.08)","#34d399"),border:"1px solid rgba(52,211,153,.2)",fontSize:11}}>Approve All</button>
              </div>
            </div>
            {alphas.length===0?<p style={{color:sub}}>No alpha posts yet.</p>:alphas.map(a=>(
            <div key={a.id} style={{background:cardBg,border:`1px solid ${selectedAlphas.includes(a.id)?"rgba(52,211,153,.5)":a.status==="pending"?"rgba(251,191,36,.4)":border}`,borderRadius:12,padding:"14px 18px",marginBottom:10,cursor:"pointer"}} onClick={()=>setSelectedAlphas(s=>s.includes(a.id)?s.filter(x=>x!==a.id):[...s,a.id])}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <input type="checkbox" checked={selectedAlphas.includes(a.id)} onChange={()=>{}} onClick={e=>e.stopPropagation()} />
                  <span style={{fontSize:11,color:selectedAlphas.includes(a.id)?"#34d399":sub}}>{selectedAlphas.includes(a.id)?"Selected":""}</span>
                </div>
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
            }
          </div>
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
        {false&&(
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
        {tab==="userSubmissions"&&(
          <div>
            <h3 style={{fontWeight:800,fontSize:18,color:fg,margin:"0 0 20px"}}>📥 Community Submissions</h3>
            {submissions.length===0?<p style={{color:sub}}>No submissions yet.</p>:submissions.map((s:any)=>(
              <div key={s.id} style={{background:cardBg,border:`1px solid ${s.status==="pending"?"rgba(251,191,36,.3)":border}`,borderRadius:14,padding:"16px 20px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#34d399",textTransform:"uppercase"}}>{s.type}</span>
                      <span style={{fontSize:11,background:s.status==="approved"?"rgba(52,211,153,.1)":s.status==="rejected"?"rgba(248,113,113,.1)":"rgba(251,191,36,.1)",color:s.status==="approved"?"#34d399":s.status==="rejected"?"#f87171":"#fbbf24",borderRadius:999,padding:"2px 10px",fontWeight:700}}>{s.status}</span>
                      <span style={{fontSize:11,color:sub}}>{s.category}</span>
                    </div>
                    <h4 style={{fontSize:15,fontWeight:800,color:fg,margin:"0 0 4px"}}>{s.title}</h4>
                    <p style={{fontSize:12,color:sub,margin:"0 0 6px"}}>by {s.authorName} · {s.date}</p>
                    <p style={{fontSize:13,color:fg,lineHeight:1.6,margin:0}}>{s.content?.slice(0,200)}{s.content?.length>200?"...":""}</p>
                    {s.sourceUrl && <a href={s.sourceUrl} target="_blank" style={{fontSize:12,color:"#38bdf8",marginTop:6,display:"block"}}>🔗 {s.sourceUrl}</a>}
                  </div>
                  {s.status==="pending" && (
                    <div style={{display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
                      <button onClick={()=>approveSubmission(s)} style={{...btn("#34d399","#000"),padding:"8px 16px"}}>✓ Approve</button>
                      <button onClick={()=>{ const note=prompt("Rejection reason (optional):"); rejectSubmission(s.id, note||""); }} style={{...btn("rgba(248,113,113,.12)","#f87171"),border:"1px solid rgba(248,113,113,.3)",padding:"8px 16px"}}>✕ Reject</button>
                    </div>
                  )}
                  {s.status==="approved" && s.publishedId && (
                    <a href={`/post/${s.publishedId}`} style={{fontSize:12,color:"#34d399",fontWeight:700,textDecoration:"none"}}>View →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==="analytics"&&(
          <div>
            {/* Summary Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
              {[
                {label:"Total Views",value:analytics.totalViews,color:"#34d399",icon:"👁"},
                {label:"Total Posts",value:posts.length,color:"#38bdf8",icon:"📝"},
                {label:"Subscribers",value:subscribers.length,color:"#a78bfa",icon:"📧"},
                {label:"Alpha Posts",value:alphas.length,color:"#fbbf24",icon:"⚡"},
              ].map(s=>(
                <div key={s.label} style={{background:cardBg,border:`1px solid ${border}`,borderRadius:12,padding:"16px"}}>
                  <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:24,fontWeight:900,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:11,color:sub,fontWeight:700,letterSpacing:".04em",textTransform:"uppercase",marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top Posts by Views */}
            <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:20,marginBottom:16}}>
              <h3 style={{fontWeight:800,fontSize:16,color:fg,margin:"0 0 16px"}}>🔥 Top Posts by Views</h3>
              {analytics.topPosts.length===0?<p style={{color:sub,fontSize:13}}>No view data yet.</p>:analytics.topPosts.map((p,i)=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                  <span style={{fontSize:18,fontWeight:900,color:sub,minWidth:24}}>#{i+1}</span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:700,color:fg,margin:"0 0 2px"}}>{p.title}</p>
                    <div style={{height:6,background:"rgba(255,255,255,.06)",borderRadius:999,overflow:"hidden",width:"100%"}}>
                      <div style={{height:"100%",background:"#34d399",borderRadius:999,width:`${Math.min(100,Math.round((p.count/(analytics.topPosts[0]?.count||1))*100))}%`,transition:"width .5s"}} />
                    </div>
                  </div>
                  <span style={{fontSize:13,fontWeight:800,color:"#34d399",minWidth:60,textAlign:"right"}}>{p.count} views</span>
                </div>
              ))}
            </div>

            {/* Subscriber Growth */}
            <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:20,marginBottom:16}}>
              <h3 style={{fontWeight:800,fontSize:16,color:fg,margin:"0 0 16px"}}>📈 Subscriber Growth (Last 7 Days)</h3>
              {analytics.subsByDay.length===0?<p style={{color:sub,fontSize:13}}>No subscriber data yet.</p>:(
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
                  {analytics.subsByDay.map((d,i)=>{
                    const max = Math.max(...analytics.subsByDay.map(x=>x.count),1);
                    const h = Math.max(8,Math.round((d.count/max)*72));
                    return (
                      <div key={d.date} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <span style={{fontSize:10,color:"#34d399",fontWeight:700}}>{d.count}</span>
                        <div style={{width:"100%",height:h,background:"#34d399",borderRadius:4,opacity:.8}} />
                        <span style={{fontSize:9,color:sub}}>{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Subscribers */}
            <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:20}}>
              <h3 style={{fontWeight:800,fontSize:16,color:fg,margin:"0 0 16px"}}>👥 Recent Subscribers</h3>
              {analytics.recentSubs.length===0?<p style={{color:sub,fontSize:13}}>No subscribers yet.</p>:analytics.recentSubs.map((s:any,i:number)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${border}`}}>
                  <span style={{fontSize:13,color:fg,fontWeight:600}}>{s.email}</span>
                  <span style={{fontSize:11,color:sub}}>{s.date||s.subscribedAt?.slice(0,10)}</span>
                </div>
              ))}
            </div>

            <div style={{marginTop:16,textAlign:"right"}}>
              <button onClick={fetchAnalytics} style={{...btn("rgba(52,211,153,.1)","#34d399"),border:"1px solid rgba(52,211,153,.3)"}}>↻ Refresh</button>
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
    </AdminGuard>
  );

}
