"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function BookmarkButton({ post, onRemove }: { post: any, onRemove?: () => void }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "user_bookmarks", user.uid)).then(snap => {
        if (snap.exists()) {
          const posts = snap.data().posts || [];
          setSaved(posts.some((p:any) => p.id === post.id));
        }
      });
    } else {
      try {
        const bookmarks = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
        setSaved(bookmarks.some((b:any) => b.id === post.id));
      } catch {}
    }
  }, [post.id, user]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      // Cloud sync
      const ref = doc(db, "user_bookmarks", user.uid);
      const snap = await getDoc(ref);
      const posts = snap.exists() ? snap.data().posts || [] : [];
      let updated;
      if (saved) {
        updated = posts.filter((p:any) => p.id !== post.id);
        onRemove?.();
      } else {
        updated = [...posts, { id:post.id, title:post.title, category:post.category, date:post.date, imageUrl:post.imageUrl }];
      }
      await setDoc(ref, { posts: updated });
      setSaved(!saved);
    } else {
      // Local
      try {
        const bookmarks = JSON.parse(localStorage.getItem("s3d_bookmarks") || "[]");
        let updated;
        if (saved) {
          updated = bookmarks.filter((b:any) => b.id !== post.id);
          onRemove?.();
        } else {
          updated = [...bookmarks, { id:post.id, title:post.title, category:post.category, date:post.date, imageUrl:post.imageUrl }];
        }
        localStorage.setItem("s3d_bookmarks", JSON.stringify(updated));
        setSaved(!saved);
      } catch {}
    }
  }

  return (
    <button onClick={toggle} title={saved ? "Remove bookmark" : "Bookmark"} style={{
      background: saved ? "rgba(52,211,153,.12)" : "var(--card)",
      border: saved ? "1px solid rgba(52,211,153,.4)" : "1px solid var(--border)",
      borderRadius: 8,
      padding: "6px 10px",
      cursor: "pointer",
      fontSize: 16,
      color: saved ? "#34d399" : "var(--sub)",
      transition: "all .2s",
      fontFamily: "inherit",
      flexShrink: 0,
    }}>
      {saved ? "🔖" : "🔖"}
    </button>
  );
}
