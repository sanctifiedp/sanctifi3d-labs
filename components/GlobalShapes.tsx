"use client";
import { useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";

export default function GlobalShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { dark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#34d399","#6366f1","#fbbf24","#f472b6","#38bdf8","#fb923c"];
    const particles = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 15 + Math.random() * 45,
      color: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.015,
      type: i % 3,
    }));

    function hex(ctx: CanvasRenderingContext2D, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        i === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a)) : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      ctx.closePath();
    }

    function tri(ctx: CanvasRenderingContext2D, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = (Math.PI * 2 / 3) * i - Math.PI / 2;
        i === 0 ? ctx.moveTo(r * Math.cos(a), r * Math.sin(a)) : ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      const alpha = dark ? 0.18 : 0.09;

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
        if (p.x < -60) p.x = canvas!.width + 60;
        if (p.x > canvas!.width + 60) p.x = -60;
        if (p.y < -60) p.y = canvas!.height + 60;
        if (p.y > canvas!.height + 60) p.y = -60;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color + "33";
        ctx.lineWidth = 1.8;

        if (p.type === 0) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); }
        else if (p.type === 1) tri(ctx, p.size / 2);
        else hex(ctx, p.size / 2);

        ctx.fill(); ctx.stroke();
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [dark]);

  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }} />;
}
