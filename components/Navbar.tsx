"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../lib/ThemeContext";
import SiteLogo from "./SiteLogo";

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Home", href: "/" },
    { label: "⚡ Alpha", href: "/alpha" },
    { label: "🔖 Saved", href: "/bookmarks" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 32,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 52,
        background: scrolled ? "var(--nav)" : "var(--nav)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16
        }}>
          <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <SiteLogo />
          </a>

          {/* Desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, justifyContent: "center" }} className="desk-nav">
            {links.map(l => (
              <a key={l.href} href={l.href} style={{
                color: "var(--sub)",
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "all .15s",
                whiteSpace: "nowrap"
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--sub)"; e.currentTarget.style.background = "transparent"; }}>
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button onClick={toggle} title="Toggle theme" style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 14,
              color: "var(--fg)",
              lineHeight: 1,
              transition: "all .15s"
            }}>
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(o => !o)} className="mob-btn" style={{
              display: "none",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 16,
              color: "var(--fg)",
              lineHeight: 1
            }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{
            position: "absolute",
            top: 52,
            left: 0,
            right: 0,
            background: "var(--nav)",
            borderBottom: "1px solid var(--border)",
            padding: "8px 24px 16px",
            backdropFilter: "blur(20px)",
            zIndex: 99
          }}>
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
                display: "block",
                color: "var(--fg)",
                fontSize: 15,
                fontWeight: 600,
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none"
              }}>
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 680px) {
          .desk-nav { display: none !important; }
          .mob-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
