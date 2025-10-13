'use client';
import { useEffect, useRef, useState } from 'react';
import { MeltEngine } from '@/lib/melt/engine';
import { EFFECTS, DEFAULT_EFFECT, type MeltKey } from '@/lib/melt/effects';

export default function BackgroundStage({ effect = DEFAULT_EFFECT as MeltKey }: { effect?: MeltKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dispose: (() => void) | undefined;

    try {
      const engine = new MeltEngine(EFFECTS, effect, (error) => {
        console.error('[Melt] effect error', error);
        setFailed(true);
        dispose?.();
        dispose = undefined;
      });
      dispose = engine.mount(canvas);
    } catch (error) {
      console.error('[Melt] init error', error);
      setFailed(true);
    }

    return () => dispose?.();
  }, [effect]);

  if (failed) {
    return (
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-950 via-slate-950 to-black"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
