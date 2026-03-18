"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../lib/ThemeContext";
import SiteLogo from "./SiteLogo";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Alpha ⚡", href: "/alpha" },
    { label: "Bookmarks", href: "/bookmarks" },
    { label: "About", href: "/about" },
    { label: "Widget", href: "/widget/embed" },
  ];

  return (
    <>
      <nav style={{
        position: "fixed", top: 32, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "var(--nav)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "all .3s ease"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <SiteLogo />
          </a>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="desk-nav">
            {links.map(l => (
              <a key={l.href} href={l.href}
                style={{ color: "var(--sub)", fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 8, textDecoration: "none", transition: "all .15s", letterSpacing: ".01em" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.background = "var(--card)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--sub)"; e.currentTarget.style.background = "transparent"; }}>
                {l.label}
              </a>
            ))}

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 8px" }} />

            {/* Theme toggle */}
            <button onClick={toggle} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 15, color: "var(--fg)", transition: "all .15s", lineHeight: 1 }}
              title={dark ? "Switch to light" : "Switch to dark"}>
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Write Post CTA */}
            <a href="/admin" style={{ marginLeft: 6, background: "#34d399", color: "#000", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: ".01em" }}>
              Admin
            </a>
          </div>

          {/* Mobile hamburger */}
          <div style={{ display: "none" }} className="mob-nav">
            <button onClick={toggle} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, marginRight: 8, color: "var(--fg)" }}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setOpen(o => !o)} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 18, color: "var(--fg)", lineHeight: 1 }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ background: "var(--nav)", borderTop: "1px solid var(--border)", padding: "12px 24px 20px" }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ display: "block", color: "var(--fg)", fontSize: 15, fontWeight: 600, padding: "12px 0", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
            <a href="/admin" onClick={() => setOpen(false)} style={{ display: "inline-block", marginTop: 16, background: "#34d399", color: "#000", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
              Admin →
            </a>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 700px) {
          .desk-nav { display: none !important; }
          .mob-nav { display: flex !important; align-items: center; }
        }
      `}</style>
    </>
  );
}
