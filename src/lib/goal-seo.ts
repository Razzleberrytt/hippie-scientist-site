import type { Metadata } from 'next'
import { formatMetaDescription, buildPageMetadata, SEO_YEAR } from '@/lib/seo'
import type { Goal } from '@/data/goals'

const GOAL_SEO_TITLES: Record<string, string> = {
  sleep: `Best Evidence-Based Supplements for Sleep ${SEO_YEAR} – Safety & Comparisons`,
  stress: `Best Supplements for Stress ${SEO_YEAR} – Evidence, Safety & What to Avoid`,
  anxiety: `Best Natural Options for Anxiety Support ${SEO_YEAR} – Compared by Evidence`,
  focus: `Best Focus Supplements ${SEO_YEAR} – Stimulant vs Non-Stimulant Compared`,
  pain: `Best Supplements for Pain Support ${SEO_YEAR} – Evidence & Safety Compared`,
  inflammation: `Best Anti-Inflammatory Supplements ${SEO_YEAR} – Compared by Evidence`,
  cognition: `Best Cognitive Support Supplements ${SEO_YEAR} – Memory & Focus Compared`,
  energy: `Best Energy Supplements ${SEO_YEAR} – Stimulant vs Adaptogen Compared`,
}

const GOAL_SEO_ENTRY_ROUTES: Record<string, string> = {
  sleep: '/best-supplements-for-sleep',
  stress: '/best-supplements-for-stress',
  focus: '/best-supplements-for-focus',
  anxiety: '/best-supplements-for-anxiety',
}

function fallbackGoalTitle(goal: Goal): string {
  const short = goal.title.replace(/\s+decisions?$/i, '').trim()
  return `Best Evidence-Based Supplements for ${short} ${SEO_YEAR}`
}

export function getGoalSeoTitle(goal: Goal): string {
  return GOAL_SEO_TITLES[goal.slug] ?? fallbackGoalTitle(goal)
}

export function buildGoalMetaDescription(
  goal: Goal,
  topNames: string[],
): string {
  const picks = topNames.filter(Boolean).slice(0, 3).join(', ')
  const base = picks
    ? `Compare ${picks} for ${goal.slug} support by evidence strength, safety caveats, timing, and practical tradeoffs.`
    : goal.description
  return formatMetaDescription(
    `${base} Educational comparison only — not medical advice.`,
    goal.description,
    155,
  )
}

export function buildGoalPageMetadata(
  goal: Goal,
  topNames: string[],
): Metadata {
  const title = getGoalSeoTitle(goal)
  const description = buildGoalMetaDescription(goal, topNames)
  return buildPageMetadata({
    title,
    description,
    path: `/goals/${goal.slug}`,
    openGraphType: 'article',
  })
}

export function getGoalSeoEntryRoute(slug: string): string | undefined {
  return GOAL_SEO_ENTRY_ROUTES[slug]
}