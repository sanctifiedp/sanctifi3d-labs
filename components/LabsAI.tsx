"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { id: string; title: string; category: string }[];
  actions?: { label: string; action: string; data?: any }[];
}

const SUGGESTIONS = [
  "What's hot in Web3 today?",
  "Find me active alpha opportunities",
  "Explain DeFi to a beginner",
  "Write me a tweet about the latest post",
  "Translate the latest news to Pidgin",
  "I need help with something on the site",
];

export default function LabsAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [alphas, setAlphas] = useState<any[]>([]);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subDone, setSubDone] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load posts and alphas for context
    getDocs(query(collection(db, "posts"), where("status", "==", "approved")))
      .then(snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() as any }))));
    getDocs(query(collection(db, "alpha"), where("status", "==", "approved")))
      .then(snap => setAlphas(snap.docs.map(d => ({ id: d.id, ...d.data() as any }))));
    // Stop pulse after 5s
    setTimeout(() => setPulse(false), 5000);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hey! I'm **LabsAI** — your Web3 intelligence assistant powered by Sanctifi3d Labs.\n\nI can help you find alpha opportunities, explain crypto concepts, summarize news, recommend posts, and more.\n\nWhat's on your mind?",
        actions: SUGGESTIONS.map(s => ({ label: s, action: "suggest" }))
      }]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function findRelevantPosts(query: string, limit = 3) {
    const q = query.toLowerCase();
    return posts
      .filter(p => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q))
      .slice(0, limit);
  }

  function findRelevantAlphas(query: string, limit = 3) {
    const q = query.toLowerCase();
    return alphas
      .filter(a => a.title?.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q) || a.audience?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q))
      .slice(0, limit);
  }

  async function handleSubscribe() {
    if (!subscribeEmail.includes("@")) return;
    setSubscribing(true);
    try {
      await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: subscribeEmail }) });
      await addDoc(collection(db, "subscribers"), { email: subscribeEmail, subscribedAt: new Date().toISOString(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
      setSubDone(true);
      setMessages(prev => [...prev, { role: "assistant", content: "🎉 You're subscribed! Welcome to the lab. You'll get updates whenever we publish something hot." }]);
    } catch (e) { console.error(e); }
    setSubscribing(false);
  }

  async function sendMessage(text?: string) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Check for subscribe intent
    if (/subscribe|newsletter|email update|notify me/i.test(userText)) {
      setLoading(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'd love to add you to the Sanctifi3d Labs newsletter! You'll get Web3 news, alpha opportunities and design insights straight to your inbox.\n\nDrop your email below:",
        actions: [{ label: "subscribe_form", action: "subscribe_form" }]
      }]);
      return;
    }

    // Find relevant posts and alphas
    const relevantPosts = findRelevantPosts(userText);
    const relevantAlphas = findRelevantAlphas(userText);
    const isAlphaQuery = /alpha|airdrop|bounty|grant|gig|opportunity|contest|presale|hackathon/i.test(userText);
    const contextAlphas = isAlphaQuery ? alphas.slice(0, 8) : relevantAlphas;

    // Build system context
    const postsContext = posts.slice(0, 15).map(p =>
      `POST [${p.id}]: "${p.title}" | Category: ${p.category} | ${p.content?.replace(/<[^>]+>/g, "").slice(0, 200)}`
    ).join("\n");

    const alphasContext = contextAlphas.map(a =>
      `ALPHA [${a.id}]: "${a.title}" | Type: ${a.type} | Audience: ${a.audience} | ${a.content?.replace(/<[^>]+>/g, "").slice(0, 150)} | Link: ${a.sourceUrl || "N/A"}`
    ).join("\n");

    const systemPrompt = `You are LabsAI, the intelligent assistant for Sanctifi3d Labs (sanctifi3d-labs.vercel.app) — an AI-powered Web3, Crypto, Design and AI Tools intelligence platform built by Sanctifi3d, a graphic designer and Web3 creator from Lagos, Nigeria.

Your personality: Sharp, knowledgeable, Web3-native, encouraging. You speak like an insider — not corporate. You use occasional Web3 slang naturally (WAGMI, LFG, alpha, ape in, etc.) but keep it readable.

Your capabilities:
- Answer Web3, crypto, DeFi, NFT, blockchain questions
- Explain concepts from beginner to advanced level
- Find and recommend alpha opportunities from the platform
- Summarize and recommend posts from Sanctifi3d Labs
- Help users subscribe to the newsletter
- Generate tweets or captions about posts
- Compare cryptocurrencies or projects
- Give market context and education
- Recommend content based on user interests
- Support the Sanctifi3d brand and direct users to relevant content

Current platform content:

RECENT POSTS:
${postsContext}

ALPHA OPPORTUNITIES:
${alphasContext}

Rules:
- Always be helpful and specific
- When recommending posts, reference them by title naturally
- When listing alphas, be specific about what they are and who they're for
- Keep responses concise but complete — no walls of text
- Use line breaks and structure for readability
- If asked about something outside Web3/crypto/design/AI, briefly answer but redirect to your expertise
- If user says 'write me a tweet about [post]', write a punchy tweet under 280 chars with relevant hashtags
- If user says 'translate this' or 'in pidgin/yoruba/igbo/french', translate the last response naturally
- If user has a complaint or support issue (billing, bugs, broken features), be empathetic and tell them to email adeyigbeminiyi414@gmail.com or DM @Sanctifi3d_1 on X. Acknowledge the issue professionally
- If user asks 'what can you do', list ALL your capabilities clearly
- Never make up prices, dates, or facts — say you don't have real-time data if needed
- Always mention that users can find more at sanctifi3d-labs.vercel.app
- If asked to write a tweet, write one that's punchy and under 280 chars
- Format responses with **bold** for emphasis where helpful`;

    const conversationHistory = messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: userText }
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I had trouble with that. Try again?";

      // Find sources to attach
      const sources = [
        ...relevantPosts.map(p => ({ id: p.id, title: p.title, category: p.category, type: "post" })),
        ...relevantAlphas.slice(0, 2).map(a => ({ id: a.id, title: a.title, category: a.type, type: "alpha" }))
      ].slice(0, 3) as any[];

      const assistantMsg: Message = {
        role: "assistant",
        content: reply,
        sources: sources.length > 0 ? sources : undefined,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Network error. Check your connection and try again." }]);
    }
    setLoading(false);
  }

  function formatText(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <>
      <style>{`
        @keyframes labsPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,.4); }
          50% { box-shadow: 0 0 0 12px rgba(52,211,153,0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0); opacity: .5; }
          40% { transform: scale(1); opacity: 1; }
        }
        .labs-input:focus { outline: none; border-color: rgba(52,211,153,.5) !important; }
        .labs-msg a { color: #34d399; }
        .suggestion-chip:hover { background: rgba(52,211,153,.15) !important; border-color: rgba(52,211,153,.4) !important; }
        .source-card:hover { border-color: rgba(52,211,153,.4) !important; background: rgba(52,211,153,.06) !important; }
      `}</style>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 80, left: 20, zIndex: 998,
          width: 56, height: 56, borderRadius: "50%",
          background: open ? "#1a1a2e" : "linear-gradient(135deg, #34d399, #059669)",
          border: open ? "2px solid #34d399" : "none",
          color: "#fff", fontSize: 24, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(52,211,153,.35)",
          animation: pulse && !open ? "labsPulse 2s infinite" : "none",
          transition: "all .3s"
        }}
        title="Ask LabsAI"
      >
        {open ? "✕" : "✦"}
      </button>

      {/* UNREAD BADGE */}
      {!open && (
        <div style={{
          position: "fixed", bottom: 126, left: 54, zIndex: 999,
          background: "#34d399", color: "#000", fontSize: 10, fontWeight: 900,
          borderRadius: 999, padding: "2px 7px", pointerEvents: "none"
        }}>AI</div>
      )}

      {/* CHAT PANEL */}
      {open && (
        <div style={{
          position: "fixed", bottom: 148, left: 12, right: 12,
          maxWidth: 420, margin: "0 auto",
          zIndex: 997, animation: "slideUp .25s ease",
          display: "flex", flexDirection: "column",
          height: "min(600px, calc(100vh - 180px))",
          background: "var(--nav)", border: "1px solid var(--border)",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,.4)"
        }}>

          {/* HEADER */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, rgba(52,211,153,.08), transparent)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✦</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 15, color: "var(--fg)", margin: 0 }}>LabsAI</p>
              <p style={{ fontSize: 11, color: "#34d399", margin: 0, fontWeight: 600 }}>● Online — Sanctifi3d Labs</p>
            </div>
            <button onClick={() => setMessages([])} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--sub)", cursor: "pointer", fontSize: 12 }}>Clear</button>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", padding: "11px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg,#34d399,#059669)" : "var(--card)",
                  border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                  color: msg.role === "user" ? "#000" : "var(--fg)",
                  fontSize: 14, lineHeight: 1.7
                }}>
                  <div className="labs-msg" dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} />
                </div>

                {/* SUGGESTION CHIPS */}
                {msg.actions && msg.actions[0]?.action === "suggest" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, maxWidth: "100%" }}>
                    {msg.actions.map((a, j) => (
                      <button key={j} onClick={() => sendMessage(a.label)} className="suggestion-chip"
                        style={{ fontSize: 12, padding: "6px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 999, color: "var(--fg)", cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* SUBSCRIBE FORM */}
                {msg.actions && msg.actions[0]?.action === "subscribe_form" && !subDone && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, width: "100%", maxWidth: 340 }}>
                    <input type="email" placeholder="your@email.com" value={subscribeEmail} onChange={e => setSubscribeEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                      style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                    <button onClick={handleSubscribe} disabled={subscribing}
                      style={{ background: "#34d399", color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                      {subscribing ? "..." : "Join"}
                    </button>
                  </div>
                )}

                {/* SOURCES */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{ marginTop: 10, width: "100%", maxWidth: 340 }}>
                    <p style={{ fontSize: 11, color: "var(--sub)", marginBottom: 6, fontWeight: 700 }}>📚 Read more on Sanctifi3d Labs</p>
                    {msg.sources.map((s: any, j: number) => (
                      <a key={j} href={s.type === "alpha" ? `/alpha` : `/post/${s.id}`}
                        className="source-card"
                        style={{ display: "block", padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 6, textDecoration: "none", transition: "all .2s" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--fg)", margin: 0 }}>{s.title?.slice(0, 55)}{s.title?.length > 55 ? "..." : ""}</p>
                        <p style={{ fontSize: 11, color: "#34d399", margin: "2px 0 0", fontWeight: 600 }}>{s.category}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div style={{ padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: `typingDot 1.2s ${i * .2}s infinite ease-in-out` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
            <input
              ref={inputRef}
              className="labs-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything Web3..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--card)", color: "var(--fg)", fontSize: 14, fontFamily: "inherit", transition: "border .2s" }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{ width: 40, height: 40, borderRadius: "50%", background: input.trim() ? "#34d399" : "var(--card)", border: "1px solid var(--border)", color: input.trim() ? "#000" : "var(--sub)", cursor: input.trim() ? "pointer" : "default", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>
              ↑
            </button>
          </div>

          {/* FOOTER */}
          <div style={{ padding: "6px 16px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 10, color: "var(--sub)", margin: 0 }}>Powered by <span style={{ color: "#34d399", fontWeight: 700 }}>Sanctifi3d Labs</span> × Groq AI</p>
          </div>
        </div>
      )}
    </>
  );
}
