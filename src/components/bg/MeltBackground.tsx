import { useEffect, useRef } from "react";

export default function MeltBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const t0Ref = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    const blobs = [
      { x: 0.25, y: 0.35, r: 260, hue: 180 },
      { x: 0.65, y: 0.3, r: 220, hue: 300 },
      { x: 0.5, y: 0.7, r: 300, hue: 120 },
    ];

    const draw = (t: number) => {
      if (!t0Ref.current) t0Ref.current = t;
      const T = (t - t0Ref.current) / 1000;

      ctx.clearRect(0, 0, w, h);
      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "rgba(8,11,15,0.8)");
      grd.addColorStop(1, "rgba(8,11,15,0.9)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < blobs.length; i += 1) {
        const blob = blobs[i];
        const x =
          blob.x * w + Math.sin(T * (0.15 + i * 0.05) + i) * 40;
        const y =
          blob.y * h + Math.cos(T * (0.2 + i * 0.04) + i) * 30;
        const r = blob.r + Math.sin(T * 0.8 + i) * 18;

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `hsla(${blob.hue}, 90%, 62%, 0.35)`);
        g.addColorStop(1, `hsla(${blob.hue}, 90%, 62%, 0.00)`);

        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
