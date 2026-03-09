"use client";
import { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTheme } from "../../lib/ThemeContext";
import RichEditor from "../../components/RichEditor";
import FloatingShapes from "../../components/FloatingShapes";

const ADMINS = ["adeyigbeminiyi414@gmail.com","adeyigbeminiy414@gmail.com"];

export default function Admin() {
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [alphas, setAlphas] = useState<any[]>([]);
  const [tab, setTab] = useState<"posts"|"alpha"|"create"|"create-alpha">("posts");
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [category, setCategory] = useState("Web3"); const [coverUrl, setCoverUrl] = useState("");
  const [alphaTitle, setAlphaTitle] = useState(""); const [alphaContent, setAlphaContent] = useState("");
  const [alphaType, setAlphaType] = useState("Airdrop"); const [alphaAudience, setAlphaAudience] = useState("Crypto");
  const [alphaSource, setAlphaSource] = useState(""); const [alphaCover, setAlphaCover] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const alphaFileRef = useRef<HTMLInputElement>(null);

  const fg = dark?"#fff":"#111";
  const sub = dark?"rgba(255,255,255,.4)":"#666";
  const cardBg = dark?"rgba(255,255,255,.02)":"rgba(255,255,255,.9)";
  const border = dark?"rgba(255,255,255,.08)":"#e0e0e0";
  const inp = { width:"100%", background:dark?"rgba(255,255,255,.05)":"#fff", border:`1px solid ${border}`, borderRadius:8, padding:"10px 14px", color:fg, fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" } as any;
  const btn = (bg2:string, col:string) => ({ background:bg2, color:col, border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" } as any);

  useEffect(() => { auth.onAuthStateChanged(u => { if(u&&ADMINS.includes(u.email||"")) setUser(u); }); },[]);
  useEffect(() => { if(user){ fetchPosts(); fetchAlphas(); } },[user]);

  async function fetchPosts() {
    const snap = await getDocs(query(collection(db,"posts"),orderBy("createdAt","desc")));
    setPosts(snap.docs.map(d=>({id:d.id,...d.data()})));
  }
  async function fetchAlphas() {
    const snap = await getDocs(query(collection(db,"alpha"),orderBy("createdAt","desc")));
    setAlphas(snap.docs.map(d=>({id:d.id,...d.data()})));
  }
  async function login() {
    try { const u = await signInWithEmailAndPassword(auth,email,pass); setUser(u.user); }
    catch(e:any) { setMsg(e.message); }
  }
  async function approve(id:string,col:string) {
    await updateDoc(doc(db,col,id),{status:"approved"});
    col==="posts"?fetchPosts():fetchAlphas();
  }
  async function remove(id:string,col:string) {
    if(!confirm("Delete?")) return;
    await deleteDoc(doc(db,col,id));
    col==="posts"?fetchPosts():fetchAlphas();
  }
  async function uploadImg(file:File,set:(u:string)=>void) {
    setUploading(true);
    const r = ref(storage,`covers/${Date.now()}_${file.name}`);
    await uploadBytes(r,file);
    set(await getDownloadURL(r));
    setUploading(false);
  }
  async function createPost() {
    if(!title||!content){setMsg("Title and content required");return;}
    await addDoc(collection(db,"posts"),{title,content,category,imageUrl:coverUrl,type:"manual",status:"approved",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),createdAt:new Date().toISOString()});
    setTitle("");setContent("");setCoverUrl("");setMsg("Post published!");
    fetchPosts();setTab("posts");setTimeout(()=>setMsg(""),3000);
  }
  async function createAlpha() {
    if(!alphaTitle||!alphaContent){setMsg("Title and content required");return;}
    await addDoc(collection(db,"alpha"),{title:alphaTitle,content:alphaContent,type:alphaType,audience:alphaAudience,sourceUrl:alphaSource,imageUrl:alphaCover,status:"approved",date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"}),createdAt:new Date().toISOString()});
    setAlphaTitle("");setAlphaContent("");setAlphaSource("");setAlphaCover("");setMsg("Alpha published!");
    fetchAlphas();setTab("alpha");setTimeout(()=>setMsg(""),3000);
  }

  if(!user) return (
    <main style={{fontFamily:"system-ui,sans-serif",background:dark?"#080808":"#f0f0f0",color:fg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <FloatingShapes />
      <div style={{width:"100%",maxWidth:360,padding:24,position:"relative",zIndex:1,background:cardBg,borderRadius:16,border:`1px solid ${border}`}}>
        <h2 style={{fontWeight:800,fontSize:22,marginBottom:24}}>Admin Login</h2>
        {msg&&<p style={{color:"#f87171",fontSize:13,marginBottom:12}}>{msg}</p>}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
        <input placeholder="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={inp}/>
        <button onClick={login} style={{...btn("#34d399","#000"),width:"100%",padding:11}}>Login</button>
      </div>
    </main>
  );

  const pendingPosts=posts.filter(p=>p.status==="pending");
  const pendingAlphas=alphas.filter(a=>a.status==="pending");

  return (
    <main style={{fontFamily:"system-ui,sans-serif",background:dark?"#080808":"#f0f0f0",color:fg,minHeight:"100vh",position:"relative"}}>
      <FloatingShapes />
      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 20px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,flexWrap:"wrap",gap:12}}>
          <h1 style={{fontWeight:900,fontSize:20}}>Sanctifi3d<span style={{color:"#34d399"}}>Labs</span> Admin</h1>
          <div style={{display:"flex",gap:10}}>
            <button onClick={toggle} style={btn(dark?"rgba(255,255,255,.08)":"rgba(0,0,0,.07)",fg)}>{dark?"☀️ Light":"🌙 Dark"}</button>
            <button onClick={()=>signOut(auth).then(()=>setUser(null))} style={btn("rgba(248,113,113,.15)","#f87171")}>Logout</button>
          </div>
        </div>

        {/* STATS */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:28}}>
          {[["Posts",posts.length,"#34d399"],["Pending",pendingPosts.length,"#fbbf24"],["Alphas",alphas.length,"#38bdf8"],["Pending Alpha",pendingAlphas.length,"#f472b6"]].map(([l,v,c])=>(
            <div key={l as string} style={{background:cardBg,border:`1px solid ${border}`,borderRadius:12,padding:"14px 16px",backdropFilter:"blur(8px)"}}>
              <p style={{fontSize:22,fontWeight:800,color:c as string,margin:"0 0 4px"}}>{v}</p>
              <p style={{fontSize:12,color:sub,margin:0}}>{l}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          {([["posts","📰 Posts"],["alpha","⚡ Alpha"],["create","✍️ Write Post"],["create-alpha","🎯 Write Alpha"]] as const).map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{...btn(tab===t?"#34d399":"transparent",tab===t?"#000":sub),border:`1px solid ${border}`}}>
              {label}{t==="posts"&&pendingPosts.length>0?` (${pendingPosts.length})`:t==="alpha"&&pendingAlphas.length>0?` (${pendingAlphas.length})`:""}
            </button>
          ))}
        </div>

        {msg&&<p style={{color:"#34d399",marginBottom:16}}>{msg}</p>}

        {/* POSTS LIST */}
        {tab==="posts"&&posts.map(p=>(
          <div key={p.id} style={{background:cardBg,border:`1px solid ${p.status==="pending"?"rgba(251,191,36,.35)":border}`,borderRadius:12,padding:"14px 18px",marginBottom:10,backdropFilter:"blur(8px)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:sub,background:dark?"rgba(255,255,255,.06)":"#eee",borderRadius:4,padding:"2px 8px"}}>{p.category}</span>
                  <span style={{fontSize:11,color:p.status==="pending"?"#fbbf24":"#34d399"}}>● {p.status}</span>
                  {p.type==="ai"&&<span style={{fontSize:11,color:sub}}>✦ AI</span>}
                </div>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px"}}>{p.title}</p>
                <p style={{fontSize:12,color:sub,margin:0}}>{p.date}</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                {p.status==="pending"&&<button onClick={()=>approve(p.id,"posts")} style={btn("#34d399","#000")}>Approve</button>}
                <button onClick={()=>remove(p.id,"posts")} style={btn("rgba(248,113,113,.15)","#f87171")}>Delete</button>
              </div>
            </div>
          </div>
        ))}

        {/* ALPHA LIST */}
        {tab==="alpha"&&alphas.map(a=>(
          <div key={a.id} style={{background:cardBg,border:`1px solid ${a.status==="pending"?"rgba(251,191,36,.35)":border}`,borderRadius:12,padding:"14px 18px",marginBottom:10,backdropFilter:"blur(8px)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:sub,background:dark?"rgba(255,255,255,.06)":"#eee",borderRadius:4,padding:"2px 8px"}}>{a.type}</span>
                  <span style={{fontSize:11,color:sub,background:dark?"rgba(255,255,255,.06)":"#eee",borderRadius:4,padding:"2px 8px"}}>{a.audience}</span>
                  <span style={{fontSize:11,color:a.status==="pending"?"#fbbf24":"#34d399"}}>● {a.status}</span>
                </div>
                <p style={{fontWeight:700,fontSize:14,margin:"0 0 4px"}}>{a.title}</p>
                <p style={{fontSize:12,color:sub,margin:"0 0 4px"}}>{a.content?.replace(/<[^>]+>/g,"").slice(0,100)}...</p>
                {a.sourceUrl&&<a href={a.sourceUrl} target="_blank" style={{fontSize:12,color:"#34d399"}}>{a.sourceUrl}</a>}
              </div>
              <div style={{display:"flex",gap:8}}>
                {a.status==="pending"&&<button onClick={()=>approve(a.id,"alpha")} style={btn("#34d399","#000")}>Approve</button>}
                <button onClick={()=>remove(a.id,"alpha")} style={btn("rgba(248,113,113,.15)","#f87171")}>Delete</button>
              </div>
            </div>
          </div>
        ))}

        {/* CREATE POST */}
        {tab==="create"&&(
          <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:24,backdropFilter:"blur(8px)"}}>
            <h3 style={{fontWeight:800,fontSize:16,marginBottom:18}}>✍️ Write New Post</h3>
            <input placeholder="Post title" value={title} onChange={e=>setTitle(e.target.value)} style={inp}/>
            <select value={category} onChange={e=>setCategory(e.target.value)} style={{...inp}}>
              {["Web3","Crypto","Design","AI Tools"].map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{marginBottom:14}}>
              <p style={{fontSize:13,color:sub,marginBottom:8}}>Cover Image</p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <button onClick={()=>fileRef.current?.click()} style={btn(dark?"rgba(255,255,255,.08)":"#eee",fg)}>{uploading?"Uploading...":"📁 Upload"}</button>
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&uploadImg(e.target.files[0],setCoverUrl)}/>
                <input placeholder="Or paste URL" value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} style={{...inp,margin:0,flex:1}}/>
              </div>
              {coverUrl&&<img src={coverUrl} style={{marginTop:10,width:"100%",height:150,objectFit:"cover",borderRadius:8}}/>}
            </div>
            <p style={{fontSize:13,color:sub,marginBottom:8}}>Content</p>
            <RichEditor value={content} onChange={setContent} dark={dark}/>
            <button onClick={createPost} style={{...btn("#34d399","#000"),marginTop:20,padding:"12px 32px"}}>Publish Post</button>
          </div>
        )}

        {/* CREATE ALPHA */}
        {tab==="create-alpha"&&(
          <div style={{background:cardBg,border:`1px solid ${border}`,borderRadius:14,padding:24,backdropFilter:"blur(8px)"}}>
            <h3 style={{fontWeight:800,fontSize:16,marginBottom:18}}>🎯 Write Alpha Post</h3>
            <input placeholder="Title e.g. 'Airdrop: Claim 500 USDT from XYZ Protocol'" value={alphaTitle} onChange={e=>setAlphaTitle(e.target.value)} style={inp}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <select value={alphaType} onChange={e=>setAlphaType(e.target.value)} style={{...inp,margin:0}}>
                {["Airdrop","Bounty","Contest","Presale","Grant","Hackathon","Gig"].map(t=><option key={t}>{t}</option>)}
              </select>
              <select value={alphaAudience} onChange={e=>setAlphaAudience(e.target.value)} style={{...inp,margin:0}}>
                {["Crypto","Web3","Graphic Design","AI Tools"].map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
            <input placeholder="Source URL (link to participate)" value={alphaSource} onChange={e=>setAlphaSource(e.target.value)} style={inp}/>
            <div style={{marginBottom:14}}>
              <p style={{fontSize:13,color:sub,marginBottom:8}}>Cover Image</p>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <button onClick={()=>alphaFileRef.current?.click()} style={btn(dark?"rgba(255,255,255,.08)":"#eee",fg)}>{uploading?"Uploading...":"📁 Upload"}</button>
                <input ref={alphaFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files?.[0]&&uploadImg(e.target.files[0],setAlphaCover)}/>
                <input placeholder="Or paste URL" value={alphaCover} onChange={e=>setAlphaCover(e.target.value)} style={{...inp,margin:0,flex:1}}/>
              </div>
              {alphaCover&&<img src={alphaCover} style={{marginTop:10,width:"100%",height:150,objectFit:"cover",borderRadius:8}}/>}
            </div>
            <p style={{fontSize:13,color:sub,marginBottom:8}}>Details (what it is, how to join, rewards, deadline)</p>
            <RichEditor value={alphaContent} onChange={setAlphaContent} dark={dark}/>
            <button onClick={createAlpha} style={{...btn("#fbbf24","#000"),marginTop:20,padding:"12px 32px"}}>Publish Alpha</button>
          </div>
        )}
      </div>
    </main>
  );
}
