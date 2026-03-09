"use client";
import { ThemeProvider } from "../lib/ThemeContext";
import Navbar from "../components/Navbar";
import GlobalShapes from "../components/GlobalShapes";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="AI-powered Web3 and crypto news, alpha opportunities, graphic design resources and AI tool updates." />
        <meta name="keywords" content="Web3, Crypto, Blockchain, NFT, DeFi, Airdrop, Graphic Design, AI Tools, Sanctifi3d" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Sanctifi3d Labs" />
        <meta property="og:title" content="Sanctifi3d Labs — Web3, Crypto, Design & AI Intelligence" />
        <meta property="og:description" content="AI-powered Web3 and crypto news, alpha opportunities, and design resources." />
        <meta property="og:image" content="https://sanctifi3d-labs.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@Sanctifi3d_1" />
        <meta name="twitter:title" content="Sanctifi3d Labs" />
        <meta name="twitter:description" content="AI-powered Web3 and crypto news and alpha opportunities." />
        <meta name="twitter:image" content="https://sanctifi3d-labs.vercel.app/og-image.png" />
        <title>Sanctifi3d Labs — Web3, Crypto, Design & AI Intelligence</title>
      </head>
      <body>
        <ThemeProvider>
          <GlobalShapes />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}