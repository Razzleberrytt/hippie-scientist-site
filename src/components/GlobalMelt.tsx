import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function MeltCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d", { alpha: true })!;
    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = Math.floor(w * DPR);
      c.height = Math.floor(h * DPR);
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // soft blobby gradient “melt”
    const blobs = Array.from({ length: 4 }).map((_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 180 + Math.random() * 140,
      t: Math.random() * Math.PI * 2,
      s: 0.35 + Math.random() * 0.65,
      hue: (i * 90 + 200) % 360,
    }));

    const frame = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        b.t += 0.002 * b.s;
        const nx = b.x + Math.cos(b.t) * 40;
        const ny = b.y + Math.sin(b.t * 0.9) * 40;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, b.r);
        g.addColorStop(0, `hsla(${b.hue},85%,60%,.26)`);
        g.addColorStop(1, `hsla(${b.hue},85%,60%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(nx, ny, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      id="melt-layer"
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
    >
      <canvas ref={ref} className="block h-full w-full" />
    </div>
  );
}

export default function GlobalMelt() {
  // mount into <body> so routes/stacking can’t hide it
  return createPortal(<MeltCanvas />, document.body);
}
