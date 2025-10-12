import { useEffect, useRef } from "react";
import { melt } from "@/state/melt";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function MeltBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const root = wrapRef.current!;
    let unsub = () => {};
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      tRef.current += dt * 0.0005;

      const t = tRef.current;
      root.style.setProperty("--melt-x1", `${50 + Math.sin(t) * 35}%`);
      root.style.setProperty("--melt-y1", `${50 + Math.cos(t * 1.1) * 35}%`);
      root.style.setProperty("--melt-x2", `${50 + Math.sin(t * 0.8 + 2) * 40}%`);
      root.style.setProperty("--melt-y2", `${50 + Math.cos(t * 0.9 + 1) * 40}%`);
      root.style.setProperty("--melt-hue", `${(t * 120) % 360}deg`);

      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (runningRef.current || prefersReduced() || !melt.enabled) return;
      runningRef.current = true;
      last = performance.now();
      rafRef.current = requestAnimationFrame(tick);
      root.style.opacity = "1";
    };

    const stop = () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      root.style.opacity = "0";
    };

    const onVis = () => (document.hidden ? stop() : start());
    const onMelt = () => (melt.enabled ? start() : stop());

    document.addEventListener("visibilitychange", onVis);
    unsub = melt.subscribe(onMelt);
    onMelt();

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      unsub();
      stop();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 melt-layer"
    />
  );
}
