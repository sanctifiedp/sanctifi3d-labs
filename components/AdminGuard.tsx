"use client";
import { useState, useEffect } from "react";

const ADMIN_KEY = "sanctifi3d_admin_2026";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("s3d_admin") === ADMIN_KEY) {
      setAuthed(true);
    }
    setChecked(true);
  }, []);

  function login() {
    if (pw === ADMIN_KEY) {
      sessionStorage.setItem("s3d_admin", ADMIN_KEY);
      setAuthed(true);
    } else {
      setErr("Wrong password.");
      setTimeout(() => setErr(""), 2000);
    }
  }

  if (!checked) return null;

  if (!authed) return (
    <main style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ width:360, padding:32, background:"#111", border:"1px solid #1f1f1f", borderRadius:20 }}>
        <h1 style={{ color:"#fff", fontWeight:900, fontSize:22, margin:"0 0 4px" }}>🔐 Admin Access</h1>
        <p style={{ color:"#6b7280", fontSize:13, margin:"0 0 24px" }}>This area is restricted.</p>
        {err && <p style={{ color:"#f87171", fontSize:13, marginBottom:12 }}>{err}</p>}
        <input
          type="password"
          placeholder="Enter admin password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ width:"100%", background:"#0a0a0a", border:"1px solid #2a2a2a", borderRadius:8, padding:"10px 14px", fontSize:14, color:"#fff", fontFamily:"inherit", outline:"none", boxSizing:"border-box", marginBottom:12 }}
          autoFocus
        />
        <button onClick={login} style={{ width:"100%", background:"#34d399", color:"#000", border:"none", borderRadius:8, padding:"11px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
          Login
        </button>
      </div>
    </main>
  );

  return <>{children}</>;
}
