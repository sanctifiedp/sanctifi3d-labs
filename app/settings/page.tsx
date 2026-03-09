"use client";
import { useTheme } from "../../lib/ThemeContext";

export default function Settings() {
  const { dark, toggle } = useTheme();

  const card = { background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"20px 24px", marginBottom:14, backdropFilter:"blur(8px)" } as any;
  const label = { fontSize:15, fontWeight:700, color:"var(--fg)", margin:"0 0 4px" } as any;
  const sub = { fontSize:13, color:"var(--sub)", margin:"0 0 14px" } as any;

  return (
    <main style={{ fontFamily:"system-ui,sans-serif", minHeight:"100vh", padding:"80px 20px 60px", position:"relative", zIndex:1 }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <h1 style={{ fontSize:28, fontWeight:900, marginBottom:6, color:"var(--fg)" }}>Settings</h1>
        <p style={{ color:"var(--sub)", fontSize:15, marginBottom:32 }}>Customize your Sanctifi3d Labs experience.</p>

        {/* THEME */}
        <div style={card}>
          <p style={label}>Appearance</p>
          <p style={sub}>Choose between dark and light mode. Your preference is saved across visits.</p>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={()=>!dark&&toggle()} style={{ flex:1, padding:"12px", borderRadius:10, border:`2px solid ${dark?"#34d399":"var(--border)"}`, background:dark?"rgba(52,211,153,.1)":"transparent", color:"var(--fg)", fontWeight:700, cursor:"pointer", fontSize:14 }}>
              🌙 Dark Mode {dark&&"✓"}
            </button>
            <button onClick={()=>dark&&toggle()} style={{ flex:1, padding:"12px", borderRadius:10, border:`2px solid ${!dark?"#34d399":"var(--border)"}`, background:!dark?"rgba(52,211,153,.1)":"transparent", color:"var(--fg)", fontWeight:700, cursor:"pointer", fontSize:14 }}>
              ☀️ Light Mode {!dark&&"✓"}
            </button>
          </div>
        </div>

        {/* ABOUT */}
        <div style={card}>
          <p style={label}>About Sanctifi3d Labs</p>
          <p style={{ fontSize:14, color:"var(--sub)", lineHeight:1.7, margin:0 }}>
            Sanctifi3d Labs is an AI-powered news and alpha aggregation platform for Web3, Crypto, Graphic Design and AI enthusiasts.
            Built and curated by <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ color:"#34d399" }}>@Sanctifi3d_1</a>.
          </p>
        </div>

        {/* LINKS */}
        <div style={card}>
          <p style={label}>Quick Links</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
            {[["🏠 Home","/"],["⚡ Alpha Opportunities","/alpha"],["⚖️ Legal & Privacy","/legal"],["🔐 Admin","/admin"]].map(([l,h])=>(
              <a key={h} href={h} style={{ fontSize:14, color:"#34d399", textDecoration:"none", fontWeight:600 }}>{l}</a>
            ))}
          </div>
        </div>

        {/* SOCIAL */}
        <div style={card}>
          <p style={label}>Follow Us</p>
          <a href="https://x.com/Sanctifi3d_1" target="_blank" style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:14, color:"var(--fg)", textDecoration:"none", fontWeight:600, background:"var(--border)", padding:"10px 18px", borderRadius:8 }}>
            𝕏 @Sanctifi3d_1
          </a>
        </div>
      </div>
    </main>
  );
}
