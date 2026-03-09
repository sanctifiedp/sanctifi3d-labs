"use client";
import { useTheme } from "../lib/ThemeContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { label:"Home", href:"/" },
  { label:"⚡ Alpha", href:"/alpha" },
  { label:"About", href:"/about" },
  { label:"Settings", href:"/settings" },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => { setOpen(false); }, [path]);

  return (
    <>
      <style>{`
        .nav-link { font-size:13px; font-weight:600; color:var(--sub); text-decoration:none; transition:color .2s; }
        .nav-link:hover { color:var(--fg); }
        .nav-link.active { color:#34d399; }
        .bar { display:block; width:22px; height:2px; background:var(--fg); border-radius:2px; transition:transform .35s cubic-bezier(.4,0,.2,1), opacity .25s, width .3s; transform-origin:center; }
        .bar1-open { transform: translateY(8px) rotate(45deg); }
        .bar2-open { opacity:0; width:12px; }
        .bar3-open { transform: translateY(-8px) rotate(-45deg); }
        .mobile-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:98; backdrop-filter:blur(4px); }
        .mobile-menu { position:fixed; top:56px; right:0; bottom:0; width:240px; background:var(--nav); backdrop-filter:blur(20px); border-left:1px solid var(--border); z-index:99; padding:24px 0; transform:translateX(100%); transition:transform .35s cubic-bezier(.4,0,.2,1); }
        .mobile-menu.open { transform:translateX(0); }
        .mobile-menu a { display:block; padding:14px 28px; font-size:15px; font-weight:700; color:var(--fg); text-decoration:none; border-bottom:1px solid var(--border); }
        .mobile-menu a:hover { color:#34d399; }
        @media(min-width:601px){ .hamburger{display:none!important} .desktop-links{display:flex!important} }
        @media(max-width:600px){ .desktop-links{display:none!important} .hamburger{display:flex!important} }
      `}</style>

      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"var(--nav)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" }}>
        <a href="/" style={{ fontWeight:900, fontSize:17, textDecoration:"none", color:"var(--fg)" }}>
          Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span>
        </a>

        {/* Desktop */}
        <div className="desktop-links" style={{ alignItems:"center", gap:20 }}>
          {links.map(l=>(
            <a key={l.href} href={l.href} className={`nav-link${path===l.href?" active":""}`}>{l.label}</a>
          ))}
          <span style={{ fontSize:11, color:"#34d399", fontWeight:700 }}>● LIVE</span>
          <button onClick={toggle} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:999, padding:"5px 14px", fontSize:13, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit" }}>
            {dark?"☀️":"🌙"}
          </button>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={()=>setOpen(o=>!o)} style={{ background:"transparent", border:"none", cursor:"pointer", padding:"8px", display:"flex", flexDirection:"column", gap:"6px", alignItems:"center" }}>
          <span className={`bar${open?" bar1-open":""}`} />
          <span className={`bar${open?" bar2-open":""}`} />
          <span className={`bar${open?" bar3-open":""}`} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && <div className="mobile-overlay" onClick={()=>setOpen(false)} />}

      {/* Mobile menu */}
      <div className={`mobile-menu${open?" open":""}`}>
        {links.map(l=>(
          <a key={l.href} href={l.href} style={{ color:path===l.href?"#34d399":"var(--fg)" }}>{l.label}</a>
        ))}
        <div style={{ padding:"20px 28px" }}>
          <button onClick={toggle} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:999, padding:"8px 20px", fontSize:14, color:"var(--fg)", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
            {dark?"☀️ Light Mode":"🌙 Dark Mode"}
          </button>
        </div>
        <div style={{ padding:"8px 28px" }}>
          <span style={{ fontSize:11, color:"#34d399", fontWeight:700 }}>● AI LIVE</span>
        </div>
      </div>
    </>
  );
}
