"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "../lib/ThemeContext";

const links = [
  { href:"/", label:"Home" },
  { href:"/alpha", label:"⚡ Alpha" },
  { href:"/about", label:"About" },
  { href:"/settings", label:"Settings" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const path = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on route change
  useEffect(() => { setOpen(false); }, [path]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <nav style={{ position:"fixed", top:32, left:0, right:0, zIndex:100, background:"var(--nav)", borderBottom:"1px solid var(--border)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* LOGO */}
          <a href="/" style={{ fontWeight:900, fontSize:17, textDecoration:"none", color:"var(--fg)", letterSpacing:"-.02em" }}>
            Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span>
          </a>

          {/* DESKTOP LINKS */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }} className="desktop-nav">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize:14, fontWeight:600, padding:"6px 12px", borderRadius:8, textDecoration:"none", color: path===l.href ? "#34d399" : "var(--fg)", background: path===l.href ? "rgba(52,211,153,.08)" : "transparent", transition:"all .15s" }}>
                {l.label}
              </a>
            ))}
            <button onClick={toggle} style={{ marginLeft:8, background:"var(--card)", border:"1px solid var(--border)", borderRadius:999, padding:"6px 14px", fontSize:13, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>

          {/* HAMBURGER */}
          <button ref={btnRef} onClick={() => setOpen(o => !o)}
            style={{ display:"none", background:"none", border:"none", cursor:"pointer", padding:8, flexDirection:"column", gap:5 }}
            className="hamburger" aria-label="Menu">
            <span style={{ display:"block", width:22, height:2, background:"var(--fg)", borderRadius:2, transition:"all .3s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ display:"block", width:22, height:2, background:"var(--fg)", borderRadius:2, transition:"all .3s", opacity: open ? 0 : 1 }} />
            <span style={{ display:"block", width:22, height:2, background:"var(--fg)", borderRadius:2, transition:"all .3s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div ref={menuRef} style={{
        position:"fixed", top:60, right:0, width:260, background:"var(--nav)", borderLeft:"1px solid var(--border)", borderBottom:"1px solid var(--border)", zIndex:99, padding:"16px", borderRadius:"0 0 0 16px",
        transform: open ? "translateX(0)" : "translateX(110%)",
        transition:"transform .3s cubic-bezier(.4,0,.2,1)",
        boxShadow: open ? "-8px 8px 32px rgba(0,0,0,.2)" : "none",
      }} className="mobile-menu">
        {links.map(l => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}
            style={{ display:"block", padding:"12px 16px", borderRadius:10, fontSize:15, fontWeight:600, textDecoration:"none", marginBottom:4, color: path===l.href ? "#34d399" : "var(--fg)", background: path===l.href ? "rgba(52,211,153,.08)" : "transparent" }}>
            {l.label}
          </a>
        ))}
        <div style={{ borderTop:"1px solid var(--border)", marginTop:12, paddingTop:12 }}>
          <button onClick={() => { toggle(); setOpen(false); }} style={{ width:"100%", background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"11px 16px", fontSize:14, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit", fontWeight:600, textAlign:"left" }}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
        <div style={{ marginTop:8, padding:"8px 16px" }}>
          <span style={{ fontSize:11, color:"#34d399", fontWeight:700 }}>● AI LIVE</span>
        </div>
      </div>

      {/* OVERLAY */}
      {open && <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:98, background:"rgba(0,0,0,.3)", backdropFilter:"blur(2px)" }} />}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}
