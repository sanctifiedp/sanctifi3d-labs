"use client";
import { useState, useEffect, useRef } from "react";

const COINS = [
  { id: "bitcoin", symbol: "BTC", color: "#f7931a" },
  { id: "ethereum", symbol: "ETH", color: "#627eea" },
  { id: "solana", symbol: "SOL", color: "#9945ff" },
  { id: "bnb", symbol: "BNB", color: "#f3ba2f" },
  { id: "the-open-network", symbol: "TON", color: "#0088cc" },
  { id: "chainlink", symbol: "LINK", color: "#375bd2" },
  { id: "matic-network", symbol: "MATIC", color: "#8247e5" },
  { id: "avalanche-2", symbol: "AVAX", color: "#e84142" },
];

export default function CryptoTicker() {
  const [prices, setPrices] = useState<Record<string, { usd: number; usd_24h_change: number }>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const ids = COINS.map(c => c.id).join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { next: { revalidate: 60 } }
        );
        const data = await res.json();
        setPrices(data);
        setError(false);
      } catch {
        setError(true);
      }
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const items = COINS.filter(c => prices[c.id]);
  if (error || items.length === 0) return null;

  const tickerItems = [...items, ...items]; // duplicate for seamless loop

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: "rgba(8,8,8,.95)", borderBottom: "1px solid rgba(255,255,255,.06)",
      backdropFilter: "blur(12px)", height: 32, overflow: "hidden",
      display: "flex", alignItems: "center"
    }}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          animation: ticker 30s linear infinite;
          width: max-content;
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Label */}
      <div style={{
        padding: "0 12px", fontSize: 10, fontWeight: 800,
        color: "#34d399", letterSpacing: ".08em", whiteSpace: "nowrap",
        borderRight: "1px solid rgba(255,255,255,.08)", height: "100%",
        display: "flex", alignItems: "center", background: "rgba(52,211,153,.06)"
      }}>
        ◉ LIVE
      </div>

      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track">
          {tickerItems.map((coin, i) => {
            const data = prices[coin.id];
            const change = data?.usd_24h_change ?? 0;
            const positive = change >= 0;
            return (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "0 20px", fontSize: 12, whiteSpace: "nowrap",
                borderRight: "1px solid rgba(255,255,255,.04)"
              }}>
                <span style={{ fontWeight: 800, color: coin.color }}>{coin.symbol}</span>
                <span style={{ color: "#ffffff", fontWeight: 700 }}>
                  ${data?.usd?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span style={{ color: positive ? "#34d399" : "#f87171", fontSize: 11 }}>
                  {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
