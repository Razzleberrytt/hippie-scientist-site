import { useEffect, useRef } from 'react';

export default function MeltBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d', { alpha: true })!;
    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const { innerWidth: w, innerHeight: h } = window;
      c.width = Math.floor(w * DPR);
      c.height = Math.floor(h * DPR);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const blobs = Array.from({ length: 4 }).map((_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 180 + Math.random() * 140,
      t: Math.random() * Math.PI * 2,
      s: 0.3 + Math.random() * 0.7,
      hue: (i * 90 + 200) % 360,
    }));

    function frame() {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'lighter';

      for (const b of blobs) {
        b.t += 0.002 * b.s;
        const k = 40;
        const nx = b.x + Math.cos(b.t) * k;
        const ny = b.y + Math.sin(b.t * 0.9) * k;

        const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, b.r);
        grd.addColorStop(0, `hsla(${b.hue}, 85%, 60%, .26)`);
        grd.addColorStop(1, `hsla(${b.hue}, 85%, 60%, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(nx, ny, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <canvas ref={ref} className="block h-full w-full" />
    </div>
  );
}
