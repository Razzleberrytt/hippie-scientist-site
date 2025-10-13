import { useEffect, useState } from "react";
import { getLS, setLS } from "@/lib/storage";

export type MeltPalette = "ocean" | "amethyst" | "aura" | "forest";
export type MeltIntensity = "low" | "med" | "high";

export function useMelt() {
  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [enabled, setEnabled] = useState<boolean>(true);
  const [palette, setPalette] = useState<MeltPalette>("ocean");
  const [intensity, setIntensity] = useState<MeltIntensity>("med");

  useEffect(() => {
    setEnabled(getLS("melt:enabled", true));
    setPalette(getLS("melt:palette", "ocean"));
    setIntensity(getLS("melt:intensity", "med"));
  }, []);

  useEffect(() => setLS("melt:enabled", enabled), [enabled]);
  useEffect(() => setLS("melt:palette", palette), [palette]);
  useEffect(() => setLS("melt:intensity", intensity), [intensity]);

  useEffect(() => {
    if (reduced) setEnabled(false);
  }, [reduced]);

  return { enabled, setEnabled, palette, setPalette, intensity, setIntensity };
}
