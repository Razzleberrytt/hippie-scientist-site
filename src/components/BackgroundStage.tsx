'use client';
import { useEffect, useRef, useState } from 'react';
import { EFFECTS, DEFAULT_EFFECT, MeltEffectKey } from '@/lib/melt-effects';

export default function BackgroundStage({ effect = DEFAULT_EFFECT }: { effect?: MeltEffectKey }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    let raf = 0;
    try {
      const canvas = ref.current!;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) throw new Error('2D context unavailable');
      const DPR = Math.min(window.devicePixelRatio || 1, 2);

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.max(1, w * DPR);
        canvas.height = Math.max(1, h * DPR);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        EFFECTS?.[effect]?.init?.(ctx, w, h);
      };
      resize();
      window.addEventListener('resize', resize);

      let t = 0;
      let last = performance.now();
      const loop = (now: number) => {
        const dt = now - last;
        last = now;
        t += dt * 0.06;
        try {
          const w = canvas.width / DPR;
          const h = canvas.height / DPR;
          const fx = EFFECTS?.[effect];
          if (fx?.frame) fx.frame(ctx, w, h, t);
        } catch (e) {
          console.error('Melt effect error:', e);
          setOk(false);
          cancelAnimationFrame(raf);
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
      };
    } catch (err) {
      console.error('BackgroundStage init error:', err);
      setOk(false);
    }
  }, [effect]);

  if (!ok) {
    return (
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-indigo-900/70 via-cyan-900/70 to-slate-900/70"
        aria-hidden
      />
    );
  }

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden
    />
  );
}
