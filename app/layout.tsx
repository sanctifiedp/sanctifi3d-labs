import PWARegister from "../components/PWARegister";
import type { Metadata } from "next";
import { ThemeProvider } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";
import GlobalShapes from "../components/GlobalShapes";
import AdSense from "./adsense";
import CryptoTicker from "../components/CryptoTicker";
import BackToTop from "../components/BackToTop";
import LabsAI from "../components/LabsAI";
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
      <head>
        <meta name="google-adsense-account" content="ca-pub-2613718694144871" />
        <meta name="google-site-verification" content="gzTbfqeoulhdJOI_6g0Keb5X-5tAaVLfXwJ5B47572c" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="S3D Labs" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#34d399" />
      </head>
      <PWARegister />
      <body>
        <ThemeProvider>
          <CryptoTicker />
          <GlobalShapes />
          <AdSense />
          <Navbar />
          {children}
          <BackToTop />
          <LabsAI />
        </ThemeProvider>
      </body>
    </html>
  );
}