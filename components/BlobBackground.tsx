"use client";
import { useTheme } from "../lib/ThemeContext";

export default function BlobBackground() {
  const { dark } = useTheme();
  return (
    <>
      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(.95)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,30px) scale(1.08)} 66%{transform:translate(30px,-40px) scale(.92)} }
        @keyframes blob3 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,50px) scale(1.05)} 66%{transform:translate(-40px,-20px) scale(.98)} }
        .blob { position:fixed; border-radius:50%; filter:blur(80px); opacity:${dark?.15:.08}; pointer-events:none; z-index:0; }
      `}</style>
      <div className="blob" style={{ width:500, height:500, background:"#34d399", top:"-150px", left:"-100px", animation:"blob1 12s ease-in-out infinite" }} />
      <div className="blob" style={{ width:400, height:400, background:"#6366f1", top:"40%", right:"-120px", animation:"blob2 15s ease-in-out infinite" }} />
      <div className="blob" style={{ width:350, height:350, background:"#f59e0b", bottom:"-100px", left:"30%", animation:"blob3 10s ease-in-out infinite" }} />
    </>
  );
}
