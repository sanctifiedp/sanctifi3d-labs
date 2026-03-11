"use client";
import { useState } from "react";

export default function AISummary({ title, content }: { title: string; content: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function summarize() {
    if (summary) { setOpen(true); return; }
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Summarize this article in 3 clear bullet points. Be concise and capture the key takeaways.\n\nTitle: ${title}\n\nContent: ${content?.replace(/<[^>]+>/g, "").slice(0, 2000)}`
          }],
          max_tokens: 200
        })
      });
      const data = await res.json();
      setSummary(data.choices?.[0]?.message?.content || "Could not generate summary.");
    } catch { setSummary("Failed to generate summary. Try again."); }
    setLoading(false);
  }

  return (
    <div style={{ margin: "24px 0" }}>
      <button onClick={summarize} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 700, color: "#34d399", cursor: "pointer", fontFamily: "inherit" }}>
        ✦ {loading ? "Summarizing..." : "AI Summary"}
      </button>

      {open && (
        <div style={{ marginTop: 12, background: "var(--card)", border: "1px solid rgba(52,211,153,.2)", borderRadius: 12, padding: "16px 20px", position: "relative" }}>
          <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "var(--sub)", cursor: "pointer", fontSize: 16 }}>✕</button>
          <p style={{ fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 10 }}>✦ AI SUMMARY</p>
          {loading ? (
            <div style={{ display: "flex", gap: 5 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", animation: `typingDot 1.2s ${i*.2}s infinite ease-in-out` }} />)}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.8, whiteSpace: "pre-line" }}>{summary}</div>
          )}
          <style>{`@keyframes typingDot { 0%,80%,100%{transform:scale(0);opacity:.5} 40%{transform:scale(1);opacity:1} }`}</style>
        </div>
      )}
    </div>
  );
}
