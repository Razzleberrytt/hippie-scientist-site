import type { MeltPalette } from "@/melt/meltTheme";

export default function MeltControls({
  enabled,
  palette,
  onEnabled,
  onPalette,
}: {
  enabled: boolean;
  palette: MeltPalette;
  onEnabled: (v: boolean) => void;
  onPalette: (p: MeltPalette) => void;
}) {
  const palettes: MeltPalette[] = ["ocean", "amethyst", "aura", "forest", "nebula"];

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
      <button
        onClick={() => onEnabled(!enabled)}
        className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-white/15 ${
          enabled ? "bg-white/20" : "bg-white/10 text-white/60"
        }`}
        aria-pressed={enabled}
      >
        {enabled ? "Melt On" : "Melt Off"}
      </button>

      {palettes.map((p) => (
        <button
          key={p}
          onClick={() => onPalette(p)}
          className={`rounded-full px-2.5 py-1 text-xs capitalize ring-1 ring-white/10 ${
            p === palette ? "bg-white/25" : "bg-white/10 hover:bg-white/15"
          }`}
          aria-pressed={p === palette}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
