export type GoalStartHereLink = {
  role: string
  title: string
  href: string
  note: string
}

export const GOAL_START_HERE_LINKS: Record<string, GoalStartHereLink[]> = {
  sleep: [
    {
      role: 'Beginner guide',
      title: 'Best supplements for sleep',
      href: '/guides/sleep/sleep-best-supplements/',
      note: 'Start here if you want a plain-English overview before comparing individual options.',
    },
    {
      role: 'Comparison guide',
      title: 'Sleep herbs vs melatonin',
      href: '/compare/sleep-herbs-vs-melatonin/',
      note: 'Use this when the main question is herbal wind-down support versus circadian timing.',
    },
    {
      role: 'Herb profile',
      title: 'Valerian',
      href: '/herbs/valerian/',
      note: 'A traditional sedative herb worth reviewing for sleep-onset tradeoffs.',
    },
    {
      role: 'Compound profile',
      title: 'Melatonin',
      href: '/compounds/melatonin/',
      note: 'Best fit for sleep timing questions, with grogginess and dose cautions up front.',
    },
    {
      role: 'Methodology',
      title: 'Evidence methodology',
      href: '/info/info/methodology/',
      note: 'How the site separates clinical evidence, mechanism, and safety uncertainty.',
    },
    {
      role: 'Related article',
      title: 'Best magnesium for sleep',
      href: '/guides/sleep/best-magnesium-for-sleep/',
      note: 'A practical buying and form-selection guide for magnesium-focused readers.',
    },
  ],
  stress: [
    {
      role: 'Beginner guide',
      title: 'Best supplements for stress',
      href: '/best-supplements-for-stress/',
      note: 'A broad entry point for comparing calming support, adaptogens, and safety flags.',
    },
    {
      role: 'Comparison guide',
      title: 'Rhodiola vs ashwagandha',
      href: '/guides/guides/compare/rhodiola-vs-ashwagandha/',
      note: 'Best next read when choosing between calming resilience and fatigue support.',
    },
    {
      role: 'Herb profile',
      title: 'Ashwagandha',
      href: '/herbs/ashwagandha/',
      note: 'The core profile for chronic stress, cortisol context, and thyroid cautions.',
    },
    {
      role: 'Compound profile',
      title: 'L-theanine',
      href: '/compounds/l-theanine/',
      note: 'Useful for acute stress buffering and calm focus without heavy sedation.',
    },
    {
      role: 'Methodology',
      title: 'Evidence methodology',
      href: '/info/info/methodology/',
      note: 'Use this to understand evidence grades before comparing adaptogens.',
    },
    {
      role: 'Related article',
      title: 'How to lower cortisol naturally',
      href: '/guides/how-to-lower-cortisol-naturally/',
      note: 'A lifestyle-and-supplement bridge for stress physiology readers.',
    },
  ],
  anxiety: [
    {
      role: 'Beginner guide',
      title: 'Best herbs for anxiety',
      href: '/guides/best-herbs-for-anxiety/',
      note: 'Start with the herb-by-herb decision framework and medication cautions.',
    },
    {
      role: 'Comparison guide',
      title: 'Ashwagandha vs L-theanine vs magnesium',
      href: '/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
      note: 'Useful when anxiety overlaps with stress, tension, or sleep disruption.',
    },
    {
      role: 'Herb profile',
      title: 'Lemon Balm',
      href: '/herbs/melissa-officinalis/',
      note: 'A gentle anxiety-and-sleep overlap profile with calming-pathway context.',
    },
    {
      role: 'Compound profile',
      title: 'L-theanine',
      href: '/compounds/l-theanine/',
      note: 'A low-sedation option for racing thoughts and calm focus context.',
    },
    {
      role: 'Methodology',
      title: 'Evidence methodology',
      href: '/info/info/methodology/',
      note: 'Review how evidence strength and safety caveats are separated.',
    },
    {
      role: 'Related article',
      title: 'Natural anxiolytics beyond ashwagandha',
      href: '/guides/natural-anxiolytics-beyond-ashwagandha/',
      note: 'A broader herb cluster for readers who need options beyond the usual anchor herb.',
    },
  ],
  focus: [
    {
      role: 'Beginner guide',
      title: 'Best nootropics for focus',
      href: '/guides/best-nootropics-for-focus/',
      note: 'Start here to separate acute stimulation from slow-build cognitive support.',
    },
    {
      role: 'Comparison guide',
      title: 'Caffeine vs L-theanine vs bacopa',
      href: '/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
      note: 'Best next read for fast alertness, calm focus, and non-stimulant tradeoffs.',
    },
    {
      role: 'Herb profile',
      title: 'Bacopa',
      href: '/herbs/bacopa/',
      note: 'A slow-build memory and learning profile, not an immediate stimulant.',
    },
    {
      role: 'Compound profile',
      title: 'L-theanine',
      href: '/compounds/l-theanine/',
      note: 'Core profile for calm attention and caffeine smoothing.',
    },
    {
      role: 'Methodology',
      title: 'Evidence methodology',
      href: '/info/info/methodology/',
      note: 'Use this before comparing nootropic claims with different evidence tiers.',
    },
    {
      role: 'Related article',
      title: 'Focus without the caffeine crash',
      href: '/guides/focus-without-caffeine-crash/',
      note: 'A practical guide for readers trying to reduce stimulant downside.',
    },
  ],
}

export function getGoalStartHereLinks(goalSlug: string): GoalStartHereLink[] {
  return GOAL_START_HERE_LINKS[goalSlug] ?? []
}
