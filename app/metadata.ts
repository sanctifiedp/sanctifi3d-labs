import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: {
    default: "Sanctifi3d Labs — Web3, Crypto, Design & AI Intelligence",
    template: "%s | Sanctifi3d Labs",
  },
  description: "AI-powered Web3 and crypto news, alpha opportunities, graphic design resources and AI tool updates — curated by Sanctifi3d.",
  keywords: ["Web3", "Crypto", "Blockchain", "NFT", "DeFi", "Airdrop", "Graphic Design", "AI Tools", "Sanctifi3d"],
  authors: [{ name: "Sanctifi3d", url: "https://x.com/Sanctifi3d_1" }],
  creator: "Sanctifi3d",
  metadataBase: new URL("https://sanctifi3d-labs.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sanctifi3d-labs.vercel.app",
    siteName: "Sanctifi3d Labs",
    title: "Sanctifi3d Labs — Web3, Crypto, Design & AI Intelligence",
    description: "AI-powered Web3 and crypto news, alpha opportunities, and design resources.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sanctifi3d Labs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanctifi3d Labs",
    description: "AI-powered Web3 and crypto news, alpha opportunities, and design resources.",
    creator: "@Sanctifi3d_1",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};
