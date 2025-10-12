import { useEffect, useRef } from "react";

/**
 * Fullscreen animated background (WebGL or 2D fallback).
 * - Sits behind all content: fixed, -z-10, pointer-events-none
 * - Pauses if prefers-reduced-motion = reduce
 */
export default function TrippyBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let raf = 0;
    let t = 0;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paused = () => media.matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth, innerHeight } = window;
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const palette = ["#6ee7ff", "#c084fc", "#22d3ee", "#4ade80", "#f472b6"];

    const loop = () => {
      if (!paused()) {
        const { innerWidth, innerHeight } = window;
        context.clearRect(0, 0, innerWidth, innerHeight);

        for (let i = 0; i < 6; i += 1) {
          const radius = 220 + 80 * Math.sin(t / 6000 + i);
          const x = innerWidth * (0.5 + 0.45 * Math.sin(t / 4000 + i * 1.3));
          const y = innerHeight * (0.5 + 0.45 * Math.cos(t / 5000 + i * 0.9));
          const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
          const color = palette[i % palette.length];
          gradient.addColorStop(0, `${color}cc`);
          gradient.addColorStop(0.5, `${color}33`);
          gradient.addColorStop(1, "#00000000");
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }

        context.globalCompositeOperation = "screen";
        for (let y = 0; y < innerHeight; y += 3) {
          const alpha = 0.02 + 0.02 * Math.sin(t / 1000 + y * 0.01);
          context.fillStyle = `rgba(255,255,255,${alpha})`;
          context.fillRect(0, y, innerWidth, 1);
        }
        context.globalCompositeOperation = "source-over";
      }

      t = performance.now();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}

