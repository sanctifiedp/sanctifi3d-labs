import type { Metadata } from "next";
import { ThemeProvider } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";
import GlobalShapes from "../components/GlobalShapes";
import AdSense from "./adsense";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanctifi3d Labs — Web3, Crypto, Design & AI Intelligence",
  description: "AI-powered Web3 and crypto news, alpha opportunities, graphic design resources and AI tool updates.",
  keywords: ["Web3", "Crypto", "Blockchain", "NFT", "DeFi", "Airdrop", "Graphic Design", "AI Tools"],
  openGraph: {
    type: "website",
    siteName: "Sanctifi3d Labs",
    title: "Sanctifi3d Labs — Web3, Crypto, Design & AI Intelligence",
    description: "AI-powered Web3 and crypto news, alpha opportunities, and design resources.",
    images: [{ url: "https://sanctifi3d-labs.vercel.app/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@Sanctifi3d_1",
    title: "Sanctifi3d Labs",
    description: "AI-powered Web3 and crypto news and alpha opportunities.",
    images: ["https://sanctifi3d-labs.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <GlobalShapes />
          <AdSense />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}