"use client";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px", position: "relative", overflow: "hidden", zIndex: 1 }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes glitch {
          0%, 100% { clip-path: inset(0 0 98% 0); transform: translate(-4px); }
          20% { clip-path: inset(30% 0 50% 0); transform: translate(4px); }
          40% { clip-path: inset(70% 0 10% 0); transform: translate(-4px); }
          60% { clip-path: inset(10% 0 80% 0); transform: translate(4px); }
          80% { clip-path: inset(50% 0 30% 0); transform: translate(0); }
        }
      `}</style>

      {/* Glow following mouse */}
      <div style={{
        position: "fixed", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(52,211,153,.06), transparent)",
        pointerEvents: "none", zIndex: 0,
        left: pos.x - 200, top: pos.y - 200,
        transition: "left .3s ease, top .3s ease"
      }} />

      {/* 404 */}
      <div style={{ position: "relative", animation: "float 4s ease-in-out infinite", marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(100px, 22vw, 180px)", fontWeight: 900, lineHeight: 1, margin: 0, color: "var(--fg)", letterSpacing: "-.04em", position: "relative" }}>
          4
          <span style={{ color: "#34d399", textShadow: "0 0 40px rgba(52,211,153,.4)" }}>0</span>
          4
        </h1>
        {/* Glitch layer */}
        <h1 aria-hidden style={{ fontSize: "clamp(100px, 22vw, 180px)", fontWeight: 900, lineHeight: 1, margin: 0, color: "#34d399", letterSpacing: "-.04em", position: "absolute", top: 0, left: 0, opacity: .15, animation: "glitch 3s infinite" }}>
          404
        </h1>
      </div>

      <div style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 999, padding: "5px 18px", fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 20, letterSpacing: ".06em" }}>
        ✦ PAGE NOT FOUND
      </div>

      <h2 style={{ fontSize: "clamp(18px, 4vw, 28px)", fontWeight: 900, color: "var(--fg)", margin: "0 0 12px" }}>
        Lost in the blockchain?
      </h2>
      <p style={{ color: "var(--sub)", fontSize: 16, maxWidth: 380, lineHeight: 1.7, margin: "0 0 36px" }}>
        This page doesn't exist or has been moved. Don't worry — the alpha is still out there.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
        <a href="/" style={{ background: "#34d399", color: "#000", borderRadius: 999, padding: "12px 28px", fontSize: 14, fontWeight: 800, textDecoration: "none" }}>
          ← Back to Home
        </a>
        <a href="/alpha" style={{ background: "var(--card)", color: "var(--fg)", border: "1px solid var(--border)", borderRadius: 999, padding: "12px 28px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          ⚡ Find Alpha
        </a>
      </div>

      {/* Quick links */}
      <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
        {[
          { label: "Home", href: "/" },
          { label: "Alpha", href: "/alpha" },
          { label: "About", href: "/about" },
          { label: "Settings", href: "/settings" },
        ].map(l => (
          <a key={l.href} href={l.href} style={{ color: "var(--sub)", textDecoration: "none", fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#34d399")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--sub)")}>
            {l.label}
          </a>
        ))}
      </div>
    </main>
  );
}
