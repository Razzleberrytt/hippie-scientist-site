import { supplementComparisons } from '@/data/comparisons'

export type GoalHubLink = {
  label: string
  href: string
  note?: string
}

const GOAL_STACK_ROUTES: Record<string, string> = {
  sleep: '/guides/sleep/',
  stress: '/guides/anxiety/',
  focus: '/guides/focus/',
  anxiety: '/guides/anxiety/',
  cognition: '/guides/focus/',
  pain: '/guides/best/supplements-for-joint-support/',
  inflammation: '/guides/best/supplements-for-joint-support/',
  energy: '/guides/focus/',
}

const GOAL_COMPARE_SLUGS: Record<string, string[]> = {
  sleep: [
    'melatonin-vs-magnesium',
    'magnesium-glycinate-vs-l-threonate-for-sleep',
    'melatonin-vs-valerian-vs-magnesium-for-sleep',
  ],
  stress: [
    'rhodiola-vs-ashwagandha',
    'ashwagandha-vs-l-theanine-vs-magnesium',
    'kava-vs-alcohol',
  ],
  anxiety: [
    'rhodiola-vs-ashwagandha',
    'ashwagandha-vs-l-theanine-vs-magnesium',
    'kanna-vs-ssris',
  ],
  focus: [
    'caffeine-vs-l-theanine',
    'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  ],
  pain: ['curcumin-vs-boswellia-vs-omega-3'],
  inflammation: ['curcumin-vs-boswellia-vs-omega-3'],
  cognition: [
    'caffeine-vs-l-theanine',
    'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  ],
  energy: ['caffeine-vs-l-theanine', 'rhodiola-vs-ashwagandha'],
}

const SPECIAL_COMPARE_ROUTES: Record<string, string> = {
  'magnesium-glycinate-vs-l-threonate-for-sleep':
    '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/',
}

const GOAL_SEO_ENTRIES: Record<string, GoalHubLink> = {
  sleep: {
    label: 'Best supplements for sleep (entry guide)',
    href: '/guides/sleep/best-supplements-for-sleep/',
    note: 'Broader sleep keyword landing page with ranked picks.',
  },
  stress: {
    label: 'Best supplements for stress (entry guide)',
    href: '/guides/best/supplements-for-stress/',
    note: 'Calming vs adaptogen framing for stress support.',
  },
  focus: {
    label: 'Best supplements for focus (entry guide)',
    href: '/guides/focus/best-supplements-for-focus/',
    note: 'Stimulant vs non-stimulant focus comparison entry.',
  },
}

const GOAL_GUIDE_ROUTES: Record<string, string> = {
  sleep: '/guides/sleep/',
  stress: '/guides/stress/',
  anxiety: '/guides/anxiety/',
  focus: '/guides/focus/',
  cognition: '/guides/focus/',
  energy: '/guides/focus/',
  pain: '/guides/best/supplements-for-joint-support/',
  inflammation: '/guides/best/supplements-for-joint-support/',
  'joint-support': '/guides/best/supplements-for-joint-support/',
}

const FLAGSHIP_COMPARE_ROUTES = new Set([
  'rhodiola-vs-ashwagandha',
  'kava-vs-alcohol',
  'kanna-vs-ssris',
  'magnesium-glycinate-vs-l-threonate-for-sleep',
  'sleep-herbs-vs-melatonin',
  'ashwagandha-vs-l-theanine-vs-magnesium',
  'melatonin-vs-valerian-vs-magnesium-for-sleep',
  'caffeine-vs-l-theanine-vs-bacopa-for-focus',
  'curcumin-vs-boswellia-vs-omega-3',
  'melatonin-vs-magnesium',
  'caffeine-vs-l-theanine',
])

export function isFlagshipCompareSlug(slug: string): boolean {
  if (FLAGSHIP_COMPARE_ROUTES.has(slug)) return true
  return supplementComparisons.some((item) => item.slug === slug)
}

export function getGoalStackLink(goalSlug: string): GoalHubLink | null {
  const href = GOAL_STACK_ROUTES[goalSlug]
  if (!href) return null
  return {
    label: `${goalSlug.charAt(0).toUpperCase()}${goalSlug.slice(1)} guide`,
    href,
    note: 'Evidence-first guide context for this goal.',
  }
}

export function getGoalCompareLinks(goalSlug: string, limit = 4): GoalHubLink[] {
  const slugs = GOAL_COMPARE_SLUGS[goalSlug] ?? []
  const seen = new Set<string>()
  const links: GoalHubLink[] = []

  for (const slug of slugs) {
    if (seen.has(slug)) continue
    seen.add(slug)
    const config = supplementComparisons.find((item) => item.slug === slug)
    links.push({
      label: config?.title ?? slug.replace(/-/g, ' '),
      href: SPECIAL_COMPARE_ROUTES[slug] ?? `/guides/compare/${slug}/`,
      note: config?.summary?.slice(0, 120),
    })
    if (links.length >= limit) break
  }

  return links
}

export function getGoalSeoEntryLink(goalSlug: string): GoalHubLink | null {
  return GOAL_SEO_ENTRIES[goalSlug] ?? null
}

export function getGoalHubLinks(goalSlug: string) {
  return {
    stack: getGoalStackLink(goalSlug),
    compares: getGoalCompareLinks(goalSlug),
    seoEntry: getGoalSeoEntryLink(goalSlug),
  }
}

/** Herb/compound slug → primary goal pages for internal linking */
const ENTITY_GOAL_MAP: Record<string, string[]> = {
  ashwagandha: ['stress', 'anxiety', 'sleep'],
  rhodiola: ['stress', 'focus', 'energy'],
  'l-theanine': ['sleep', 'stress', 'focus', 'anxiety'],
  theanine: ['sleep', 'stress', 'focus'],
  melatonin: ['sleep'],
  magnesium: ['sleep', 'pain', 'stress'],
  valerian: ['sleep', 'anxiety'],
  passionflower: ['sleep', 'anxiety'],
  kava: ['anxiety', 'stress'],
  bacopa: ['cognition', 'focus'],
  'lions-mane': ['cognition'],
  caffeine: ['focus', 'energy'],
  curcumin: ['inflammation', 'pain'],
  boswellia: ['inflammation', 'pain', 'joint-support'],
}

export function getGoalsForEntity(slug: string): GoalHubLink[] {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const goalSlugs = ENTITY_GOAL_MAP[normalized] ?? []
  return goalSlugs.map((goalSlug) => ({
    label: goalSlug.replace(/-/g, ' '),
    href: GOAL_GUIDE_ROUTES[goalSlug] ?? '/guides/',
  }))
}
