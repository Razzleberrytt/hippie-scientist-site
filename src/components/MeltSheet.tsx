import { useEffect } from "react";
import { useMelt } from "@/melt/useMelt";
import type { MeltPalette } from "@/melt/meltTheme";

type MeltSheetProps = {
  open: boolean;
  onClose: () => void;
};

export default function MeltSheet({ open, onClose }: MeltSheetProps) {
  const { enabled, setEnabled, palette, setPalette } = useMelt();

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

  const palettes: MeltPalette[] = ["ocean", "amethyst", "aura", "forest", "nebula"];

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close Melt panel"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0">
        <div className="safe mx-auto max-w-screen-md w-full px-4 pb-6">
          <div className="rounded-3xl bg-black/60 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-white">Melt</h3>
              <button
                type="button"
                className="text-sm text-white/70 transition hover:text-white"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`inline-flex items-center gap-2 rounded-2xl border border-white/15 px-3 py-1.5 text-sm transition ${
                  enabled
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {enabled ? "Melt on" : "Melt off"}
              </button>
            </div>

            <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-white/60">Palette</div>
            <div className="mx-auto max-w-screen-md w-full px-4">
              <div className="mt-2 flex flex-wrap gap-2">
                {palettes.map((p) => {
                  const active = palette === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPalette(p)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-2xl border border-white/15 px-3 py-1.5 text-sm capitalize transition ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
