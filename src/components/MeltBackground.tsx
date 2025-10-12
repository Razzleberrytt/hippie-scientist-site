import { useEffect, useRef } from 'react';

export default function MeltBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = c.getContext('2d')!;
    let w = (c.width = innerWidth * dpr);
    let h = (c.height = innerHeight * dpr);
    c.style.width = '100%';
    c.style.height = '100%';

    const blobs = Array.from({ length: 3 }).map((_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.min(w, h) * (0.25 + i * 0.05)) | 0,
      a: Math.random() * Math.PI * 2,
      s: 0.0006 + i * 0.0003,
    }));

    const colors = [
      'rgba(105,180,255,0.18)',
      'rgba(161,132,255,0.16)',
      'rgba(102,255,204,0.14)',
    ];

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'blur(80px)';
      blobs.forEach((b, i) => {
        b.a += b.s;
        const x = b.x + Math.cos(b.a) * 140 * dpr;
        const y = b.y + Math.sin(b.a) * 120 * dpr;
        const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, colors[i]);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      w = (c.width = innerWidth * dpr);
      h = (c.height = innerHeight * dpr);
      c.style.width = '100%';
      c.style.height = '100%';
    };

    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className='pointer-events-none fixed inset-0 -z-10 opacity-90'
    />
  );
}
