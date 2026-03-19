"use client";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";
import { useTheme } from "../lib/ThemeContext";
import SiteLogo from "./SiteLogo";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, signIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [subOpen, setSubOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [subbing, setSubbing] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function handleSearch(e: React.KeyboardEvent) {
    if (e.key === "Enter" && search.trim()) {
      window.location.href = "/?search=" + encodeURIComponent(search.trim());
      setSearchOpen(false);
      setSearch("");
    }
  }

  async function subscribe() {
    if (!email.includes("@")) return;
    setSubbing(true);
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      await addDoc(collection(db, "subscribers"), { email, subscribedAt: new Date().toISOString(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
      setSubDone(true);
    } catch(e) { console.error(e); }
    setSubbing(false);
  }

  const links = [
    { label: "Alpha ⚡", href: "/alpha" },
    { label: "Bookmarks", href: "/bookmarks" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {/* Floating pill navbar */}
      <div style={{
        position: "fixed",
        top: 42,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        width: "calc(100% - 48px)",
        maxWidth: 900,
        transition: "all .3s ease",
      }}>
        <nav style={{
          background: scrolled ? "rgba(8,8,8,.92)" : "rgba(8,8,8,.75)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 999,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,.4)" : "0 4px 16px rgba(0,0,0,.2)",
          padding: "0 8px 0 16px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          transition: "all .3s",
        }}>
          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <SiteLogo />
          </a>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }} className="desk-nav">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{
                color: "rgba(255,255,255,.55)",
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 999,
                textDecoration: "none",
                transition: "all .15s",
                whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.55)"; e.currentTarget.style.background = "transparent"; }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Search */}
            {searchOpen ? (
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                onBlur={() => { setSearchOpen(false); setSearch(""); }}
                placeholder="Search posts..."
                style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "#fff", outline: "none", width: 180, fontFamily: "inherit" }}
              />
            ) : (
              <button onClick={() => setSearchOpen(true)} title="Search" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 999, padding: "7px 11px", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1 }}>
                🔍
              </button>
            )}

            {/* Theme */}
            <button onClick={toggle} title="Toggle theme" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 999, padding: "7px 11px", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1 }}>
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Profile */}
            {user ? (
              <a href="/profile" title={user.displayName||"Profile"} style={{ flexShrink:0 }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width:30, height:30, borderRadius:"50%", border:"2px solid #34d399", display:"block" }} />
                ) : (
                  <div style={{ width:30, height:30, borderRadius:"50%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#000" }}>
                    {(user.displayName||user.email||"U")[0].toUpperCase()}
                  </div>
                )}
              </a>
            ) : (
              <button onClick={signIn} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:999, padding:"7px 14px", fontSize:12, fontWeight:700, color:"rgba(255,255,255,.8)", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
                Sign In
              </button>
            )}
            {/* Subscribe */}
            <button onClick={() => setSubOpen(o => !o)} style={{ background: "#34d399", color: "#000", border: "none", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              Subscribe
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(o => !o)} className="mob-btn" style={{ display: "none", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 999, padding: "7px 12px", cursor: "pointer", fontSize: 16, color: "#fff", lineHeight: 1 }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </nav>

        {/* Subscribe dropdown */}
        {subOpen && (
          <div style={{ position: "absolute", top: 58, right: 0, background: "#111", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 20, width: 300, boxShadow: "0 16px 48px rgba(0,0,0,.5)", zIndex: 200 }}>
            {subDone ? (
              <p style={{ color: "#34d399", fontWeight: 700, fontSize: 15, margin: 0, textAlign: "center" }}>🎉 You're subscribed!</p>
            ) : (
              <>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: "0 0 4px" }}>Stay ahead of the curve</p>
                <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 14px" }}>Weekly Web3, Crypto & AI updates.</p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && subscribe()}
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#fff", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
                />
                <button onClick={subscribe} disabled={subbing} style={{ width: "100%", background: "#34d399", color: "#000", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                  {subbing ? "..." : "Subscribe →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Mobile dropdown */}
        {open && (
          <div style={{ marginTop: 8, background: "rgba(8,8,8,.95)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: "12px 20px 16px", backdropFilter: "blur(24px)" }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ display: "block", color: "#fff", fontSize: 15, fontWeight: 600, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.06)", textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <input
                type="email"
                placeholder="Subscribe via email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#fff", fontFamily: "inherit", outline: "none" }}
              />
              <button onClick={subscribe} disabled={subbing} style={{ background: "#34d399", color: "#000", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                {subDone ? "✓" : "→"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 680px) {
          .desk-nav { display: none !important; }
          .mob-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
