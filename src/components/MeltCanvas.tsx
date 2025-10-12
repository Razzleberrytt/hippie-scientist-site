import React, { useEffect, useRef } from "react";

type MeltCanvasProps = { enabled: boolean };

export default function MeltCanvas({ enabled }: MeltCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number>();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const blobs = Array.from({ length: 4 }).map((_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.max(w, h) * (0.25 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      color: [
        "rgba(0, 255, 200, 0.35)",
        "rgba(160, 120, 255, 0.35)",
        "rgba(255, 90, 180, 0.35)",
        "rgba(255, 200, 90, 0.30)",
      ][i % 4],
    }));

    const draw = () => {
      if (!enabled) {
        ctx.clearRect(0, 0, w, h);
        if (raf.current) cancelAnimationFrame(raf.current);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h),
      );
      g.addColorStop(0, "rgba(10,14,18,1)");
      g.addColorStop(1, "rgba(10,14,18,0.6)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
