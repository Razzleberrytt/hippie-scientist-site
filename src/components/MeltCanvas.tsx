import { useEffect, useRef } from "react";
import type { MeltPalette, MeltIntensity } from "@/melt/useMelt";

const COLORS: Record<MeltPalette, string[]> = {
  ocean: ["#00d1ff", "#0066ff", "#002244"],
  aura: ["#00ffaa", "#33ddff", "#003366"],
  amethyst: ["#b388ff", "#8a4fff", "#2b0b4f"],
  forest: ["#7ef0a0", "#1faa59", "#0b3d2e"],
};

const SPEED: Record<MeltIntensity, number> = {
  low: 25,
  med: 15,
  high: 8,
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.innerHTML = "";
    if (!enabled) return;

    const colors = COLORS[palette];
    colors.forEach((color, i) => {
      const b = document.createElement("div");
      b.style.position = "absolute";
      b.style.inset = "-25%";
      b.style.filter = "blur(120px)";
      b.style.opacity = "0.6";
      b.style.background = `radial-gradient(40% 40% at 50% 50%, ${color}80 0%, transparent 70%)`;
      b.style.animation = `melt-${i} ${SPEED[intensity]}s ease-in-out infinite alternate`;
      el.appendChild(b);
    });

    const styleId = "melt-anims";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `
        @keyframes melt-0 { from{transform:translate(-10%,-5%) scale(1);} to{transform:translate(15%,10%) scale(1.2);} }
        @keyframes melt-1 { from{transform:translate(20%,-15%) scale(0.9);} to{transform:translate(-10%,20%) scale(1.1);} }
        @keyframes melt-2 { from{transform:translate(0%,20%) scale(1.1);} to{transform:translate(-25%,-10%) scale(0.95);} }
      `;
      document.head.appendChild(s);
    }
  }, [enabled, palette, intensity]);

  return <div ref={ref} className="fixed inset-0 -z-10 pointer-events-none" />;
}
