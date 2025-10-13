import type { MeltIntensity, MeltPalette } from "@/melt/useMelt";

export default function MeltControls({
  enabled,
  palette,
  intensity,
  onEnabled,
  onPalette,
  onIntensity,
}: {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
  onEnabled: (v: boolean) => void;
  onPalette: (p: MeltPalette) => void;
  onIntensity: (i: MeltIntensity) => void;
}) {
  const palettes: MeltPalette[] = ["ocean", "amethyst", "aura", "forest"];
  const intensities: MeltIntensity[] = ["low", "med", "high"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onEnabled(!enabled)}
        className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-white/15 ${
          enabled ? "bg-white/20" : "bg-white/10 text-white/60"
        }`}
        aria-pressed={enabled}
      >
        {enabled ? "Melt On" : "Melt Off"}
      </button>

      <div className="flex gap-1">
        {palettes.map((p) => (
          <button
            key={p}
            onClick={() => onPalette(p)}
            className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-white/10 ${
              p === palette ? "bg-white/25" : "bg-white/10 hover:bg-white/15"
            }`}
            aria-pressed={p === palette}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        {intensities.map((i) => (
          <button
            key={i}
            onClick={() => onIntensity(i)}
            className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-white/10 ${
              i === intensity ? "bg-white/25" : "bg-white/10 hover:bg-white/15"
            }`}
            aria-pressed={i === intensity}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
