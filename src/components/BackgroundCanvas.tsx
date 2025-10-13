import { useEffect, useRef } from 'react';
import { MELT_PRESETS, DEFAULT_MELT, type MeltPresetKey } from '@/lib/melt-presets';

type Props = {
  preset?: MeltPresetKey; // default aura
  className?: string;
};

export default function BackgroundCanvas({ preset = DEFAULT_MELT, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { noiseScale, swirl, speed, contrast, palette } = MELT_PRESETS[preset];
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    let raf = 0, t = 0;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement!;
      canvas.width = Math.max(1, w * DPR);
      canvas.height = Math.max(1, h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(DPR, DPR);
    };
    resize();
    const onResize = () => {
      ctx.setTransform(1,0,0,1,0,0);
      resize();
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      const w = canvas.width / DPR, h = canvas.height / DPR;
      t += speed * 0.8;

      // very lightweight “ink” noise / swirl – performant 2D fallback
      const inner = Math.min(w, h) * 0.12 * (0.8 + noiseScale * 0.3);
      const outer = Math.max(w, h) * (0.72 + noiseScale * 0.2);
      const g = ctx.createRadialGradient(w*0.5, h*0.45, inner, w*0.5, h*0.55, outer);
      g.addColorStop(0, palette[0]);
      g.addColorStop(0.5, palette[1]);
      g.addColorStop(1, palette[2]);

      ctx.fillStyle = g;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(0,0,w,h);

      // soft “clouds” layer
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.35 * contrast;
      const bands = Math.max(4, Math.round(4 * noiseScale));
      for (let i=0;i<bands;i++){
        const offset = 120 * (0.75 + noiseScale * 0.25);
        const y = (Math.sin(t*0.6 + i*1.7) * 0.2 + 0.5) * h;
        const grad = ctx.createLinearGradient(0,y-offset,0,y+offset);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, y-(offset+20), w, (offset+20)*2);
      }

      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = 0.45;
      // subtle swirl vignette
      ctx.save();
      ctx.translate(w/2, h/2);
      ctx.rotate(Math.sin(t*0.2) * swirl);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 0, w*0.55, h*0.42, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [preset]);

  return <canvas ref={canvasRef} className={className ?? 'absolute inset-0 -z-10'} />;
}
