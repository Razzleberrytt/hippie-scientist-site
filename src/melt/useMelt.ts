import { useEffect, useState } from "react";

export type MeltPalette = "ocean" | "aura" | "amethyst" | "forest";
export type MeltIntensity = "low" | "med" | "high";

type MeltState = {
  enabled: boolean;
  palette: MeltPalette;
  intensity: MeltIntensity;
};

const ENABLED_KEY = "melt:enabled";
const PALETTE_KEY = "melt:palette";
const INTENSITY_KEY = "melt:intensity";

function readInitialState(): MeltState {
  if (typeof window === "undefined") {
    return { enabled: true, palette: "ocean", intensity: "med" };
  }

  try {
    const ls = window.localStorage;
    const enabled = JSON.parse(ls.getItem(ENABLED_KEY) || "true");
    const palette = (ls.getItem(PALETTE_KEY) as MeltPalette | null) || "ocean";
    const intensity = (ls.getItem(INTENSITY_KEY) as MeltIntensity | null) || "med";
    return { enabled, palette, intensity };
  } catch (err) {
    console.warn("Failed to read melt settings:", err);
    return { enabled: true, palette: "ocean", intensity: "med" };
  }
}

function getPrefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMelt() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);
  const [{ enabled, palette, intensity }, setState] = useState<MeltState>(readInitialState);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    if (typeof media.addListener === "function") {
      media.addListener(handleChange);
      return () => media.removeListener(handleChange);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const ls = window.localStorage;
      ls.setItem(ENABLED_KEY, JSON.stringify(enabled));
      ls.setItem(PALETTE_KEY, palette);
      ls.setItem(INTENSITY_KEY, intensity);
    } catch (err) {
      console.warn("Failed to persist melt settings:", err);
    }
  }, [enabled, palette, intensity]);

  useEffect(() => {
    if (prefersReducedMotion && enabled) {
      setState((current) => ({ ...current, enabled: false }));
    }
  }, [prefersReducedMotion, enabled]);

  const setEnabled = (next: boolean | ((value: boolean) => boolean)) => {
    setState((current) => {
      const nextEnabled = typeof next === "function" ? (next as (value: boolean) => boolean)(current.enabled) : next;
      return { ...current, enabled: nextEnabled };
    });
  };

  const setPalette = (next: MeltPalette) => {
    setState((current) => ({ ...current, palette: next }));
  };

  const setIntensity = (next: MeltIntensity) => {
    setState((current) => ({ ...current, intensity: next }));
  };

  return {
    enabled,
    setEnabled,
    palette,
    setPalette,
    intensity,
    setIntensity,
    prefersReducedMotion,
  };
}
