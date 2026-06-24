import { MeltEffect } from '../types';

function fade(ctx: CanvasRenderingContext2D, w: number, h: number, a = 0.08) {
  ctx.fillStyle = `rgba(2,6,23,${a})`;
  ctx.fillRect(0, 0, w, h);
}

let gradient: CanvasGradient | undefined;

export const AuraEffect: MeltEffect = {
  init(ctx, w, h) {
    gradient = ctx.createRadialGradient(
      w * 0.5,
      h * 0.45,
      0,
      w * 0.5,
      h * 0.45,
      Math.max(w, h) * 0.7,
    );
    gradient.addColorStop(0, 'rgba(56,189,248,0.25)');
    gradient.addColorStop(0.5, 'rgba(168,85,247,0.25)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'source-over';
  },
  frame(ctx, w, h, t) {
    fade(ctx, w, h);
    const cx = w * 0.5 + Math.cos(t * 0.3) * w * 0.08;
    const cy = h * 0.45 + Math.sin(t * 0.27) * h * 0.06;

    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 5; i++) {
      const r = (Math.sin(t * 0.6 + i) * 0.5 + 0.5) * 120 + 60 + i * 8;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      if (!gradient) {
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
        gradient.addColorStop(0, 'rgba(56,189,248,0.25)');
        gradient.addColorStop(0.5, 'rgba(168,85,247,0.25)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
      }
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    ctx.restore();
  },
  dispose() {
    gradient = undefined;
  },
};
