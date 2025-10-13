import { create } from "zustand";

export type MeltPalette = "ocean" | "amethyst" | "aura" | "forest";
export type MeltIntensity = "low" | "med" | "high";

type MeltState = {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
  setEnabled: (v: boolean) => void;
  setPalette: (p: MeltPalette) => void;
  setIntensity: (i: MeltIntensity) => void;
};

const KEY = "ths.melt.v1";

const load = () => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (state: Pick<MeltState, "enabled" | "palette" | "intensity">) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch {
    /* ignore persistence errors */
  }
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const useMelt = create<MeltState>((set) => {
  const saved = typeof window !== "undefined" ? load() : null;
  const initialEnabled = prefersReducedMotion() ? false : saved?.enabled ?? true;
  const initial: Pick<MeltState, "enabled" | "palette" | "intensity"> = {
    enabled: initialEnabled,
    palette: saved?.palette ?? "ocean",
    intensity: saved?.intensity ?? "med",
  };

  const persist = (partial: Partial<MeltState>) =>
    set((state) => {
      const next = { ...state, ...partial } as MeltState;
      save({ enabled: next.enabled, palette: next.palette, intensity: next.intensity });
      return partial;
    });

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = (event as MediaQueryList).matches;
      if (matches) {
        persist({ enabled: false });
      }
    };

    handleChange(media);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(handleChange);
    }
  }

  return {
    ...initial,
    setEnabled: (value) => {
      const next = prefersReducedMotion() ? false : value;
      persist({ enabled: next });
    },
    setPalette: (palette) => {
      persist({ palette });
    },
    setIntensity: (intensity) => {
      persist({ intensity });
    },
  };
});
