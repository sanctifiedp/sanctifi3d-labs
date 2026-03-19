"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy, onSnapshot, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../../components/AuthProvider";

const CATEGORIES = ["All", "Official", "Web3", "Crypto", "Design", "AI", "Alpha", "General"];

const OFFICIAL_ROOMS = [
  { id:"web3-general", name:"Web3 General", description:"Everything Web3 — protocols, trends, news", icon:"🌐", category:"Web3", isOfficial:true },
  { id:"crypto-talk", name:"Crypto Talk", description:"Price action, analysis, market discussion", icon:"💰", category:"Crypto", isOfficial:true },
  { id:"design-space", name:"Design Space", description:"UI/UX, branding, Web3 design", icon:"🎨", category:"Design", isOfficial:true },
  { id:"ai-tools", name:"AI Tools", description:"AI apps, prompts, workflows", icon:"🤖", category:"AI", isOfficial:true },
  { id:"alpha-calls", name:"Alpha Calls", description:"Airdrops, bounties, grants — hot alpha only", icon:"⚡", category:"Alpha", isOfficial:true },
  { id:"introductions", name:"Introductions", description:"New here? Say hi and introduce yourself", icon:"👋", category:"General", isOfficial:true },
];

export default function Rooms() {
  const { user, signIn } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("General");
  const [newIcon, setNewIcon] = useState("💬");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed official rooms if not exist
    seedOfficialRooms();
    // Listen to all rooms
    const unsub = onSnapshot(
      query(collection(db, "rooms"), orderBy("lastMessageAt", "desc")),
      snap => {
        setRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  async function seedOfficialRooms() {
    for (const room of OFFICIAL_ROOMS) {
      const snap = await getDoc(doc(db, "rooms", room.id));
      if (!snap.exists()) {
        await updateDoc(doc(db, "rooms", room.id), {}).catch(async () => {
          const { setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "rooms", room.id), {
            ...room,
            createdBy: "admin",
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
            lastMessage: "Room created",
            memberCount: 0,
            messageCount: 0,
            isOpen: true,
          });
        });
      }
    }
  }

  async function createRoom() {
    if (!newName.trim() || !user) return;
    await addDoc(collection(db, "rooms"), {
      name: newName.trim(),
      description: newDesc.trim(),
      category: newCat,
      icon: newIcon,
      isOfficial: false,
      isOpen: true,
      createdBy: user.uid,
      createdByName: user.displayName || user.email,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      lastMessage: "Room created",
      memberCount: 0,
      messageCount: 0,
    });
    setCreating(false);
    setNewName(""); setNewDesc("");
  }

  const EMOJIS = ["💬","🔥","⚡","🌐","💰","🎨","🤖","👋","🚀","💎","🌍","🎯"];

  const filtered = rooms.filter(r =>
    (cat === "All" || (cat === "Official" ? r.isOfficial : r.category === cat)) &&
    (!search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"100px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:16 }}>
          <div>
            <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:900, color:"var(--fg)", margin:"0 0 8px", letterSpacing:"-.02em" }}>
              💬 Community Rooms
            </h1>
            <p style={{ color:"var(--sub)", fontSize:15, margin:0 }}>Real-time discussions. Join a room and connect with the community.</p>
          </div>
          {user ? (
            <button onClick={() => setCreating(true)} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:12, padding:"12px 24px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
              + Create Room
            </button>
          ) : (
            <button onClick={signIn} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:12, padding:"12px 24px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              Sign in to Chat
            </button>
          )}
        </div>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search rooms..."
          style={{ width:"100%", background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"11px 18px", fontSize:14, color:"var(--fg)", fontFamily:"inherit", outline:"none", marginBottom:16, boxSizing:"border-box" as any }} />

        {/* Category filters */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ background:cat===c?"#34d399":"var(--card)", color:cat===c?"#000":"var(--sub)", border:`1px solid ${cat===c?"#34d399":"var(--border)"}`, borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
              {c}
            </button>
          ))}
        </div>

        {/* Rooms grid */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {[...Array(6)].map((_,i) => (
              <div key={i} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, height:140, opacity:.4 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color:"var(--sub)", textAlign:"center", padding:"40px 0" }}>No rooms found.</p>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {filtered.map(r => (
              <a key={r.id} href={`/rooms/${r.id}`} style={{ background:"var(--card)", border:`1px solid ${r.isOfficial?"rgba(52,211,153,.2)":"var(--border)"}`, borderRadius:16, padding:"20px", textDecoration:"none", color:"inherit", display:"block", transition:"all .2s", position:"relative" as any }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor="#34d399"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor=r.isOfficial?"rgba(52,211,153,.2)":"var(--border)"; }}>
                {r.isOfficial && (
                  <div style={{ position:"absolute", top:12, right:12, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.2)", borderRadius:999, padding:"2px 8px", fontSize:10, color:"#34d399", fontWeight:700 }}>OFFICIAL</div>
                )}
                <div style={{ fontSize:32, marginBottom:12 }}>{r.icon || "💬"}</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:"var(--fg)", margin:"0 0 6px" }}>{r.name}</h3>
                <p style={{ fontSize:13, color:"var(--sub)", margin:"0 0 14px", lineHeight:1.6 }}>{r.description}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:11, fontWeight:700, background:`rgba(52,211,153,.08)`, borderRadius:999, padding:"3px 10px", color:"#34d399" }}>{r.category}</span>
                  <div style={{ display:"flex", gap:10, fontSize:11, color:"var(--sub)" }}>
                    <span>💬 {r.messageCount || 0}</span>
                  </div>
                </div>
                {r.lastMessage && (
                  <p style={{ fontSize:11, color:"var(--sub)", margin:"10px 0 0", borderTop:"1px solid var(--border)", paddingTop:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {r.lastMessage}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Create room modal */}
        {creating && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e => e.target===e.currentTarget&&setCreating(false)}>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, padding:28, width:"100%", maxWidth:480 }}>
              <h2 style={{ fontWeight:900, fontSize:20, color:"var(--fg)", margin:"0 0 20px" }}>Create a Room</h2>

              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--sub)", marginBottom:6, textTransform:"uppercase", letterSpacing:".05em" }}>Room Icon</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setNewIcon(e)} style={{ background:newIcon===e?"rgba(52,211,153,.15)":"transparent", border:newIcon===e?"1px solid rgba(52,211,153,.4)":"1px solid var(--border)", borderRadius:8, padding:"6px 10px", fontSize:18, cursor:"pointer" }}>{e}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--sub)", marginBottom:6, textTransform:"uppercase", letterSpacing:".05em" }}>Room Name *</label>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Nigeria Web3 Builders" maxLength={40}
                  style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", fontSize:14, color:"var(--fg)", fontFamily:"inherit", outline:"none", boxSizing:"border-box" as any }} />
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--sub)", marginBottom:6, textTransform:"uppercase", letterSpacing:".05em" }}>Description</label>
                <input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="What's this room about?" maxLength={100}
                  style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", fontSize:14, color:"var(--fg)", fontFamily:"inherit", outline:"none", boxSizing:"border-box" as any }} />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--sub)", marginBottom:6, textTransform:"uppercase", letterSpacing:".05em" }}>Category</label>
                <select value={newCat} onChange={e=>setNewCat(e.target.value)}
                  style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", fontSize:14, color:"var(--fg)", fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                  {["Web3","Crypto","Design","AI","Alpha","General"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={createRoom} disabled={!newName.trim()} style={{ flex:1, background:newName.trim()?"#34d399":"rgba(52,211,153,.3)", color:"#000", border:"none", borderRadius:10, padding:"12px", fontSize:14, fontWeight:800, cursor:newName.trim()?"pointer":"not-allowed", fontFamily:"inherit" }}>
                  Create Room
                </button>
                <button onClick={()=>setCreating(false)} style={{ background:"transparent", color:"var(--sub)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 20px", fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
