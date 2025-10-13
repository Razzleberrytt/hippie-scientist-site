export type MeltPalette = "ocean" | "aura" | "amethyst" | "forest";
export type MeltIntensity = "low" | "med" | "high";

export const PALETTES: Record<MeltPalette, string[]> = {
  ocean: ["#00d1ff", "#0066ff", "#002244"],
  aura: ["#00ffaa", "#33ddff", "#003366"],
  amethyst: ["#b388ff", "#8a4fff", "#2b0b4f"],
  forest: ["#7ef0a0", "#1faa59", "#0b3d2e"],
};

export const INTENSITY_MS: Record<MeltIntensity, number> = {
  low: 22000,
  med: 14000,
  high: 8000,
};

export const MELT_LS_KEYS = {
  enabled: "melt:enabled",
  palette: "melt:palette",
  intensity: "melt:intensity",
} as const;
