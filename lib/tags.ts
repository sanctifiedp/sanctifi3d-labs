export const TAG_COLORS: Record<string, string> = {
  bitcoin: "#f7931a", ethereum: "#627eea", solana: "#9945ff",
  defi: "#34d399", nft: "#f472b6", airdrop: "#fbbf24",
  web3: "#38bdf8", dao: "#a78bfa", layer2: "#fb923c",
  design: "#f472b6", ai: "#38bdf8", crypto: "#fbbf24",
  gaming: "#4ade80", metaverse: "#c084fc", grants: "#34d399",
};

export function getTagColor(tag: string): string {
  return TAG_COLORS[tag.toLowerCase()] || "#6b7280";
}
