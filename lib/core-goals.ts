export type CoreGoalSlug = 'sleep' | 'stress' | 'anxiety' | 'focus'

export interface CoreGoal {
  slug: CoreGoalSlug
  label: string
  href: string
  description: string
}

export const coreGoals: readonly CoreGoal[] = [
  {
    slug: 'sleep',
    label: 'Sleep',
    href: '/goals/sleep/',
    description: 'Compare sleep-support options by fit, onset, evidence quality, and risk',
  },
  {
    slug: 'stress',
    label: 'Stress',
    href: '/goals/stress/',
    description: 'Compare stress-support options by fit, onset, evidence quality, and risk',
  },
  {
    slug: 'anxiety',
    label: 'Anxiety',
    href: '/goals/anxiety/',
    description: 'Compare anxiety-support options by fit, onset, evidence quality, and risk',
  },
  {
    slug: 'focus',
    label: 'Focus & Cognition',
    href: '/goals/focus/',
    description: 'Compare focus-support options by stimulation profile, onset, evidence, and risk',
  },
] as const

export const coreGoalPrefixes = coreGoals.map((goal) => goal.href.replace(/\/$/, ''))
