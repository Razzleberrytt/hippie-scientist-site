export type MeltIntensity = "low" | "med" | "high";
export type MeltPalette = "aura" | "ocean" | "amethyst" | "forest";

export type MeltSettings = {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
};

export type MeltState = {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
  set: (v: boolean) => void;
  toggle: () => void;
  setPalette: (value: MeltPalette) => void;
  cyclePalette: () => void;
  setIntensity: (value: MeltIntensity) => void;
  cycleIntensity: () => void;
  subscribe: (fn: (v: boolean) => void) => () => void;
  subscribeSettings: (fn: (settings: MeltSettings) => void) => () => void;
};

const ENABLED_KEY = "melt:enabled";
const PALETTE_KEY = "melt:palette";
const INTENSITY_KEY = "melt:intensity";

const defaultPalette: MeltPalette = "ocean";
const defaultIntensity: MeltIntensity = "med";

const paletteOrder: MeltPalette[] = ["ocean", "aura", "amethyst", "forest"];
const intensityOrder: MeltIntensity[] = ["low", "med", "high"];

const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

function readBoolean(key: string, fallback: boolean) {
  if (!isBrowser) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;
    return value === "1";
  } catch {
    return fallback;
  }
}

function readPalette(): MeltPalette {
  if (!isBrowser) return defaultPalette;
  try {
    const value = window.localStorage.getItem(PALETTE_KEY) as MeltPalette | null;
    if (value && paletteOrder.includes(value)) {
      return value;
    }
  } catch {}
  return defaultPalette;
}

function readIntensity(): MeltIntensity {
  if (!isBrowser) return defaultIntensity;
  try {
    const value = window.localStorage.getItem(INTENSITY_KEY) as MeltIntensity | null;
    if (value && intensityOrder.includes(value)) {
      return value;
    }
  } catch {}
  return defaultIntensity;
}

let enabled = readBoolean(ENABLED_KEY, true);
let palette = readPalette();
let intensity = readIntensity();

const listeners = new Set<(v: boolean) => void>();
const settingsListeners = new Set<(settings: MeltSettings) => void>();

function persistEnabled(value: boolean) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(ENABLED_KEY, value ? "1" : "0");
  } catch {}
}

function persistPalette(value: MeltPalette) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(PALETTE_KEY, value);
  } catch {}
}

function persistIntensity(value: MeltIntensity) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(INTENSITY_KEY, value);
  } catch {}
}

function applyDocumentState() {
  if (!isBrowser) return;
  document.documentElement.classList.toggle("melt", enabled);
  document.documentElement.dataset.meltPalette = palette;
  document.documentElement.dataset.meltIntensity = intensity;
}

function notifyBoolean() {
  for (const listener of listeners) {
    listener(enabled);
  }
}

function notifySettings() {
  const snapshot: MeltSettings = {
    enabled,
    palette,
    intensity,
  };
  for (const listener of settingsListeners) {
    listener(snapshot);
  }
}

function cycle<T>(order: readonly T[], current: T) {
  const index = order.indexOf(current);
  if (index === -1) return order[0];
  return order[(index + 1) % order.length];
}

export const melt: MeltState = {
  enabled,
  palette,
  intensity,
  set(value) {
    if (enabled === value) return;
    enabled = value;
    melt.enabled = value;
    persistEnabled(value);
    applyDocumentState();
    notifyBoolean();
    notifySettings();
  },
  toggle() {
    melt.set(!enabled);
  },
  setPalette(value) {
    if (palette === value) return;
    palette = value;
    melt.palette = value;
    persistPalette(value);
    applyDocumentState();
    notifySettings();
  },
  cyclePalette() {
    melt.setPalette(cycle(paletteOrder, palette));
  },
  setIntensity(value) {
    if (intensity === value) return;
    intensity = value;
    melt.intensity = value;
    persistIntensity(value);
    applyDocumentState();
    notifySettings();
  },
  cycleIntensity() {
    melt.setIntensity(cycle(intensityOrder, intensity));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  subscribeSettings(fn) {
    settingsListeners.add(fn);
    fn({ enabled, palette, intensity });
    return () => {
      settingsListeners.delete(fn);
    };
  },
};

applyDocumentState();
