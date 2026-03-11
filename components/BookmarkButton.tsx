"use client";
import { useState, useEffect } from "react";

export default function BookmarkButton({ post }: { post: any }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
    setSaved(bookmarks.some((b: any) => b.id === post.id));
  }, [post.id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const bookmarks = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
    let updated;
    if (saved) {
      updated = bookmarks.filter((b: any) => b.id !== post.id);
    } else {
      updated = [...bookmarks, { id: post.id, title: post.title, category: post.category, date: post.date, imageUrl: post.imageUrl }];
    }
    localStorage.setItem("s3d_bookmarks", JSON.stringify(updated));
    setSaved(!saved);
  }

  return (
    <button onClick={toggle} title={saved ? "Remove bookmark" : "Bookmark"} style={{
      background: saved ? "rgba(52,211,153,.12)" : "var(--card)",
      border: saved ? "1px solid rgba(52,211,153,.4)" : "1px solid var(--border)",
      borderRadius: 8, padding: "6px 10px", cursor: "pointer",
      fontSize: 16, color: saved ? "#34d399" : "var(--sub)",
      transition: "all .2s", fontFamily: "inherit"
    }}>
      {saved ? "🔖" : "🔖"}
    </button>
  );
}
