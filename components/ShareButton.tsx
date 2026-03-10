"use client";
import { useState } from "react";

interface Props {
  title: string;
  excerpt: string;
  url: string;
  type?: "post" | "alpha";
}

export default function ShareButton({ title, excerpt, url, type = "post" }: Props) {
  const [state, setState] = useState<"idle"|"loading"|"copied"|"shared">("idle");
  const [hook, setHook] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  async function generateHook() {
    setState("loading");
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "user",
            content: `Write a single punchy, hooking social media caption (max 200 chars) for sharing this ${type === "alpha" ? "Web3 opportunity" : "article"}. No hashtags yet. Just the hook sentence.\n\nTitle: ${title}\nSummary: ${excerpt?.replace(/<[^>]+>/g,"").slice(0,200)}`
          }],
          max_tokens: 80
        })
      });
      const data = await res.json();
      const generated = data.choices?.[0]?.message?.content?.trim() || title;
      setHook(generated);
      setState("idle");
      setShowPanel(true);
    } catch {
      setHook(title);
      setState("idle");
      setShowPanel(true);
    }
  }

  const shareText = `${hook || title}\n\n${url}\n\nvia @Sanctifi3d_1`;
  const tweetText = `${hook || title}\n\n${url} via @Sanctifi3d_1 #Web3 #Crypto`;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: hook || title, url });
        setState("shared");
        setTimeout(() => setState("idle"), 2500);
      } catch {}
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareText);
    setState("copied");
    setTimeout(() => { setState("idle"); }, 2500);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={generateHook}
        disabled={state === "loading"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "9px 18px", fontSize: 13,
          color: "var(--fg)", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          transition: "all .2s"
        }}
      >
        {state === "loading" ? (
          <><span style={{ animation: "spin 1s linear infinite", display:"inline-block" }}>✦</span> Generating hook...</>
        ) : state === "copied" ? (
          <>✓ Copied!</>
        ) : state === "shared" ? (
          <>✓ Shared!</>
        ) : (
          <>🔗 Share</>
        )}
      </button>

      {showPanel && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
          padding: "20px"
        }} onClick={() => setShowPanel(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--nav)", border: "1px solid var(--border)",
            borderRadius: 20, padding: "24px", width: "100%", maxWidth: 520,
            marginBottom: 20
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--fg)" }}>✦ Share this {type === "alpha" ? "opportunity" : "post"}</h3>
              <button onClick={() => setShowPanel(false)} style={{ background: "none", border: "none", color: "var(--sub)", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            {/* HOOK PREVIEW */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 6, fontWeight: 600 }}>AI-Generated Hook</p>
              <p style={{ fontSize: 14, color: "var(--fg)", lineHeight: 1.7, margin: 0 }}>{hook}</p>
              <p style={{ fontSize: 12, color: "#34d399", marginTop: 8, wordBreak: "break-all" }}>{url}</p>
            </div>

            {/* SHARE OPTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {/* X / Twitter */}
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                target="_blank"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#000", color: "#fff", borderRadius: 10, padding: "12px",
                  fontSize: 14, fontWeight: 700, textDecoration: "none", border: "1px solid #333"
                }}
              >
                𝕏 Tweet it
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#25D366", color: "#fff", borderRadius: 10, padding: "12px",
                  fontSize: 14, fontWeight: 700, textDecoration: "none"
                }}
              >
                💬 WhatsApp
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(hook||title)}`}
                target="_blank"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#0088cc", color: "#fff", borderRadius: 10, padding: "12px",
                  fontSize: 14, fontWeight: 700, textDecoration: "none"
                }}
              >
                ✈️ Telegram
              </a>

              {/* Copy */}
              <button
                onClick={copyLink}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "var(--card)", color: "var(--fg)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                {state === "copied" ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>

            {/* Native share on mobile */}
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={nativeShare}
                style={{
                  width: "100%", background: "#34d399", color: "#000", border: "none",
                  borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                📤 Share via Phone
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
