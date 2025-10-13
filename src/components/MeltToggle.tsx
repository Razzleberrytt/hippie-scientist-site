import { MeltIntensity, MeltPalette } from "@/melt/meltTheme";

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
    <div className="relative">
      {/* Trigger in your header can wrap this; keeping simple inline control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEnabled(!enabled)}
          className={`rounded-full px-3 py-1 text-sm ring-1 ring-white/15 ${enabled ? "bg-white/10" : "bg-white/5"}`}
          aria-pressed={enabled}
        >
          {enabled ? "Melt: On" : "Melt: Off"}
        </button>

        <div className="flex gap-1">
          {palettes.map((p) => (
            <button
              key={p}
              onClick={() => onPalette(p)}
              className={`px-2 py-1 text-xs rounded-full ring-1 ring-white/15 ${p === palette ? "bg-white/15" : "bg-white/5"}`}
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
              className={`px-2 py-1 text-xs rounded-full ring-1 ring-white/15 ${i === intensity ? "bg-white/15" : "bg-white/5"}`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

