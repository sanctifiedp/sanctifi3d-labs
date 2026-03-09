import type { Metadata } from "next";
import { ThemeProvider } from "../lib/ThemeContext";
import GlobalShapes from "../components/GlobalShapes";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Sanctifi3d Labs — Web3, Crypto, Design & AI",
  description: "Human insight meets AI-powered news aggregation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin:0, padding:0 }}>
        <ThemeProvider>
          <div style={{ background:"var(--bg)", color:"var(--fg)", minHeight:"100vh", transition:"background .3s, color .3s", position:"relative" }}>
            <GlobalShapes />
            <Navbar />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
