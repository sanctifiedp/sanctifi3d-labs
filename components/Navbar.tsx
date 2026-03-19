"use client";
import NotificationBell from "./NotificationBell";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";
import SiteLogo from "./SiteLogo";
import { useAuth } from "./AuthProvider";
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

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false);
      if (subRef.current && !subRef.current.contains(e.target as Node)) setSubOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === "Enter" && search.trim()) {
      window.location.href = "/?search=" + encodeURIComponent(search.trim());
      setSearchOpen(false);
      setSearch("");
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

  const navStyle: React.CSSProperties = {
    position:"fixed", top:32, left:0, right:0, zIndex:100,
    height:52,
    background: scrolled ? "var(--nav)" : "var(--nav)",
    borderBottom:"1px solid var(--border)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
  };

  const btnStyle = (active=false): React.CSSProperties => ({
    background: active ? "rgba(52,211,153,.12)" : "transparent",
    border: "none",
    borderRadius:8, padding:"6px 10px",
    cursor:"pointer", fontSize:14,
    color: active ? "#34d399" : "var(--sub)",
    fontFamily:"inherit", lineHeight:1,
    transition:"all .15s",
  });

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:"100%", display:"flex", alignItems:"center", gap:8 }}>

          {/* Logo — always visible */}
          <a href="/" style={{ textDecoration:"none", flexShrink:0, marginRight:8 }}>
            <SiteLogo />
          </a>

          {/* Desktop nav links */}
          <div style={{ display:"flex", alignItems:"center", gap:2, flex:1 }} className="desk-nav">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{ color:"var(--sub)", fontSize:13, fontWeight:600, padding:"6px 12px", borderRadius:8, textDecoration:"none", transition:"all .15s", whiteSpace:"nowrap" }}
                onMouseEnter={e => { e.currentTarget.style.color="var(--fg)"; e.currentTarget.style.background="rgba(255,255,255,.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.color="var(--sub)"; e.currentTarget.style.background="transparent"; }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side actions */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>

            {/* Search */}
            {searchOpen ? (
              <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={handleSearch}
                placeholder="Search posts..." style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 14px", fontSize:13, color:"var(--fg)", outline:"none", width:200, fontFamily:"inherit" }} />
            ) : (
              <button onClick={()=>setSearchOpen(true)} style={btnStyle()} title="Search">🔍</button>
            )}

            {/* Theme toggle */}
            <button onClick={toggle} style={btnStyle()} title="Toggle theme">
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Subscribe */}
            <div style={{ position:"relative" }} ref={subRef}>
              <button onClick={()=>setSubOpen(o=>!o)} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"7px 16px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }} className="desk-nav">
                Subscribe
              </button>

              {subOpen && (
                <div style={{ position:"absolute", top:44, right:0, background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:20, width:280, boxShadow:"0 16px 48px rgba(0,0,0,.4)", zIndex:200 }}>
                  {subDone ? (
                    <p style={{ color:"#34d399", fontWeight:700, fontSize:15, margin:0, textAlign:"center" }}>🎉 You're subscribed!</p>
                  ) : (
                    <>
                      <p style={{ color:"var(--fg)", fontWeight:800, fontSize:15, margin:"0 0 4px" }}>Stay ahead</p>
                      <p style={{ color:"var(--sub)", fontSize:12, margin:"0 0 14px" }}>Weekly Web3, Crypto & AI updates.</p>
                      <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&subscribe()}
                        style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", fontSize:13, color:"var(--fg)", fontFamily:"inherit", outline:"none", boxSizing:"border-box", marginBottom:10 }} />
                      <button onClick={subscribe} disabled={subbing} style={{ width:"100%", background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"10px", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                        {subbing ? "..." : "Subscribe →"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* User avatar / sign in */}
            <div style={{ position:"relative" }} ref={userMenuRef}>
              {user ? (
                <>
                  <button onClick={()=>setUserMenu(o=>!o)} style={{ background:"none", border:"2px solid var(--border)", borderRadius:"50%", padding:0, cursor:"pointer", width:34, height:34, overflow:"hidden", flexShrink:0 }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    ) : (
                      <div style={{ width:"100%", height:"100%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#000" }}>
                        {(user.displayName||user.email||"U")[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {userMenu && (
                    <div style={{ position:"absolute", top:42, right:0, background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:8, width:220, boxShadow:"0 16px 48px rgba(0,0,0,.4)", zIndex:200 }}>
                      <div style={{ padding:"10px 12px 10px", borderBottom:"1px solid var(--border)", marginBottom:4 }}>
                        <p style={{ fontSize:13, fontWeight:800, color:"var(--fg)", margin:"0 0 2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.displayName || "User"}</p>
                        <p style={{ fontSize:11, color:"var(--sub)", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</p>
                      </div>
                      {[
                        { label:"👤 My Profile", href:"/profile" },
                        { label:"✍️ Submit Content", href:"/submit" },
                        { label:"🔖 Bookmarks", href:"/bookmarks" },
                        { label:"⚙️ Settings", href:"/settings" },
                      ].map(item => (
                        <a key={item.href} href={item.href} onClick={()=>setUserMenu(false)} style={{ display:"block", padding:"9px 12px", fontSize:13, color:"var(--fg)", textDecoration:"none", borderRadius:8, fontWeight:600, transition:"all .15s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          {item.label}
                        </a>
                      ))}
                      <div style={{ borderTop:"1px solid var(--border)", marginTop:4, paddingTop:4 }}>
                        <button onClick={()=>{signOut();setUserMenu(false);}} style={{ display:"block", width:"100%", padding:"9px 12px", fontSize:13, color:"#f87171", textAlign:"left", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, borderRadius:8 }}
                          onMouseEnter={e=>(e.currentTarget.style.background="rgba(248,113,113,.08)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={signIn} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:700, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit" }}>
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={()=>setOpen(o=>!o)} className="mob-btn" style={{ display:"none", background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 11px", cursor:"pointer", fontSize:16, color:"var(--fg)", lineHeight:1 }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background:"var(--nav)", borderTop:"1px solid var(--border)", padding:"8px 20px 16px", backdropFilter:"blur(20px)" }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={()=>setOpen(false)} style={{ display:"block", color:"var(--fg)", fontSize:15, fontWeight:600, padding:"12px 0", borderBottom:"1px solid var(--border)", textDecoration:"none" }}>
                {l.label}
              </a>
            ))}
            <div style={{ marginTop:12, display:"flex", gap:8 }}>
              <input type="email" placeholder="Subscribe..." value={email} onChange={e=>setEmail(e.target.value)}
                style={{ flex:1, background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", fontSize:13, color:"var(--fg)", fontFamily:"inherit", outline:"none" }} />
              <button onClick={subscribe} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13, fontWeight:800, cursor:"pointer" }}>
                {subDone ? "✓" : "→"}
              </button>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <button onClick={toggle} style={{ flex:1, background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"9px", fontSize:13, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit" }}>
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
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desk-nav { display: none !important; }
          .mob-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
