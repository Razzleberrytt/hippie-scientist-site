import { MeltEffect, MeltKey } from '../types';
import { AuraEffect } from './aura';
import { NebulaEffect } from './nebula';

const VaporEffect: MeltEffect = {
  frame(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * h + Math.sin(t * 0.8 + i) * 18;
      const grd = ctx.createLinearGradient(0, y - 40, 0, y + 40);
      grd.addColorStop(0, 'rgba(99,102,241,0)');
      grd.addColorStop(0.5, 'rgba(56,189,248,0.25)');
      grd.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, y - 40, w, 80);
    }
  },
};

const ParticlesEffect: MeltEffect = {
  init() {
    /* noop */
  },
  frame(ctx, w, h, t) {
    ctx.fillStyle = 'rgba(2,6,23,0.25)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      const a = i * 0.052 + t * 0.25;
      const r = 40 + (i % 30) * 6 + Math.sin(t * 0.9 + i) * 3;
      const x = w * 0.5 + Math.cos(a) * r;
      const y = h * 0.55 + Math.sin(a) * r * 0.55;
      ctx.fillStyle = `hsla(${180 + i},90%,60%,0.07)`;
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + (i % 7) * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

export const EFFECTS: Record<MeltKey, MeltEffect> = {
  aura: AuraEffect,
  nebula: NebulaEffect,
  vapor: VaporEffect,
  particles: ParticlesEffect,
};

export const DEFAULT_EFFECT: MeltKey = 'aura';

export type { MeltEffect, MeltKey } from '../types';
