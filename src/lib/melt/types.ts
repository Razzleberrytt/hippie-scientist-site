export interface MeltEffect {
  /** optional one-time init after resize */
  init?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  /** draw a frame; t is seconds */
  frame: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  /** optional cleanup */
  dispose?: () => void;
}

export type MeltKey = 'aura' | 'nebula' | 'vapor' | 'particles';
