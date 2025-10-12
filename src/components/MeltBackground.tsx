import { useEffect, useRef } from "react";

export default function MeltBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const ctx = c.getContext("2d")!;
    let raf = 0,
      t = 0;

    function resize() {
      const { innerWidth: w, innerHeight: h } = window;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.25, y: 0.35, r: 220, hue: 195, dx: 0.12, dy: 0.07 },
      { x: 0.75, y: 0.45, r: 260, hue: 300, dx: -0.09, dy: 0.05 },
      { x: 0.5, y: 0.8, r: 240, hue: 140, dx: 0.06, dy: -0.08 },
    ];

    function draw() {
      const { innerWidth: w, innerHeight: h } = window;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.2,
        0,
        w * 0.5,
        h * 0.2,
        Math.max(w, h),
      );
      g.addColorStop(0, "rgba(0,0,0,0.45)");
      g.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b, i) => {
        const x = b.x * w + Math.sin(t * b.dx + i) * 40;
        const y = b.y * h + Math.cos(t * b.dy + i) * 40;
        const rad = b.r;

        const bg = ctx.createRadialGradient(x, y, 0, x, y, rad);
        bg.addColorStop(0, `hsla(${b.hue}, 85%, 60%, 0.35)`);
        bg.addColorStop(1, `hsla(${b.hue}, 85%, 60%, 0.0)`);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      t += 0.008;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      id="melt-bg"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden"
      style={{ contain: "strict" }}
      aria-hidden="true"
    >
      <canvas ref={ref} id="melt-canvas" className="h-full w-full select-none" />
    </div>
  );
}
