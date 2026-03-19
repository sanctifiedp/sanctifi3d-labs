"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";
import SiteLogo from "./SiteLogo";
import { useAuth } from "./AuthProvider";
import NotificationBell from "./NotificationBell";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [subbing, setSubbing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false);
      if (subRef.current && !subRef.current.contains(e.target as Node)) setSubOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setSearchOpen(false); setSearch(""); }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === "Enter" && search.trim()) {
      window.location.href = "/?search=" + encodeURIComponent(search.trim());
      setSearchOpen(false); setSearch("");
    }
    if (e.key === "Escape") { setSearchOpen(false); setSearch(""); }
  }

  async function subscribe() {
    if (!email.includes("@")) return;
    setSubbing(true);
    try {
      await fetch("/api/subscribe", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email }) });
      await addDoc(collection(db,"subscribers"), { email, subscribedAt:new Date().toISOString(), date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) });
      setSubDone(true);
    } catch(e) { console.error(e); }
    setSubbing(false);
  }

  const links = [
    { label:"Home", href:"/" },
    { label:"⚡ Alpha", href:"/alpha" },
    { label:"💬 Rooms", href:"/rooms" },
    { label:"🔖 Saved", href:"/bookmarks" },
    { label:"About", href:"/about" },
  ];

  const iconBtn = (active = false): React.CSSProperties => ({
    background: active ? "rgba(52,211,153,.12)" : "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 8,
    padding: "6px 9px",
    cursor: "pointer",
    fontSize: 14,
    color: active ? "#34d399" : "rgba(255,255,255,.65)",
    fontFamily: "inherit",
    lineHeight: 1,
    transition: "all .15s",
  });

  return (
    <>
      {/* Outer wrapper — full width, centered */}
      <div style={{
        position: "fixed",
        top: 42,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: "0 24px",
        pointerEvents: "none",
      }}>
        {/* Pill */}
        <nav style={{
          pointerEvents: "all",
          width: "100%",
          maxWidth: 960,
          height: 52,
          background: scrolled ? "rgba(8,8,8,.95)" : "rgba(8,8,8,.8)",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 999,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(52,211,153,.06)" : "0 4px 20px rgba(0,0,0,.3)",
          display: "flex",
          alignItems: "center",
          padding: "0 8px 0 16px",
          gap: 4,
          transition: "all .3s ease",
        }}>

          {/* Logo — left */}
          <a href="/" style={{ textDecoration:"none", flexShrink:0, marginRight:8 }}>
            <SiteLogo />
          </a>

          {/* Nav links — center, desktop only */}
          <div style={{ display:"flex", alignItems:"center", gap:1, flex:1 }} className="desk-links">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{
                color: "rgba(255,255,255,.55)",
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 999,
                textDecoration: "none",
                transition: "all .15s",
                whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.color="rgba(255,255,255,.55)"; e.currentTarget.style.background="transparent"; }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>

            {/* Search */}
            <div ref={searchRef} style={{ position:"relative" }}>
              {searchOpen ? (
                <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={handleSearch}
                  placeholder="Search..." style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:999, padding:"6px 14px", fontSize:13, color:"#fff", outline:"none", width:180, fontFamily:"inherit" }} />
              ) : (
                <button onClick={()=>setSearchOpen(true)} style={iconBtn()} title="Search">🔍</button>
              )}
            </div>

            {/* Theme */}
            <button onClick={toggle} style={iconBtn()} title="Toggle theme">
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Subscribe */}
            <div ref={subRef} style={{ position:"relative" }} className="desk-links">
              <button onClick={()=>setSubOpen(o=>!o)} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:999, padding:"7px 16px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                Subscribe
              </button>
              {subOpen && (
                <div style={{ position:"absolute", top:46, right:0, background:"#111", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:20, width:280, boxShadow:"0 16px 48px rgba(0,0,0,.6)", zIndex:200 }}>
                  {subDone ? (
                    <p style={{ color:"#34d399", fontWeight:700, fontSize:15, margin:0, textAlign:"center" }}>🎉 Subscribed!</p>
                  ) : (
                    <>
                      <p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:"0 0 4px" }}>Stay ahead</p>
                      <p style={{ color:"#6b7280", fontSize:12, margin:"0 0 14px" }}>Weekly Web3, Crypto & AI updates.</p>
                      <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&subscribe()}
                        style={{ width:"100%", background:"#0a0a0a", border:"1px solid #2a2a2a", borderRadius:8, padding:"9px 12px", fontSize:13, color:"#fff", fontFamily:"inherit", outline:"none", boxSizing:"border-box" as any, marginBottom:10 }} />
                      <button onClick={subscribe} disabled={subbing} style={{ width:"100%", background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"10px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                        {subbing ? "..." : "Subscribe →"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* User */}
            <div ref={userMenuRef} style={{ position:"relative" }}>
              {user ? (
                <>
                  <button onClick={()=>setUserMenu(o=>!o)} style={{ background:"none", border:"2px solid rgba(52,211,153,.4)", borderRadius:"50%", padding:0, cursor:"pointer", width:32, height:32, overflow:"hidden", flexShrink:0, transition:"border-color .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#34d399"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(52,211,153,.4)"}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    ) : (
                      <div style={{ width:"100%", height:"100%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>
                        {(user.displayName||user.email||"U")[0].toUpperCase()}
                      </div>
                    )}
                  </button>
                  {userMenu && (
                    <div style={{ position:"absolute", top:42, right:0, background:"#111", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:8, width:220, boxShadow:"0 16px 48px rgba(0,0,0,.6)", zIndex:200 }}>
                      <div style={{ padding:"10px 12px", borderBottom:"1px solid #1f1f1f", marginBottom:4 }}>
                        <p style={{ fontSize:13, fontWeight:800, color:"#fff", margin:"0 0 2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.displayName || "User"}</p>
                        <p style={{ fontSize:11, color:"#6b7280", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</p>
                      </div>
                      {[
                        { label:"👤 My Profile", href:"/profile" },
                        { label:"✍️ Submit Content", href:"/submit" },
                        { label:"🔖 Bookmarks", href:"/bookmarks" },
                        { label:"⚙️ Settings", href:"/settings" },
                      ].map(item => (
                        <a key={item.href} href={item.href} onClick={()=>setUserMenu(false)}
                          style={{ display:"block", padding:"9px 12px", fontSize:13, color:"#fff", textDecoration:"none", borderRadius:8, fontWeight:600, transition:"background .15s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          {item.label}
                        </a>
                      ))}
                      <div style={{ borderTop:"1px solid #1f1f1f", marginTop:4, paddingTop:4 }}>
                        <button onClick={()=>{signOut();setUserMenu(false);}}
                          style={{ display:"block", width:"100%", padding:"9px 12px", fontSize:13, color:"#f87171", textAlign:"left", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, borderRadius:8, transition:"background .15s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,.08)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={signIn} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.1)", borderRadius:999, padding:"7px 14px", fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={()=>setOpen(o=>!o)} className="mob-btn" style={{ display:"none", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:999, padding:"6px 11px", cursor:"pointer", fontSize:16, color:"#fff", lineHeight:1 }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown — outside pill, below it */}
        {open && (
          <div style={{
            position:"absolute", top:60, left:24, right:24,
            background:"rgba(8,8,8,.97)", border:"1px solid rgba(255,255,255,.09)",
            borderRadius:20, padding:"12px 20px 20px",
            backdropFilter:"blur(24px)", pointerEvents:"all",
            boxShadow:"0 16px 48px rgba(0,0,0,.6)"
          }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={()=>setOpen(false)}
                style={{ display:"block", color:"#fff", fontSize:15, fontWeight:600, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,.06)", textDecoration:"none" }}>
                {l.label}
              </a>
            ))}
            <div style={{ marginTop:14, display:"flex", gap:8 }}>
              <input type="email" placeholder="Subscribe..." value={email} onChange={e=>setEmail(e.target.value)}
                style={{ flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", fontSize:13, color:"#fff", fontFamily:"inherit", outline:"none" }} />
              <button onClick={subscribe} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13, fontWeight:800, cursor:"pointer" }}>
                {subDone ? "✓" : "→"}
              </button>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <button onClick={toggle} style={{ flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px", fontSize:13, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
              {user ? (
                <a href="/profile" style={{ flex:1, background:"#34d399", color:"#000", borderRadius:8, padding:"9px", fontSize:13, fontWeight:800, textDecoration:"none", textAlign:"center" as any }}>
                  My Profile
                </a>
              ) : (
                <button onClick={signIn} style={{ flex:1, background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"9px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desk-links { display: none !important; }
          .mob-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
