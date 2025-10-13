import type { MeltPalette, MeltIntensity } from "@/melt/useMelt";

export default function MeltToggle({
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
  const palettes: MeltPalette[] = ["ocean", "aura", "amethyst", "forest"];
  const intensities: MeltIntensity[] = ["low", "med", "high"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onEnabled(!enabled)}
        className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-white/20 ${
          enabled ? "bg-white/10" : "bg-white/5 text-gray-400"
        }`}
      >
        {enabled ? "Melt: On" : "Melt: Off"}
      </button>

      <div className="flex gap-1">
        {palettes.map((p) => (
          <button
            key={p}
            onClick={() => onPalette(p)}
            className={`px-2 py-1 text-xs rounded-full ring-1 ring-white/10 ${
              p === palette ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
            }`}
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
            className={`px-2 py-1 text-xs rounded-full ring-1 ring-white/10 ${
              i === intensity ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}
