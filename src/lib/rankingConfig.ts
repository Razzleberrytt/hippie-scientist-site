export const RANKING_CONFIG = {
  weights: {
    click: 1,
    conversion: 3,
  },

  boosts: {
    coldStart: 0.5,
    exploration: 0.3,
  },

  jitter: {
    max: 0.01,
  },

  thresholds: {
    closeScore: 0.05,
  },

  decay: {
    clickHalfLifeMs: 1000 * 60 * 60 * 24 * 7,
    conversionHalfLifeMs: 1000 * 60 * 60 * 24 * 14,
  },
}
