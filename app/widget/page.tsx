"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export default function Widget() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getDocs(query(collection(db, "posts"), where("status", "==", "approved")))
      .then(snap => {
        const sorted = snap.docs
          .map(d => ({ id: d.id, ...d.data() as any }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setPosts(sorted);
      });
  }, []);

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: "#080808", minHeight: "100vh", padding: 16 }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; }`}</style>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 10, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="https://sanctifi3d-labs.vercel.app" target="_blank" style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>
          Sanctifi3d<span style={{ color: "#34d399" }}>Labs</span>
        </a>
        <span style={{ fontSize: 10, color: "#34d399", fontWeight: 700 }}>● LIVE</span>
      </div>
      {posts.map(p => (
        <a key={p.id} href={`https://sanctifi3d-labs.vercel.app/post/${p.id}`} target="_blank"
          style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
          {p.imageUrl && <img src={p.imageUrl} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
          <div>
            <span style={{ fontSize: 10, color: "#34d399", fontWeight: 700 }}>{p.category}</span>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginTop: 2 }}>{p.title?.slice(0, 70)}{p.title?.length > 70 ? "..." : ""}</p>
            <p style={{ fontSize: 10, color: "#6b7280", marginTop: 3 }}>{p.date}</p>
          </div>
        </a>
      ))}
      <a href="https://sanctifi3d-labs.vercel.app" target="_blank" style={{ display: "block", textAlign: "center", fontSize: 11, color: "#34d399", marginTop: 8, fontWeight: 600 }}>
        View all on Sanctifi3d Labs →
      </a>
    </div>
  );
}
