"use client";
import { useState, useEffect } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((scrolled / total) * 100, 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 63, left: 0, right: 0,
      height: 3, zIndex: 9999, background: "rgba(255,255,255,.06)"
    }}>
      <div style={{
        height: "100%",
        width: `${progress}%`,
        background: "linear-gradient(90deg, #34d399, #6ee7b7)",
        transition: "width .08s linear",
        boxShadow: "0 0 10px rgba(52,211,153,.7), 0 0 4px rgba(52,211,153,1)"
      }} />
    </div>
  );
}
