import { useEffect, useMemo, useState } from "react";
import { MeltIntensity, MeltPalette, MELT_LS_KEYS } from "./meltTheme";

export function useMelt() {
  const reduce = useMemo(
    () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const [enabled, setEnabled] = useState<boolean>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(MELT_LS_KEYS.enabled) : null;
    return raw ? JSON.parse(raw) : true;
  });

  const [palette, setPalette] = useState<MeltPalette>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(MELT_LS_KEYS.palette) : null;
    return (raw as MeltPalette) || "ocean";
  });

  const [intensity, setIntensity] = useState<MeltIntensity>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(MELT_LS_KEYS.intensity) : null;
    return (raw as MeltIntensity) || "med";
  });

  useEffect(() => localStorage.setItem(MELT_LS_KEYS.enabled, JSON.stringify(enabled)), [enabled]);
  useEffect(() => localStorage.setItem(MELT_LS_KEYS.palette, palette), [palette]);
  useEffect(() => localStorage.setItem(MELT_LS_KEYS.intensity, intensity), [intensity]);

  // If reduced motion, force off
  useEffect(() => {
    if (reduce) setEnabled(false);
  }, [reduce]);

  return { enabled, setEnabled, palette, setPalette, intensity, setIntensity, reduce };
}
