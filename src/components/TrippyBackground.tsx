import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function AuroraCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const paused = () => Boolean(mediaQuery?.matches);

    const resize = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const colors = ["#6ee7ff", "#c084fc", "#22d3ee", "#4ade80", "#f472b6"];

    const draw = (time: number) => {
      const { innerWidth, innerHeight } = window;
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      for (let i = 0; i < 6; i += 1) {
        const radius = 220 + 80 * Math.sin(time / 6000 + i);
        const x = innerWidth * (0.5 + 0.45 * Math.sin(time / 4000 + i * 1.3));
        const y = innerHeight * (0.5 + 0.45 * Math.cos(time / 5000 + i * 0.9));
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const color = colors[i % colors.length];
        gradient.addColorStop(0, `${color}cc`);
        gradient.addColorStop(0.5, `${color}33`);
        gradient.addColorStop(1, "#00000000");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0;
    const loop = () => {
      if (!paused()) {
        draw(performance.now());
      }
      raf = window.requestAnimationFrame(loop);
    };

    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden={true} className="pointer-events-none fixed inset-0 -z-30" />;
}

export default function TrippyBackground() {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setMountNode(document.getElementById("bg-root"));
  }, []);

  if (!mountNode) return null;

  return createPortal(
    <>
      <AuroraCanvas />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)] mix-blend-screen"
      />
    </>,
    mountNode,
  );
}

