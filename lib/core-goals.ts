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
    href: '/guides/sleep/',
    description: 'Sleep aids, timing, alternatives, and sleep-support evidence',
  },
  {
    slug: 'stress',
    label: 'Stress',
    href: '/guides/stress/',
    description: 'Acute tension, chronic overload, burnout, and stress-support evidence',
  },
  {
    slug: 'anxiety',
    label: 'Anxiety',
    href: '/guides/anxiety/',
    description: 'Calming supports, overthinking, tension, and anxiety-focused evidence',
  },
  {
    slug: 'focus',
    label: 'Focus & Cognition',
    href: '/guides/focus/',
    description: 'Focus support, nootropics, and cognitive-performance evidence',
  },
] as const

export const coreGoalPrefixes = coreGoals.map((goal) => goal.href.replace(/\/$/, ''))
