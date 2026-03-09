"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";

export default function FloatingShapes() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const { dark } = useTheme();

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let animId: number;

    function resize() {
      c!.width = window.innerWidth;
      c!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#34d399","#6366f1","#fbbf24","#f472b6","#38bdf8"];
    const shapes = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 50,
      color: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      type: Math.floor(Math.random() * 3), // 0=circle, 1=triangle, 2=hexagon
      opacity: 0.12 + Math.random() * 0.15,
    }));

    function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
                : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      }
      ctx.closePath();
    }

    function drawTri(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 / 3) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a))
                : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      }
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, c!.width, c!.height);
      shapes.forEach(s => {
        s.x += s.vx; s.y += s.vy; s.rotation += s.rotSpeed;
        if (s.x < -80) s.x = c!.width + 80;
        if (s.x > c!.width + 80) s.x = -80;
        if (s.y < -80) s.y = c!.height + 80;
        if (s.y > c!.height + 80) s.y = -80;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.globalAlpha = dark ? s.opacity : s.opacity * 0.6;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = s.color + "22";

        if (s.type === 0) {
          ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        } else if (s.type === 1) {
          drawTri(ctx, 0, 0, s.size / 2); ctx.fill(); ctx.stroke();
        } else {
          drawHex(ctx, 0, 0, s.size / 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [dark]);

  return (
    <canvas ref={canvas} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />
  );
}
