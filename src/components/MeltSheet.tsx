import { useEffect } from "react";
import { useMelt, type MeltPalette, type MeltIntensity } from "@/melt/useMelt";

type MeltSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function MeltSheet({ open, onClose }: MeltSheetProps) {
  const { enabled, setEnabled, palette, setPalette, intensity, setIntensity } = useMelt();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const Chip = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition no-underline border ${
        active
          ? "border-white/30 bg-white/15 text-white"
          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );

  const palettes: MeltPalette[] = ["ocean", "amethyst", "aura", "forest"];
  const levels: MeltIntensity[] = ["low", "med", "high"];

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/10 bg-neutral-900/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-screen-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white/90">Melt</h3>
            <button className="text-white/70 transition hover:text-white" onClick={onClose}>
              Close
            </button>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
            <Chip active={enabled} label="Melt On" onClick={() => setEnabled(true)} />
            <Chip active={!enabled} label="Melt Off" onClick={() => setEnabled(false)} />
          </div>

          <div className="text-xs text-white/60">Palette</div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
            {palettes.map((p) => (
              <Chip key={p} active={palette === p} label={p} onClick={() => setPalette(p)} />
            ))}
          </div>

          <div className="text-xs text-white/60">Intensity</div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
            {levels.map((level) => (
              <Chip key={level} active={intensity === level} label={level} onClick={() => setIntensity(level)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
