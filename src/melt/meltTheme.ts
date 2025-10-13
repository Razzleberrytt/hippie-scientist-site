export type MeltPalette = "ocean" | "aura" | "amethyst" | "forest" | "nebula";

export const PALETTES: Record<MeltPalette, string[]> = {
  ocean: ["#00d1ff", "#0066ff", "#002244"],
  aura: ["#00ffaa", "#33ddff", "#003366"],
  amethyst: ["#b388ff", "#8a4fff", "#2b0b4f"],
  forest: ["#7ef0a0", "#1faa59", "#0b3d2e"],
  nebula: ["#041923", "#5b2a86", "#e37bd6"],
};

export const MELT_LS_KEYS = {
  enabled: "melt:enabled",
  palette: "melt:palette",
} as const;
