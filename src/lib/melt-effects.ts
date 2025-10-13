export type MeltEffectKey = 'aura' | 'nebula' | 'vapor' | 'particles';

export interface MeltEffect {
  key: MeltEffectKey;
  label: string;
  init?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  frame: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
}

const AuraFlow: MeltEffect = {
  key: 'aura',
  label: 'Aura',
  frame: (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5;
    const cy = h * 0.45;
    for (let i = 0; i < 6; i++) {
      const r = Math.max(w, h) * (0.3 + i * 0.18 + Math.sin(t * 0.25 + i) * 0.05);
      const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      g.addColorStop(0, `hsla(${200 + i * 10},80%,60%,.55)`);
      g.addColorStop(1, `hsla(${260 + i * 10},70%,45%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    const vg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.2,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.9,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  },
};

const NebulaSwirl: MeltEffect = {
  key: 'nebula',
  label: 'Nebula',
  frame: (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.9;
    const layers = 5;
    for (let i = 0; i < layers; i++) {
      const y = h * (0.3 + 0.15 * i + Math.sin(t * 0.35 + i) * 0.05);
      const rot = Math.sin(t * 0.15 + i) * 0.2;
      ctx.save();
      ctx.translate(w * 0.5, y);
      ctx.rotate(rot);
      const grd = ctx.createLinearGradient(-w, 0, w, 0);
      grd.addColorStop(0, `hsla(${180 + i * 12},70%,55%,0)`);
      grd.addColorStop(0.5, `hsla(${200 + i * 12},80%,65%,.65)`);
      grd.addColorStop(1, `hsla(${220 + i * 12},70%,55%,0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(-w, -120, w * 2, 240);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.2,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.95,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.3)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },
};

const VaporWaves: MeltEffect = {
  key: 'vapor',
  label: 'Vapor',
  frame: (ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.7;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y =
          h * 0.4 +
          Math.sin(x * 0.007 + t * (0.8 - k * 0.1)) * 22 * (k + 1) +
          Math.cos(t * 0.6 + k) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const hue = 200 + k * 25;
      ctx.strokeStyle = `hsla(${hue},85%,70%,0.8)`;
      ctx.lineWidth = 18 - k * 3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};

const ParticleBloom: MeltEffect = {
  key: 'particles',
  label: 'Particle Bloom',
  init: (ctx, w, h) => {
    (ctx as unknown as { __p?: any[] }).__p = Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 8 + Math.random() * 18,
      a: Math.random() * Math.PI * 2,
      v: 0.3 + Math.random() * 0.8,
    }));
  },
  frame: (ctx, w, h, t) => {
    const store = ctx as unknown as { __p?: Array<{ x: number; y: number; r: number; a: number; v: number }> };
    const particles = store.__p ?? [];
    if (!particles.length) {
      ParticleBloom.init?.(ctx, w, h);
    }
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += Math.cos(p.a + t * 0.005) * p.v;
      p.y += Math.sin(p.a + t * 0.006) * p.v;
      if (p.x < -50) p.x = w + 50;
      if (p.x > w + 50) p.x = -50;
      if (p.y < -50) p.y = h + 50;
      if (p.y > h + 50) p.y = -50;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      g.addColorStop(0, 'rgba(134,239,172,.85)');
      g.addColorStop(1, 'rgba(134,239,172,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,.15)';
    ctx.fillRect(0, 0, w, h);
  },
};

export const EFFECTS: Record<MeltEffectKey, MeltEffect> = {
  aura: AuraFlow,
  nebula: NebulaSwirl,
  vapor: VaporWaves,
  particles: ParticleBloom,
};

export const DEFAULT_EFFECT: MeltEffectKey = 'aura';
