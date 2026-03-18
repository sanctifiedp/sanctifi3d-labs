"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc, increment, setDoc } from "firebase/firestore";

const REACTIONS = [
  { key: "fire", emoji: "🔥", label: "Fire" },
  { key: "diamond", emoji: "💎", label: "Diamond" },
  { key: "rocket", emoji: "🚀", label: "Rocket" },
];

export default function PostReactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Record<string,number>>({ fire:0, diamond:0, rocket:0 });
  const [reacted, setReacted] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(db, "reactions", postId)).then(snap => {
      if (snap.exists()) setCounts(snap.data() as any);
    });
    const saved = localStorage.getItem("reaction_" + postId);
    if (saved) setReacted(saved);
  }, [postId]);

  async function react(key: string) {
    if (reacted) return;
    const ref = doc(db, "reactions", postId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { [key]: increment(1) });
    } else {
      await setDoc(ref, { fire:0, diamond:0, rocket:0, [key]: 1 });
    }
    setCounts(c => ({ ...c, [key]: (c[key] || 0) + 1 }));
    setReacted(key);
    localStorage.setItem("reaction_" + postId, key);
  }

  return (
    <div style={{ display:"flex", gap:12, margin:"24px 0", flexWrap:"wrap" }}>
      {REACTIONS.map(r => (
        <button key={r.key} onClick={() => react(r.key)}
          style={{ display:"flex", alignItems:"center", gap:6, background: reacted === r.key ? "rgba(52,211,153,.15)" : "var(--card)", border: reacted === r.key ? "1px solid rgba(52,211,153,.4)" : "1px solid var(--border)", borderRadius:999, padding:"8px 16px", fontSize:14, cursor: reacted ? "default" : "pointer", fontFamily:"inherit", transition:"all .2s" }}>
          <span>{r.emoji}</span>
          <span style={{ color:"var(--fg)", fontWeight:600 }}>{counts[r.key] || 0}</span>
        </button>
      ))}
    </div>
  );
}
