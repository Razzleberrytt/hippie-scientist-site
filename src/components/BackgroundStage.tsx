"use client";
import { useEffect, useMemo, useRef } from "react";

type EffectName = "aura" | "nebula" | "vapor" | "plasma";

type BackgroundStageProps = {
  effect?: EffectName;
  enabled?: boolean;
};

export default function BackgroundStage({ effect = "aura", enabled = true }: BackgroundStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const scrollY = useRef(0);
  const pointer = useRef({ x: 0.5, y: 0.5 });
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  const draw = useMemo(() => {
    const TAU = Math.PI * 2;

    const aura = (
      ctx: CanvasRenderingContext2D,
      t: number,
      w: number,
      h: number,
    ) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      const base = ctx.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.9);
      base.addColorStop(0, "rgba(0,0,0,0.0)");
      base.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 3; i += 1) {
        const cx = w * (0.35 + 0.3 * Math.sin(t * 0.15 + i + pointer.current.x * 0.8));
        const cy = h * (0.35 + 0.3 * Math.cos(t * 0.13 + i + pointer.current.y * 0.8));
        const r = Math.max(w, h) * (0.35 + 0.05 * Math.sin(t * 0.27 + i));
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(56,189,248,0.22)");
        g.addColorStop(0.5, "rgba(147,51,234,0.20)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      }
    };

    const nebula = (
      ctx: CanvasRenderingContext2D,
      t: number,
      w: number,
      h: number,
    ) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      const wash = ctx.createLinearGradient(0, 0, 0, h);
      wash.addColorStop(0, "#04121a");
      wash.addColorStop(1, "#02070a");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 5; i += 1) {
        const cx = w * (0.5 + 0.35 * Math.sin(t * 0.12 + i * 1.7 + pointer.current.x * 1.2));
        const cy = h * (0.5 + 0.35 * Math.cos(t * 0.1 + i * 1.3 + scrollY.current * 0.0006));
        const r = Math.max(w, h) * (0.28 + 0.08 * Math.sin(t * 0.22 + i));
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(34,197,94,0.18)");
        g.addColorStop(0.6, "rgba(59,130,246,0.16)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      }
    };

    const vapor = (
      ctx: CanvasRenderingContext2D,
      t: number,
      w: number,
      h: number,
    ) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 6; i += 1) {
        const y = (h + ((t * 30 + i * 180) % (h * 2))) - h;
        const grd = ctx.createLinearGradient(0, y - 120, 0, y + 120);
        grd.addColorStop(0, "rgba(99,102,241,0)");
        grd.addColorStop(0.5, "rgba(168,85,247,0.18)");
        grd.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, y - 140, w, 280);
      }
    };

    const plasma = (
      ctx: CanvasRenderingContext2D,
      t: number,
      w: number,
      h: number,
    ) => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#020409";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 4; i += 1) {
        const k = i + 1;
        const cx = w * (0.5 + 0.22 * Math.sin((t * 0.9) / k + pointer.current.x * 1.3));
        const cy = h * (0.5 + 0.22 * Math.cos((t * 0.8) / k + scrollY.current * 0.0008));
        const r = Math.max(w, h) * (0.22 + 0.05 * Math.sin((t * 1.2) / k));
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(244,63,94,0.22)");
        g.addColorStop(0.5, "rgba(234,179,8,0.18)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      }
    };

    return { aura, nebula, vapor, plasma } as const;
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      pointer.current.x = Math.max(0, Math.min(1, event.clientX / innerWidth));
      pointer.current.y = Math.max(0, Math.min(1, event.clientY / innerHeight));
    };

    const onScroll = () => {
      scrollY.current = window.scrollY;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const fx = draw as Record<EffectName, typeof draw.aura>;
    let lastTime = 0;

    const renderFrame = (time: number) => {
      lastTime = time;
      const animator = fx[effect] ?? fx.aura;
      animator(ctx, time, canvas.width / dpr, canvas.height / dpr);
    };

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderFrame(lastTime);
    };

    resize();
    window.addEventListener("resize", resize);

    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      renderFrame(0);
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    let start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      renderFrame(t);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [draw, effect, enabled, dpr]);

  if (!enabled) {
    return (
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-950 via-slate-950 to-black"
      />
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 -z-10 will-change-transform"
        aria-hidden
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-gradient-to-br from-indigo-950 via-slate-950 to-black"
      />
    </>
  );
}
