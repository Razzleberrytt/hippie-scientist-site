/** Canonical in-app paths (static export). Prefer these over legacy /top, /explore, /collections. */

export const SEO_GUIDE_ROUTES = {
  sleep: '/guides/best-supplements-for-sleep',
  stress: '/guides/best-supplements-for-stress',
  focus: '/guides/best-supplements-for-focus',
  anxiety: '/guides/best-herbs-for-anxiety',
  adaptogensStress: '/guides/best-adaptogens-for-stress',
} as const

export const GOAL_ROUTES = {
  sleep: '/guides/sleep',
  stress: '/guides/anxiety',
  focus: '/guides/focus',
  recovery: '/goals/recovery',
  anxiety: '/guides/anxiety',
} as const