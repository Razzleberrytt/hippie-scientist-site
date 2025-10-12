import { useEffect, useRef } from "react";
import { melt } from "@/state/melt";

export default function MeltBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let raf: number;
    let t = 0;

    const animate = () => {
      t += 0.003;
      const hue = (t * 40) % 360;
      el.style.setProperty("--hue", `${hue}deg`);
      el.style.setProperty("--x1", `${50 + Math.sin(t * 0.6) * 40}%`);
      el.style.setProperty("--y1", `${50 + Math.cos(t * 0.8) * 40}%`);
      el.style.setProperty("--x2", `${50 + Math.sin(t * 0.4 + 2) * 40}%`);
      el.style.setProperty("--y2", `${50 + Math.cos(t * 0.5 + 1) * 40}%`);
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
      unsub();
    };
  }, []);

  return <div ref={ref} className="melt-layer" aria-hidden />;
}
