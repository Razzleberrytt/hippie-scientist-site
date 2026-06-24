import { MeltEffect } from '../types';

function clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#0b1220');
  grd.addColorStop(1, '#070b14');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

export const NebulaEffect: MeltEffect = {
  init(ctx) {
    ctx.globalCompositeOperation = 'source-over';
  },
  frame(ctx, w, h, t) {
    clear(ctx, w, h);
    const cx = w * 0.5;
    const cy = h * 0.55;
    for (let i = 0; i < 80; i++) {
      const a = t * 0.6 + i * 0.12;
      const r = 80 + i * 7 + Math.sin(t * 0.7 + i) * 6;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.6;
      ctx.fillStyle = `hsla(${200 + i * 2}, 80%, ${35 + (i % 5) * 4}%, 0.08)`;
      ctx.beginPath();
      ctx.ellipse(x, y, 80 - i * 0.7, 22, a, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};
