// src/components/MeltBackground.tsx
import { useEffect, useRef } from "react";
import { melt } from "@/state/melt";

export default function MeltBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let raf: number;
    let t = 0;
    const move = { x: 0, y: 0 };

    const onMove = (e: MouseEvent | DeviceOrientationEvent) => {
      if ("gamma" in e) {
        move.x = (e.gamma || 0) / 45;
        move.y = (e.beta || 0) / 45;
      } else {
        move.x = (e as MouseEvent).clientX / window.innerWidth - 0.5;
        move.y = (e as MouseEvent).clientY / window.innerHeight - 0.5;
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("deviceorientation", onMove);

    const animate = () => {
      t += 0.002;
      const hue = (t * 40) % 360;

      el.style.setProperty("--hue", `${hue}deg`);
      el.style.setProperty("--x1", `${50 + Math.sin(t * 0.8 + move.x * 2) * 40}%`);
      el.style.setProperty("--y1", `${50 + Math.cos(t * 0.6 + move.y * 2) * 40}%`);
      el.style.setProperty("--x2", `${50 + Math.sin(t * 0.5) * 40}%`);
      el.style.setProperty("--y2", `${50 + Math.cos(t * 0.9) * 40}%`);
      el.style.setProperty("--offset", `${move.x * 4}px ${move.y * 4}px`);

      raf = requestAnimationFrame(animate);
    };

    if (melt.enabled) raf = requestAnimationFrame(animate);
    const unsub = melt.subscribe((v) => {
      el.style.opacity = v ? "1" : "0";
      if (v) raf = requestAnimationFrame(animate);
      else cancelAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onMove);
      unsub();
    };
  }, []);

  return <div ref={ref} className="melt-layer-2" aria-hidden />;
}
