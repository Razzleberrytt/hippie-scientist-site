import { supplementComparisons } from '@/data/comparisons'

export type GoalHubLink = {
  label: string
  href: string
  note?: string
}

export type GoalIngredientCandidate = {
  slug: string
  label: string
  note: string
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

const GOAL_INGREDIENT_CANDIDATES: Record<string, GoalIngredientCandidate[]> = {
  sleep: [
    { slug: 'melatonin', label: 'Melatonin', note: 'Circadian timing and sleep-onset evidence.' },
    { slug: 'magnesium', label: 'Magnesium', note: 'Mineral status, relaxation, and sleep-quality context.' },
    { slug: 'l-theanine', label: 'L-Theanine', note: 'Calm-focus and pre-sleep relaxation evidence.' },
    { slug: 'valerian', label: 'Valerian', note: 'Traditional sleep aid with mixed human evidence.' },
  ],
  stress: [
    { slug: 'ashwagandha', label: 'Ashwagandha', note: 'Stress and cortisol-related human trial evidence.' },
    { slug: 'rhodiola', label: 'Rhodiola', note: 'Stress-related fatigue and resilience context.' },
    { slug: 'l-theanine', label: 'L-Theanine', note: 'Acute stress and calm-focus context.' },
  ],
  anxiety: [
    { slug: 'l-theanine', label: 'L-Theanine', note: 'Acute stress and anxious-tension research context.' },
    { slug: 'ashwagandha', label: 'Ashwagandha', note: 'Longer-duration stress and anxiety-scale evidence.' },
    { slug: 'kava', label: 'Kava', note: 'Anxiety evidence with materially higher safety scrutiny.' },
  ],
  focus: [
    { slug: 'caffeine', label: 'Caffeine', note: 'Fast alertness and vigilance evidence.' },
    { slug: 'l-theanine', label: 'L-Theanine', note: 'Calmer attention, often researched with caffeine.' },
    { slug: 'bacopa', label: 'Bacopa', note: 'Longer-term memory and learning context.' },
    { slug: 'rhodiola', label: 'Rhodiola', note: 'Fatigue-sensitive cognitive performance context.' },
  ],
  cognition: [
    { slug: 'bacopa', label: 'Bacopa', note: 'Memory and learning evidence over longer durations.' },
    { slug: 'lions-mane', label: 'Lion’s Mane', note: 'Emerging cognition and nerve-signaling research.' },
    { slug: 'citicoline', label: 'Citicoline', note: 'Choline-related cognition and attention context.' },
  ],
  energy: [
    { slug: 'caffeine', label: 'Caffeine', note: 'Immediate wakefulness and performance evidence.' },
    { slug: 'rhodiola', label: 'Rhodiola', note: 'Fatigue and stress-resilience research.' },
    { slug: 'coq10', label: 'CoQ10', note: 'Mitochondrial and fatigue-related evidence context.' },
  ],
  pain: [
    { slug: 'curcumin', label: 'Curcumin', note: 'Joint-discomfort and inflammatory outcome evidence.' },
    { slug: 'boswellia', label: 'Boswellia', note: 'Joint pain and function evidence.' },
    { slug: 'magnesium', label: 'Magnesium', note: 'Context-dependent evidence for specific pain patterns.' },
  ],
  inflammation: [
    { slug: 'curcumin', label: 'Curcumin', note: 'Human inflammatory-marker and joint evidence.' },
    { slug: 'boswellia', label: 'Boswellia', note: 'Inflammation-adjacent joint outcome evidence.' },
    { slug: 'omega-3', label: 'Omega-3', note: 'EPA/DHA evidence across inflammatory contexts.' },
  ],
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

export function getGoalIngredientCandidates(goalSlug: string, limit = 4): GoalIngredientCandidate[] {
  return (GOAL_INGREDIENT_CANDIDATES[goalSlug] ?? []).slice(0, limit)
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
