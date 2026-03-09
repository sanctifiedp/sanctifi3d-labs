"use client";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{ dark:boolean; toggle:()=>void }>({ dark:true, toggle:()=>{} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("s3d-theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    applyTheme(isDark);
  }, []);

  function applyTheme(isDark: boolean) {
    const r = document.documentElement;
    r.style.setProperty("--bg", isDark ? "#080808" : "#f0f0f0");
    r.style.setProperty("--fg", isDark ? "#ffffff" : "#111111");
    r.style.setProperty("--sub", isDark ? "rgba(255,255,255,.45)" : "#555555");
    r.style.setProperty("--card", isDark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.85)");
    r.style.setProperty("--border", isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.1)");
    r.style.setProperty("--nav", isDark ? "rgba(8,8,8,.85)" : "rgba(240,240,240,.9)");
  }

  function toggle() {
    setDark(d => {
      const next = !d;
      localStorage.setItem("s3d-theme", next ? "dark" : "light");
      applyTheme(next);
      return next;
    });
  }

  return (
    <Ctx.Provider value={{ dark, toggle }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
