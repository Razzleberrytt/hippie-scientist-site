import { useEffect, useRef } from "react";
import type { MeltPalette, MeltIntensity } from "@/melt/useMelt";

const PALETTES: Record<MeltPalette, string[]> = {
  ocean: ["#00d1ff", "#0066ff", "#002244"],
  amethyst: ["#caa6ff", "#8a4fff", "#2b0b4f"],
  aura: ["#00ffaa", "#33ddff", "#003366"],
  forest: ["#7ef0a0", "#1faa59", "#0b3d2e"],
};

const SPEED: Record<MeltIntensity, number> = {
  low: 0.15,
  med: 0.35,
  high: 0.8,
};

export default function MeltCanvas({
  enabled,
  palette,
  intensity,
}: {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    host.innerHTML = "";
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;

    host.style.pointerEvents = "none";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "-1";

    if (!enabled) return;

    const colors = PALETTES[palette] ?? PALETTES.ocean;
    const blobs = Array.from({ length: 3 }).map((_, i) => {
      const color = colors[i % colors.length];
      const d = document.createElement("div");
      d.style.position = "absolute";
      d.style.width = "120vmax";
      d.style.height = "120vmax";
      d.style.left = "50%";
      d.style.top = "50%";
      d.style.transform = "translate(-50%, -50%)";
      d.style.filter = "blur(120px)";
      d.style.opacity = "0.55";
      d.style.background = `radial-gradient(closest-side, ${color}80, transparent 70%)`;
      host.appendChild(d);
      return d;
    });

    const sp = SPEED[intensity];
    let t = 0;
    const loop = () => {
      t += sp;
      blobs[0].style.transform = `translate(calc(-50% + ${Math.sin(t / 47) * 18}vw), calc(-50% + ${Math.cos(t / 53) * 12}vh)) scale(1.05)`;
      blobs[1].style.transform = `translate(calc(-50% + ${Math.cos(t / 41) * 22}vw), calc(-50% + ${Math.sin(t / 37) * 16}vh)) scale(0.95) rotate(${t / 10}deg)`;
      blobs[2].style.transform = `translate(calc(-50% + ${Math.sin(t / 59) * 28}vw), calc(-50% + ${Math.cos(t / 61) * 20}vh)) scale(1.12)`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      host.innerHTML = "";
    };
  }, [enabled, palette, intensity]);

  return <div ref={ref} />;
}
