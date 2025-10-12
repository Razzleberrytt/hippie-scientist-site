import { useEffect, useRef, type CSSProperties } from "react";

const wrapperStyle: CSSProperties = {
  position: "fixed",
  inset: "env(safe-area-inset-top) 0 0 0",
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  pointerEvents: "none",
  zIndex: 0,
  WebkitTransform: "translateZ(0)",
  transform: "translateZ(0)",
  willChange: "transform, opacity",
};

const canvasStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  maxWidth: "100vw",
  maxHeight: "100vh",
  pointerEvents: "none",
  display: "block",
};

export default function MeltBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      c.width = Math.round(window.innerWidth * dpr);
      c.height = Math.round(window.innerHeight * dpr);
      c.style.width = "100vw";
      c.style.height = "100vh";
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = Array.from({ length: 3 }).map((_, i) => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.min(c.width, c.height) * (0.22 + i * 0.06),
      a: Math.random() * Math.PI * 2,
      s: 0.0007 + i * 0.00035,
    }));
    const colors = [
      "rgba(105,180,255,0.18)",
      "rgba(161,132,255,0.16)",
      "rgba(102,255,204,0.14)",
    ];

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.filter = "blur(80px)";
      blobs.forEach((b, i) => {
        b.a += b.s;
        const x = b.x + Math.cos(b.a) * 140 * dpr;
        const y = b.y + Math.sin(b.a) * 120 * dpr;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, colors[i]);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={wrapperStyle} aria-hidden>
      <canvas ref={ref} style={canvasStyle} className="opacity-90" />
    </div>
  );
}
