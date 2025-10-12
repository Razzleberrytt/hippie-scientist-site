import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

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
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);
  return [v, setV] as const;
}

export default function MeltToggle({ onChange }: { onChange: (p: Palette, i: Intensity) => void }) {
  const prefersReduce = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [palette, setPalette] = useLocalState<Palette>("melt:palette", "ocean");
  const [intensity, setIntensity] = useLocalState<Intensity>("melt:intensity", "med");
  const [open, setOpen] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setMenuPos({
      top: Math.round(r.bottom + window.scrollY + 8),
      left: Math.round(r.right + window.scrollX - 224),
      width: Math.round(r.width),
    });
  }, []);

  const openMenu = useCallback(() => {
    setOpen(true);
    updatePos();
    // @ts-ignore
    navigator?.vibrate?.(10);
  }, [updatePos]);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    onChange(palette, intensity);
  }, [palette, intensity, onChange]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = e.target as Node;
      if (!btnRef.current?.contains(el) && !(document.getElementById("melt-menu")?.contains(el))) {
        closeMenu();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const onReflow = () => {
      updatePos();
    };
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow);
    };
  }, [open, closeMenu, updatePos]);

  if (prefersReduce) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={(e) => {
          e.preventDefault();
          open ? closeMenu() : openMenu();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setIntensity(i => (i === "low" ? "med" : i === "med" ? "high" : "low"));
        }}
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 ring-1 ring-white/10 backdrop-blur hover:bg-neutral-900/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-90" fill="none" aria-hidden>
          <path d="M7 11l6-6 2 2-6 6-2-2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 20l6-6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 4h3M19 7v3M5 4h3M5 7v3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>Melt</span>
      </button>

      {open &&
        createPortal(
          <div
            id="melt-menu"
            role="menu"
            className="fixed z-[1000] w-56 rounded-2xl border border-white/10 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-xl"
            style={{ top: menuPos.top, left: Math.max(8, menuPos.left) }}
          >
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

            <button
              onClick={closeMenu}
              className="mt-1 w-full rounded-xl bg-white/6 px-3 py-1.5 text-center text-sm ring-1 ring-white/10 hover:bg-white/10"
            >
              Close
            </button>
          </div>,
          document.body
        )}
    </>
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
