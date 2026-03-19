"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "../../../lib/firebase";
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  query, orderBy, limit, getDoc, increment, serverTimestamp,
  startAfter, getDocs, setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../../components/AuthProvider";

const REACTIONS_LIST = ["🔥","💎","🚀","👍","❤️","😂","👀","💯"];

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  const { user, signIn } = useAuth();

  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [reactionMenu, setReactionMenu] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState<any>(null);
  const [memberList, setMemberList] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<any>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 40;

  // Load room info
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomId), snap => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
        setPinnedMessage(snap.data().pinnedMessage || null);
        setBannedUsers(snap.data().bannedUsers || []);
      }
    });
    return () => unsub();
  }, [roomId]);

  // Check if admin
  useEffect(() => {
    if (user?.email) {
      setIsAdmin(["adeyigbeminiyi414@gmail.com"].includes(user.email));
    }
  }, [user]);

  // Load messages (real-time, last 40)
  useEffect(() => {
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse();
      setMessages(msgs);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Typing indicator listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "rooms", roomId, "typing", "users"), snap => {
      if (snap.exists()) {
        const data = snap.data();
        const active = Object.entries(data)
          .filter(([uid, ts]: any) => uid !== user?.uid && Date.now() - ts < 4000)
          .map(([uid, _]: any) => uid);
        setTypingUsers(active);
      }
    });
    return () => unsub();
  }, [roomId, user?.uid]);

  // Presence tracking
  useEffect(() => {
    if (!user) return;
    setDoc(doc(db, "user_presence", user.uid), { online: true, lastSeen: Date.now(), currentRoom: roomId }, { merge: true });
    const unsub = onSnapshot(collection(db, "user_presence"), snap => {
      const online = snap.docs.filter(d => {
        const data = d.data();
        return data.online && data.currentRoom === roomId && Date.now() - data.lastSeen < 60000;
      }).length;
      setOnlineCount(online);
    });
    return () => {
      setDoc(doc(db, "user_presence", user.uid), { online: false, currentRoom: null }, { merge: true });
      unsub();
    };
  }, [roomId, user]);

  // Load older messages
  async function loadMore() {
    if (!hasMore || loadingMore || !lastDoc) return;
    setLoadingMore(true);
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt","desc"), startAfter(lastDoc), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    const older = snap.docs.map(d => ({ id:d.id, ...d.data() })).reverse();
    setMessages(prev => [...older, ...prev]);
    setLastDoc(snap.docs[snap.docs.length-1]);
    setHasMore(snap.docs.length === PAGE_SIZE);
    setLoadingMore(false);
  }

  // Typing indicator
  function handleTyping() {
    if (!user) return;
    clearTimeout(typingTimeout.current);
    setDoc(doc(db, "rooms", roomId, "typing", "users"), { [user.uid]: Date.now() }, { merge: true });
    typingTimeout.current = setTimeout(() => {
      const { deleteField } = require("firebase/firestore");
      updateDoc(doc(db, "rooms", roomId, "typing", "users"), { [user.uid]: deleteField() }).catch(()=>{});
    }, 3000);
  }

  // Send message
  async function sendMessage() {
    if (!user || !text.trim() || sending) return;
    if (bannedUsers.includes(user.uid)) { alert("You have been banned from this room."); return; }
    setSending(true);
    const msgData: any = {
      uid: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
      authorPhoto: user.photoURL || "",
      text: text.trim(),
      createdAt: Date.now(),
      reactions: {},
      deleted: false,
      edited: false,
    };
    if (replyTo) {
      msgData.replyTo = { id: replyTo.id, text: replyTo.text?.slice(0,80), authorName: replyTo.authorName };
    }
    await addDoc(collection(db, "rooms", roomId, "messages"), msgData);
    await updateDoc(doc(db, "rooms", roomId), {
      lastMessage: `${msgData.authorName}: ${text.trim().slice(0,60)}`,
      lastMessageAt: new Date().toISOString(),
      messageCount: increment(1),
    });
    setText("");
    setReplyTo(null);
    setSending(false);
  }

  // Send image
  async function sendImage(file: File) {
    if (!user) return;
    setImageUploading(true);
    try {
      const storageRef = ref(storage, `chat/${roomId}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        uid: user.uid,
        authorName: user.displayName || user.email?.split("@")[0] || "Anonymous",
        authorPhoto: user.photoURL || "",
        text: "",
        imageUrl: url,
        createdAt: Date.now(),
        reactions: {},
        deleted: false,
      });
      await updateDoc(doc(db, "rooms", roomId), {
        lastMessage: `${user.displayName || "Someone"} shared an image`,
        lastMessageAt: new Date().toISOString(),
        messageCount: increment(1),
      });
    } catch(e) { alert("Image upload failed."); }
    setImageUploading(false);
  }

  // React to message
  async function reactToMessage(msgId: string, emoji: string) {
    if (!user) return;
    const msgRef = doc(db, "rooms", roomId, "messages", msgId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;
    const reactions = snap.data().reactions || {};
    const key = `${emoji}_${user.uid}`;
    if (reactions[key]) {
      const { deleteField } = await import("firebase/firestore");
      await updateDoc(msgRef, { [`reactions.${key}`]: deleteField() });
    } else {
      await updateDoc(msgRef, { [`reactions.${key}`]: emoji });
    }
    setReactionMenu(null);
  }

  // Delete message
  async function deleteMessage(msgId: string) {
    await updateDoc(doc(db, "rooms", roomId, "messages", msgId), { deleted: true, text: "This message was deleted.", imageUrl: "" });
  }

  // Pin message
  async function pinMessage(msg: any) {
    await updateDoc(doc(db, "rooms", roomId), { pinnedMessage: { id:msg.id, text:msg.text, authorName:msg.authorName } });
  }

  // Ban user
  async function banUser(uid: string, name: string) {
    if (!confirm(`Ban ${name} from this room?`)) return;
    await updateDoc(doc(db, "rooms", roomId), { bannedUsers: [...bannedUsers, uid] });
  }

  // Group reactions
  function groupReactions(reactions: Record<string,string>) {
    const counts: Record<string,number> = {};
    Object.values(reactions || {}).forEach(e => { counts[e] = (counts[e]||0)+1; });
    return Object.entries(counts);
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    return d.toLocaleDateString([],{month:"short",day:"numeric"});
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (loading) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12, animation:"spin 1s linear infinite" }}>💬</div>
        <p style={{ color:"var(--sub)" }}>Loading room...</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );

  if (!room) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:40, marginBottom:12 }}>🚫</p>
        <h2 style={{ color:"var(--fg)", fontWeight:900, margin:"0 0 8px" }}>Room not found</h2>
        <a href="/rooms" style={{ color:"#34d399", textDecoration:"none", fontWeight:700 }}>← Back to Rooms</a>
      </div>
    </main>
  );

  const isBanned = bannedUsers.includes(user?.uid || "");

  return (
    <div style={{ fontFamily:"system-ui,sans-serif", height:"100vh", display:"flex", flexDirection:"column", paddingTop:84, background:"var(--bg)" }}>

      {/* Room header */}
      <div style={{ position:"fixed", top:84, left:0, right:0, zIndex:90, background:"var(--nav)", borderBottom:"1px solid var(--border)", backdropFilter:"blur(20px)", padding:"0 20px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href="/rooms" style={{ color:"var(--sub)", textDecoration:"none", fontSize:18, lineHeight:1 }}>←</a>
          <span style={{ fontSize:24 }}>{room.icon}</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <h1 style={{ fontSize:16, fontWeight:800, color:"var(--fg)", margin:0 }}>{room.name}</h1>
              {room.isOfficial && <span style={{ fontSize:10, background:"rgba(52,211,153,.1)", border:"1px solid rgba(52,211,153,.2)", borderRadius:999, padding:"1px 7px", color:"#34d399", fontWeight:700 }}>OFFICIAL</span>}
              {!room.isOpen && <span style={{ fontSize:10, background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.2)", borderRadius:999, padding:"1px 7px", color:"#f87171", fontWeight:700 }}>CLOSED</span>}
            </div>
            <p style={{ fontSize:11, color:"var(--sub)", margin:0 }}>{room.description}</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--sub)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#34d399" }} />
            {onlineCount} online
          </div>
          <span style={{ fontSize:12, color:"var(--sub)" }}>💬 {room.messageCount || 0}</span>
          {isAdmin && (
            <button onClick={() => updateDoc(doc(db,"rooms",roomId),{isOpen:!room.isOpen})} style={{ background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.2)", borderRadius:8, padding:"4px 10px", fontSize:11, color:"#f87171", cursor:"pointer", fontFamily:"inherit" }}>
              {room.isOpen ? "Close Room" : "Open Room"}
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex:1, overflowY:"auto", padding:"148px 0 0", display:"flex", flexDirection:"column" }}>
        <div style={{ maxWidth:760, width:"100%", margin:"0 auto", padding:"0 16px 16px", flex:1, display:"flex", flexDirection:"column" }}>

          {/* Load more */}
          {hasMore && (
            <button onClick={loadMore} disabled={loadingMore} style={{ alignSelf:"center", background:"var(--card)", border:"1px solid var(--border)", borderRadius:999, padding:"7px 20px", fontSize:12, color:"var(--sub)", cursor:"pointer", fontFamily:"inherit", margin:"8px 0 16px" }}>
              {loadingMore ? "Loading..." : "↑ Load older messages"}
            </button>
          )}

          {/* Pinned message */}
          {pinnedMessage && (
            <div style={{ background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:14 }}>📌</span>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:11, color:"#34d399", fontWeight:700 }}>{pinnedMessage.authorName}: </span>
                <span style={{ fontSize:13, color:"var(--fg)" }}>{pinnedMessage.text?.slice(0,100)}</span>
              </div>
              {isAdmin && <button onClick={()=>updateDoc(doc(db,"rooms",roomId),{pinnedMessage:null})} style={{ background:"none", border:"none", color:"var(--sub)", cursor:"pointer", fontSize:14 }}>✕</button>}
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 0", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{room.icon}</div>
              <h3 style={{ fontWeight:800, fontSize:18, color:"var(--fg)", margin:"0 0 8px" }}>No messages yet</h3>
              <p style={{ color:"var(--sub)", fontSize:14 }}>Be the first to say something!</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isOwn = msg.uid === user?.uid;
            const prevMsg = messages[idx-1];
            const isSameAuthor = prevMsg && prevMsg.uid === msg.uid && msg.createdAt - prevMsg.createdAt < 120000;
            const grouped = groupReactions(msg.reactions || {});

            return (
              <div key={msg.id} style={{ marginBottom: isSameAuthor ? 2 : 12, position:"relative" }}
                onMouseEnter={e => { const actions = e.currentTarget.querySelector('.msg-actions') as HTMLElement; if(actions) actions.style.opacity="1"; }}
                onMouseLeave={e => { const actions = e.currentTarget.querySelector('.msg-actions') as HTMLElement; if(actions) actions.style.opacity="0"; setReactionMenu(null); }}>

                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  {/* Avatar */}
                  {!isSameAuthor ? (
                    msg.authorPhoto ? (
                      <img src={msg.authorPhoto} alt="" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0, marginTop:2 }} />
                    ) : (
                      <div style={{ width:36, height:36, borderRadius:"50%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#000", flexShrink:0, marginTop:2 }}>
                        {(msg.authorName||"A")[0].toUpperCase()}
                      </div>
                    )
                  ) : <div style={{ width:36, flexShrink:0 }} />}

                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Author + time */}
                    {!isSameAuthor && (
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        <a href={`/profile/${msg.uid}`} style={{ fontSize:13, fontWeight:700, color:isOwn?"#34d399":"var(--fg)", textDecoration:"none" }}>{msg.authorName}</a>
                        <span style={{ fontSize:10, color:"var(--sub)" }}>{formatTime(msg.createdAt)}</span>
                        {isAdmin && !isOwn && (
                          <button onClick={() => banUser(msg.uid, msg.authorName)} style={{ background:"rgba(248,113,113,.08)", border:"none", borderRadius:4, padding:"1px 6px", fontSize:9, color:"#f87171", cursor:"pointer", fontFamily:"inherit" }}>Ban</button>
                        )}
                      </div>
                    )}

                    {/* Reply reference */}
                    {msg.replyTo && (
                      <div style={{ background:"rgba(255,255,255,.04)", borderLeft:"2px solid #34d399", borderRadius:"0 6px 6px 0", padding:"4px 10px", marginBottom:6, fontSize:12, color:"var(--sub)" }}>
                        <span style={{ fontWeight:700, color:"var(--fg)" }}>{msg.replyTo.authorName}: </span>
                        {msg.replyTo.text}
                      </div>
                    )}

                    {/* Message content */}
                    {msg.deleted ? (
                      <p style={{ fontSize:14, color:"var(--sub)", fontStyle:"italic", margin:0 }}>This message was deleted.</p>
                    ) : (
                      <>
                        {msg.text && (
                          <p style={{ fontSize:14, color:"var(--fg)", margin:0, lineHeight:1.6, wordBreak:"break-word" as any, whiteSpace:"pre-wrap" as any }}>{msg.text}</p>
                        )}
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="shared" style={{ maxWidth:"100%", maxHeight:300, borderRadius:10, marginTop:6, display:"block", cursor:"pointer" }} onClick={() => window.open(msg.imageUrl,"_blank")} />
                        )}
                      </>
                    )}

                    {/* Reactions display */}
                    {grouped.length > 0 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
                        {grouped.map(([emoji, count]) => (
                          <button key={emoji} onClick={() => reactToMessage(msg.id, emoji)} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:999, padding:"3px 10px", fontSize:13, cursor:"pointer", color:"var(--fg)", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
                            {emoji} <span style={{ fontSize:11, fontWeight:700 }}>{count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message actions (hover) */}
                  {!msg.deleted && (
                    <div className="msg-actions" style={{ display:"flex", gap:4, alignItems:"center", opacity:0, transition:"opacity .15s", flexShrink:0, position:"relative" as any }}>
                      <button onClick={() => { setReactionMenu(reactionMenu===msg.id?null:msg.id); }} title="React" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:6, padding:"4px 7px", cursor:"pointer", fontSize:13, color:"var(--sub)" }}>😊</button>
                      <button onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }} title="Reply" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:6, padding:"4px 7px", cursor:"pointer", fontSize:13, color:"var(--sub)" }}>↩</button>
                      {(isOwn || isAdmin) && (
                        <button onClick={() => deleteMessage(msg.id)} title="Delete" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:6, padding:"4px 7px", cursor:"pointer", fontSize:13, color:"#f87171" }}>🗑</button>
                      )}
                      {isAdmin && (
                        <button onClick={() => pinMessage(msg)} title="Pin" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:6, padding:"4px 7px", cursor:"pointer", fontSize:13, color:"#fbbf24" }}>📌</button>
                      )}

                      {/* Reaction picker */}
                      {reactionMenu === msg.id && (
                        <div style={{ position:"absolute", right:0, bottom:32, background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:8, display:"flex", gap:4, zIndex:100, boxShadow:"0 8px 32px rgba(0,0,0,.4)", flexWrap:"wrap", width:200 }}>
                          {REACTIONS_LIST.map(e => (
                            <button key={e} onClick={() => reactToMessage(msg.id, e)} style={{ background:"transparent", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:20 }}>{e}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", marginTop:4 }}>
              <div style={{ display:"flex", gap:3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", animation:`typingDot 1.2s ${i*.2}s infinite ease-in-out` }} />
                ))}
              </div>
              <span style={{ fontSize:12, color:"var(--sub)" }}>Someone is typing...</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{ background:"var(--nav)", borderTop:"1px solid var(--border)", padding:"12px 20px 16px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          {/* Reply preview */}
          {replyTo && (
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(52,211,153,.06)", border:"1px solid rgba(52,211,153,.2)", borderRadius:8, padding:"8px 12px", marginBottom:10 }}>
              <div style={{ flex:1, fontSize:12, color:"var(--sub)" }}>
                <span style={{ fontWeight:700, color:"#34d399" }}>Replying to {replyTo.authorName}: </span>
                {replyTo.text?.slice(0,80)}
              </div>
              <button onClick={() => setReplyTo(null)} style={{ background:"none", border:"none", color:"var(--sub)", cursor:"pointer", fontSize:16 }}>✕</button>
            </div>
          )}

          {!user ? (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <button onClick={signIn} style={{ background:"#34d399", color:"#000", border:"none", borderRadius:10, padding:"10px 28px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
                Sign in to chat
              </button>
            </div>
          ) : isBanned ? (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <p style={{ color:"#f87171", fontSize:14, margin:0 }}>You have been banned from this room.</p>
            </div>
          ) : !room.isOpen && !isAdmin ? (
            <div style={{ textAlign:"center", padding:"12px 0" }}>
              <p style={{ color:"var(--sub)", fontSize:14, margin:0 }}>This room is closed.</p>
            </div>
          ) : (
            <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
              {/* Image upload */}
              <button onClick={() => imageRef.current?.click()} title="Share image" disabled={imageUploading} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 12px", cursor:"pointer", fontSize:16, color:"var(--sub)", flexShrink:0, lineHeight:1 }}>
                {imageUploading ? "⏳" : "🖼️"}
              </button>
              <input ref={imageRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => e.target.files?.[0] && sendImage(e.target.files[0])} />

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => { setText(e.target.value); handleTyping(); }}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${room.name}... (Enter to send, Shift+Enter for new line)`}
                rows={1}
                style={{ flex:1, background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", fontSize:14, color:"var(--fg)", fontFamily:"inherit", outline:"none", resize:"none" as any, lineHeight:1.5, maxHeight:120, overflowY:"auto" as any }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />

              {/* Send button */}
              <button onClick={sendMessage} disabled={!text.trim() || sending} style={{ background:text.trim()?"#34d399":"rgba(52,211,153,.3)", color:"#000", border:"none", borderRadius:10, padding:"10px 18px", cursor:text.trim()?"pointer":"not-allowed", fontSize:14, fontWeight:800, fontFamily:"inherit", flexShrink:0, transition:"all .15s" }}>
                {sending ? "..." : "Send"}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes typingDot { 0%,80%,100%{transform:scale(0);opacity:.4} 40%{transform:scale(1);opacity:1} }
        .msg-actions { pointer-events: auto; }
      `}</style>
    </div>
  );
}
