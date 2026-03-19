"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from "firebase/firestore";
import { useAuth } from "./AuthProvider";

export interface Notification {
  id: string;
  uid: string;
  type: "post_approved" | "post_rejected" | "comment_reply" | "room_message" | "new_post" | "system";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: number;
  icon?: string;
}

const TYPE_ICONS: Record<string, string> = {
  post_approved: "✅",
  post_rejected: "❌",
  comment_reply: "💬",
  room_message: "🏠",
  new_post: "📰",
  system: "🔔",
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markRead(id: string) {
    await updateDoc(doc(db, "notifications", id), { read: true });
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => updateDoc(doc(db, "notifications", n.id), { read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  }

  if (!user) return null;

  return (
    <div style={{ position:"relative" }} ref={ref}>
      <button onClick={() => setOpen(o => !o)} style={{ background:"transparent", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:16, color:"var(--sub)", position:"relative", lineHeight:1, transition:"all .15s" }}
        onMouseEnter={e => e.currentTarget.style.color="var(--fg)"}
        onMouseLeave={e => e.currentTarget.style.color="var(--sub)"}
        title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span style={{ position:"absolute", top:2, right:2, width:16, height:16, background:"#f87171", borderRadius:"50%", fontSize:9, fontWeight:900, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position:"absolute", top:44, right:0, background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, width:320, maxHeight:420, overflow:"hidden", boxShadow:"0 16px 48px rgba(0,0,0,.4)", zIndex:300, display:"flex", flexDirection:"column" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
            <h3 style={{ fontWeight:800, fontSize:15, color:"var(--fg)", margin:0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background:"transparent", border:"none", fontSize:11, color:"#34d399", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div style={{ overflowY:"auto", flex:1 }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 20px" }}>
                <p style={{ fontSize:28, marginBottom:8 }}>🔔</p>
                <p style={{ color:"var(--sub)", fontSize:13 }}>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => { markRead(n.id); if(n.link) window.location.href=n.link; setOpen(false); }}
                style={{ display:"flex", gap:12, padding:"12px 16px", borderBottom:"1px solid var(--border)", cursor:"pointer", background:n.read?"transparent":"rgba(52,211,153,.04)", transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.04)"}
                onMouseLeave={e => e.currentTarget.style.background=n.read?"transparent":"rgba(52,211,153,.04)"}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                  {TYPE_ICONS[n.type] || "🔔"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:n.read?600:700, color:"var(--fg)", margin:"0 0 2px", lineHeight:1.4 }}>{n.title}</p>
                  <p style={{ fontSize:12, color:"var(--sub)", margin:"0 0 4px", lineHeight:1.4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.message}</p>
                  <p style={{ fontSize:10, color:"var(--sub)", margin:0, opacity:.7 }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#34d399", flexShrink:0, marginTop:4 }} />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding:"10px 16px", borderTop:"1px solid var(--border)", textAlign:"center" }}>
            <a href="/profile" onClick={()=>setOpen(false)} style={{ fontSize:12, color:"#34d399", fontWeight:700, textDecoration:"none" }}>View all on profile →</a>
          </div>
        </div>
      )}
    </div>
  );
}
