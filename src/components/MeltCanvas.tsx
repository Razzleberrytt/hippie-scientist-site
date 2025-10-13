import { useEffect, useRef } from "react";
import type { MeltPalette, MeltIntensity } from "@/melt/useMelt";

const PALETTES: Record<MeltPalette, string[]> = {
  ocean: ["#00d1ff", "#0066ff", "#00ffaa"],
  amethyst: ["#b388ff", "#8a4fff", "#ff00d9"],
  aura: ["#00ffaa", "#33ddff", "#ff66ff"],
  forest: ["#7ef0a0", "#1faa59", "#00ffb2"],
};

const SPEED: Record<MeltIntensity, number> = {
  low: 0.2,
  med: 0.5,
  high: 1.1,
};

export default function MeltCanvas({
  enabled,
  palette,
  intensity,
}: {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const colors = PALETTES[palette];
    let t = 0;
    const sp = SPEED[intensity];

    const draw = () => {
      t += sp;
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.5;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < colors.length; i++) {
        const r = (Math.sin(t / (100 + i * 40)) * 0.5 + 0.5) * 300 + 200;
        const grad = ctx.createRadialGradient(
          cx + Math.sin(t / (70 + i * 20) + i) * 300,
          cy + Math.cos(t / (80 + i * 25) + i) * 200,
          100,
          cx,
          cy,
          r
        );
        grad.addColorStop(0, `${colors[i]}AA`);
        grad.addColorStop(1, `${colors[i]}00`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };

    if (enabled) raf.current = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, width, height);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [enabled, palette, intensity]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 -z-10 pointer-events-none transition-opacity duration-700"
      style={{
        opacity: enabled ? 1 : 0,
        background: "radial-gradient(circle at 50% 50%, #00000000 0%, #000000FF 100%)",
      }}
    />
  );
}
