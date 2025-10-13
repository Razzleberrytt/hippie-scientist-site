import { useEffect, useRef } from "react";
import { INTENSITY_MS, MeltIntensity, MeltPalette, PALETTES } from "@/melt/meltTheme";

/**
 * GPU-cheap animated radial-gradients that subtly drift.
 * Lives behind all content via .melt-layer styles.
 */
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

    const colors = PALETTES[palette];
    const duration = INTENSITY_MS[intensity];

    // Create 3 moving hotspots
    const bubbles = Array.from({ length: 3 }).map((_, i) => {
      const b = document.createElement("div");
      b.style.position = "absolute";
      b.style.inset = "-20%";
      b.style.filter = "blur(80px)";
      b.style.background = `radial-gradient(35% 35% at 50% 50%, ${colors[i]}66 0%, ${colors[i]}00 70%)`;
      b.style.animation = `meltFloat-${i} ${duration}ms linear infinite alternate`;
      el.appendChild(b);
      return b;
    });

    // Keyframes injected once per mount for deterministic names
    const styleId = "melt-keyframes";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `
        @keyframes meltFloat-0 { 
          0% { transform: translate3d(-15%, -10%, 0) scale(1.0); } 
          100% { transform: translate3d(25%, 10%, 0) scale(1.15); } 
        }
        @keyframes meltFloat-1 { 
          0% { transform: translate3d(20%, -20%, 0) scale(0.9); } 
          100% { transform: translate3d(-10%, 25%, 0) scale(1.1); } 
        }
        @keyframes meltFloat-2 { 
          0% { transform: translate3d(0%, 30%, 0) scale(1.1); } 
          100% { transform: translate3d(-25%, -15%, 0) scale(0.95); } 
        }`;
      document.head.appendChild(s);
    }

    // Enable / disable by opacity (keeps layout stable & behind)
    el.style.opacity = enabled ? "1" : "0";
    el.style.transition = "opacity 500ms ease";

    return () => {
      bubbles.forEach((b) => b.remove());
    };
  }, [enabled, palette, intensity]);

  return <div ref={ref} className="melt-layer" />;
}
