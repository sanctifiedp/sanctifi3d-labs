"use client";
import AISummary from "../../../components/AISummary";
import ViewTracker from "../../../components/ViewTracker";
import ReadingProgress from "../../../components/ReadingProgress";
import { useEffect, useState, use } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, where, limit } from "firebase/firestore";

const cc: Record<string,string> = { Web3:"#34d399", Crypto:"#fbbf24", Design:"#f472b6", "AI Tools":"#38bdf8" };

export default function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getDoc(doc(db,"posts",id)).then(d => {
      if (d.exists()) { const data = {id:d.id,...d.data()} as any; setPost(data); fetchRelated(data.category,d.id); }
    });
    fetchComments();
  }, [id]);

  async function fetchRelated(category:string, currentId:string) {
    const q = query(collection(db,"posts"),where("category","==",category),where("status","==","approved"),limit(4));
    const snap = await getDocs(q);
    setRelated(snap.docs.filter(d=>d.id!==currentId).slice(0,3).map(d=>({id:d.id,...d.data()})));
  }

  async function fetchComments() {
    const q = query(collection(db,"posts",id,"comments"),orderBy("createdAt","asc"));
    const snap = await getDocs(q);
    setComments(snap.docs.map(d=>({id:d.id,...d.data()})));
  }

  async function submitComment() {
    if (!name.trim()||!comment.trim()) return;
    setSubmitting(true);
    await addDoc(collection(db,"posts",id,"comments"),{ name:name.trim(), comment:comment.trim(), createdAt:new Date().toISOString() });
    setName(""); setComment(""); setSubmitting(false); setSubmitted(true);
    fetchComments(); setTimeout(()=>setSubmitted(false),3000);
  }

  const inp = { width:"100%", background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--fg)", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" } as any;


  useEffect(() => {
    if (post) {
      document.title = post.title + ' | Sanctifi3d Labs';
      const desc = post.content?.replace(/<[^>]+>/g,'').slice(0,155);
      let m = document.querySelector('meta[name=description]');
      if(m) m.setAttribute('content', desc);
      let og = document.querySelector('meta[property="og:title"]');
      if(og) og.setAttribute('content', post.title);
      let ogImg = document.querySelector('meta[property="og:image"]');
      if(ogImg && post.imageUrl) ogImg.setAttribute('content', post.imageUrl);
    }
  }, [post]);

  if (!post) return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, position:"relative" }}>
      <p style={{ color:"var(--sub)" }}>Loading...</p>
    </main>
  );

  return (
    <ReadingProgress />
      <ViewTracker postId={id} />
      <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", position:"relative", zIndex:1 }}>
      <article style={{ maxWidth:760, margin:"0 auto", padding:"80px 24px 60px" }}>
        {post.imageUrl && <img src={post.imageUrl} style={{ width:"100%", height:320, objectFit:"cover", borderRadius:16, marginBottom:32 }} />}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <span style={{ fontSize:11, fontWeight:700, borderRadius:999, padding:"3px 12px", background:(cc[post.category]||"#fff")+"22", color:cc[post.category]||"var(--fg)", textTransform:"uppercase" }}>{post.category}</span>
          {post.type==="ai" && <span style={{ fontSize:11, color:"var(--sub)" }}>✦ AI Generated</span>}
          <span style={{ fontSize:12, color:"var(--sub)" }}>{post.date}</span>
        </div>
        <h1 style={{ fontSize:"clamp(24px,5vw,40px)", fontWeight:900, letterSpacing:"-.02em", lineHeight:1.2, marginBottom:24, color:"var(--fg)" }}>{post.title}</h1>
        <div style={{ fontSize:16, color:"var(--fg)", lineHeight:1.9, marginBottom:40 }} dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.source && (
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:20, marginBottom:24 }}>
            <p style={{ fontSize:13, color:"var(--sub)", marginBottom:6 }}>Source</p>
            <a href={post.source} target="_blank" style={{ fontSize:13, color:"#34d399", wordBreak:"break-all", textDecoration:"none" }}>{post.sourceLabel||post.source}</a>
          </div>
        )}

        <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&via=Sanctifi3d_1`} target="_blank" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 16px", fontSize:13, color:"var(--fg)", textDecoration:"none", display:"inline-block", marginBottom:48 }}>Share on 𝕏</a>

        {/* RELATED */}
        {related.length > 0 && (
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:40, marginBottom:48 }}>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20, color:"var(--fg)" }}>Related Posts</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
              {related.map(r=>(
                <a key={r.id} href={`/post/${r.id}`} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", display:"block", textDecoration:"none", color:"inherit", transition:"transform .2s" }}
                  onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-3px)")}
                  onMouseLeave={e=>(e.currentTarget.style.transform="translateY(0)")}>
                  {r.imageUrl && <img src={r.imageUrl} style={{ width:"100%", height:100, objectFit:"cover" }} />}
                  <div style={{ padding:"12px 14px" }}>
                    <span style={{ fontSize:10, fontWeight:700, color:cc[r.category]||"var(--fg)", textTransform:"uppercase" }}>{r.category}</span>
                    <p style={{ fontSize:13, fontWeight:700, lineHeight:1.4, margin:"6px 0 4px", color:"var(--fg)" }}>{r.title}</p>
                    <span style={{ fontSize:11, color:"var(--sub)" }}>{r.date}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* COMMENTS */}
        <div style={{ borderTop:"1px solid var(--border)", paddingTop:40 }}>
          <h2 style={{ fontSize:20, fontWeight:800, marginBottom:24, color:"var(--fg)" }}>Comments ({comments.length})</h2>
          {comments.length===0 && <p style={{ color:"var(--sub)", marginBottom:32 }}>No comments yet. Be the first!</p>}
          {comments.map(c=>(
            <div key={c.id} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 18px", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000" }}>{c.name[0].toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, margin:0, color:"var(--fg)" }}>{c.name}</p>
                  <p style={{ fontSize:11, color:"var(--sub)", margin:0 }}>{new Date(c.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                </div>
              </div>
              <p style={{ fontSize:14, color:"var(--fg)", lineHeight:1.7, margin:0 }}>{c.comment}</p>
            </div>
          ))}
          <div style={{ marginTop:32, background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
            <h3 style={{ fontWeight:700, fontSize:16, marginBottom:16, color:"var(--fg)" }}>Leave a Comment</h3>
            {submitted && <p style={{ color:"#34d399", fontSize:13, marginBottom:12 }}>Comment posted!</p>}
            <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} style={{ ...inp, marginBottom:10 }} />
            <textarea placeholder="Write your comment..." value={comment} onChange={e=>setComment(e.target.value)} rows={4} style={{ ...inp, resize:"vertical", marginBottom:14 }} />
            <button onClick={submitComment} disabled={submitting} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"10px 24px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {submitting?"Posting...":"Post Comment"}
            </button>
          </div>
        </div>
      </article>
    </main>
  );
}
