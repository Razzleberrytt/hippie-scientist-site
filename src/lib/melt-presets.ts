export type MeltPresetKey = 'aura' | 'nebula' | 'vapor' | 'plasma';

export interface MeltPreset {
  key: MeltPresetKey;
  label: string;
  // rendering parameters for the background shader/Canvas
  noiseScale: number;
  swirl: number;
  speed: number;
  contrast: number;
  palette: [string, string, string]; // still keep internal palette per preset
}

export const MELT_PRESETS: Record<MeltPresetKey, MeltPreset> = {
  aura:   { key: 'aura',   label: 'Aura',   noiseScale: 0.8,  swirl: 0.15, speed: 0.35, contrast: 0.9,  palette: ['#1dbde6','#6cf','#9ff'] },
  nebula: { key: 'nebula', label: 'Nebula', noiseScale: 1.6,  swirl: 0.45, speed: 0.25, contrast: 1.2,  palette: ['#74fbd2','#18a39b','#001219'] },
  vapor:  { key: 'vapor',  label: 'Vapor',  noiseScale: 1.1,  swirl: 0.30, speed: 0.50, contrast: 1.0,  palette: ['#b388ff','#7c4dff','#311b92'] },
  plasma: { key: 'plasma', label: 'Plasma', noiseScale: 2.0,  swirl: 0.60, speed: 0.70, contrast: 1.35, palette: ['#ff6ec7','#ff3d6e','#2d0033'] },
};

export const DEFAULT_MELT: MeltPresetKey = 'aura';
