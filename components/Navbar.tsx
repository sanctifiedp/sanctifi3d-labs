"use client";
import { useState } from "react";
import { useTheme } from "../lib/ThemeContext";
import SiteLogo from "./SiteLogo";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "⚡ Alpha", href: "/alpha" },
    { label: "🔖 Bookmarks", href: "/bookmarks" },
    { label: "About", href: "/about" },
    { label: "Widget", href: "/widget/embed" },
    { label: "📡 RSS", href: "/feed.xml" },
  ];

  return (
    <>
      <nav style={{ position:"fixed", top:32, left:0, right:0, zIndex:100, background:"var(--nav)", borderBottom:"1px solid var(--border)", backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:48, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <a href="/" style={{ textDecoration:"none" }}>
            <SiteLogo />
          </a>

          {/* Desktop links */}
          <div style={{ display:"flex", alignItems:"center", gap:4 }} className="desktop-nav">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{ color:"var(--sub)", fontSize:13, fontWeight:600, padding:"6px 12px", borderRadius:8, textDecoration:"none", transition:"all .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--sub)")}>
                {l.label}
              </a>
            ))}
            <button onClick={toggleTheme} style={{ marginLeft:8, background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:14, color:"var(--fg)" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(o => !o)} className="mobile-menu-btn" style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"var(--fg)", display:"none" }}>
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background:"var(--nav)", borderTop:"1px solid var(--border)", padding:"12px 20px", display:"flex", flexDirection:"column", gap:4 }} className="mobile-menu">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ color:"var(--fg)", fontSize:14, fontWeight:600, padding:"10px 12px", borderRadius:8, textDecoration:"none" }}>
                {l.label}
              </a>
            ))}
            <button onClick={toggleTheme} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 12px", cursor:"pointer", fontSize:14, color:"var(--fg)", textAlign:"left", fontFamily:"inherit", marginTop:4 }}>
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
