"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function SiteLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site"), (snap) => {
      if (snap.exists()) setLogoUrl(snap.data().logoUrl || null);
    });
    return () => unsub();
  }, []);

  if (!logoUrl) return (
    <span style={{ fontWeight:900, fontSize:18, color:"var(--fg)", letterSpacing:"-.02em" }}>
      Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span>
    </span>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <img src={logoUrl} alt="Sanctifi3d Labs" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:"2px solid #34d399" }} />
      <span style={{ fontWeight:900, fontSize:18, color:"var(--fg)", letterSpacing:"-.02em" }}>
        Sanctifi3d<span style={{ color:"#34d399" }}>Labs</span>
      </span>
    </div>
  );
}
