'use client';
import { useEffect, useRef } from 'react';
import { EFFECTS, DEFAULT_EFFECT, type MeltEffectKey } from '@/lib/melt-effects';

export default function BackgroundStage({ effect = DEFAULT_EFFECT }: { effect?: MeltEffectKey }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let last = performance.now();

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.max(1, w * DPR);
      canvas.height = Math.max(1, h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      EFFECTS[effect].init?.(ctx, w, h);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const loop = (now: number) => {
      t += (now - last) / 16.666;
      last = now;
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      EFFECTS[effect].frame(ctx, w, h, t);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [effect]);

  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden />;
}
