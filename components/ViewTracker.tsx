"use client";
import { useEffect } from "react";
import { db } from "../lib/firebase";
import { doc, increment, setDoc, getDoc } from "firebase/firestore";

export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    const key = `viewed_${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const ref = doc(db, "views", postId);
    getDoc(ref).then(snap => {
      if (snap.exists()) {
        setDoc(ref, { count: increment(1), postId }, { merge: true });
      } else {
        setDoc(ref, { count: 1, postId });
      }
    });
  }, [postId]);
  return null;
}
