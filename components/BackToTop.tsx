"use client";
import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed", bottom: 28, right: 20, zIndex: 999,
        width: 44, height: 44, borderRadius: "50%",
        background: "#34d399", color: "#000", border: "none",
        fontSize: 20, fontWeight: 900, cursor: "pointer",
        boxShadow: "0 4px 20px rgba(52,211,153,.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "transform .2s, box-shadow .2s"
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(52,211,153,.5)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(52,211,153,.4)";
      }}
      title="Back to top"
    >
      ↑
    </button>
  );
}
