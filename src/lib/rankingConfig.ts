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
}
