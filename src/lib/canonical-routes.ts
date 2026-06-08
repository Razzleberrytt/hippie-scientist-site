/** Canonical in-app paths (static export). Prefer these over legacy /top, /explore, /collections. */

export const SEO_GUIDE_ROUTES = {
  sleep: '/guides/best-supplements-for-sleep',
  stress: '/guides/best-supplements-for-stress',
  focus: '/guides/best-supplements-for-focus',
  anxiety: '/guides/best-herbs-for-anxiety',
  adaptogensStress: '/guides/best-adaptogens-for-stress',
} as const

export const GOAL_ROUTES = {
  sleep: '/goals/sleep',
  stress: '/goals/stress',
  focus: '/goals/focus',
  recovery: '/goals/recovery',
  anxiety: '/goals/anxiety',
} as const