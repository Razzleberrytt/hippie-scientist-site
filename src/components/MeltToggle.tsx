import { useEffect, useMemo, useRef, useState } from "react";

type Palette = "ocean" | "aura" | "amethyst" | "forest";
type Intensity = "low" | "med" | "high";
const LABEL: Record<Palette, string> = { ocean: "Ocean", aura: "Aura", amethyst: "Amethyst", forest: "Forest" };

function useLocalState<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(v));
  }, [key, v]);
  return [v, setV] as const;
}

export default function MeltToggle({ onChange }: { onChange: (p: Palette, i: Intensity) => void }) {
  const prefersReduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [palette, setPalette] = useLocalState<Palette>("melt:palette", "ocean");
  const [intensity, setIntensity] = useLocalState<Intensity>("melt:intensity", "med");
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    onChange(palette, intensity);
  }, [palette, intensity, onChange]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      if (!btnRef.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (prefersReduce) return null;

  return (
    <div className="relative z-20">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onContextMenu={(e) => {
          e.preventDefault();
          setIntensity(i => (i === "low" ? "med" : i === "med" ? "high" : "low"));
        }}
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 ring-1 ring-white/10 backdrop-blur hover:bg-neutral-900/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90" fill="none">
          <path d="M7 11l6-6 2 2-6 6-2-2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 20l6-6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 4h3M19 7v3M5 4h3M5 7v3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Melt</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-neutral-950/90 p-2 shadow-2xl backdrop-blur-lg">
          <div className="px-2 pb-1 pt-1 text-xs uppercase tracking-wider text-neutral-400">Palette</div>
          <div className="grid grid-cols-2 gap-2 p-2">
            {(["ocean", "aura", "amethyst", "forest"] as Palette[]).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`rounded-xl px-3 py-2 text-left text-sm ring-1 transition ${palette === p ? "ring-white/30 bg-white/5" : "ring-white/10 hover:bg-white/5"}`}
                style={{ backgroundImage: swatch(p) }}
              >
                {LABEL[p]}
              </button>
            ))}
          </div>
          <div className="px-2 pb-1 pt-2 text-xs uppercase tracking-wider text-neutral-400">Intensity</div>
          <div className="flex gap-2 p-2">
            {(["low", "med", "high"] as Intensity[]).map((i) => (
              <button
                key={i}
                onClick={() => setIntensity(i)}
                className={`flex-1 rounded-xl px-3 py-1.5 text-sm ring-1 transition ${intensity === i ? "ring-white/30 bg-white/5" : "ring-white/10 hover:bg-white/5"}`}
              >
                {i}
              </button>
            ))}
          </div>
          <p className="px-3 pb-2 pt-1 text-[11px] text-neutral-400">Tip: long-press Melt to cycle intensity.</p>
        </div>
      )}
    </div>
  );
}

function swatch(p: Palette) {
  switch (p) {
    case "ocean":
      return "linear-gradient(135deg,#0ea5b1 0%,#2563eb 100%)";
    case "aura":
      return "linear-gradient(135deg,#34d399 0%,#22d3ee 100%)";
    case "amethyst":
      return "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)";
    case "forest":
      return "linear-gradient(135deg,#10b981 0%,#166534 100%)";
  }
}
