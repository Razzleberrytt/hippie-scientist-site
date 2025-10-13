import { create } from "zustand";
import type { MeltPalette } from "./meltTheme";
export type { MeltPalette } from "./meltTheme";

type MeltState = {
  enabled: boolean;
  palette: MeltPalette;
  setEnabled: (v: boolean) => void;
  setPalette: (p: MeltPalette) => void;
};

const KEY = "ths.melt.v1";

type PersistedState = Partial<Pick<MeltState, "enabled" | "palette">> & {
  intensity?: string;
};

const applyIntensity = (value: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--melt-intensity", value);
  }
};

const load = (): PersistedState | null => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (state: Pick<MeltState, "enabled" | "palette">) => {
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
  const initial: Pick<MeltState, "enabled" | "palette"> = {
    enabled: initialEnabled,
    palette: saved?.palette ?? "ocean",
  };

  applyIntensity("high");

  const persist = (partial: Partial<MeltState>) =>
    set((state) => {
      const next = { ...state, ...partial } as MeltState;
      save({ enabled: next.enabled, palette: next.palette });
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
  };
});
