import type { Metadata } from 'next'
import { formatMetaDescription, buildPageMetadata, compactMetaTitle, SEO_YEAR } from './seo'
import type { Goal } from '@/data/goals'

const GOAL_SEO_TITLES: Record<string, string> = {
  sleep: `Best Sleep Supplements ${SEO_YEAR}: Evidence & Safety`,
  stress: `Best Stress Supplements ${SEO_YEAR}: Evidence & Safety`,
  anxiety: `Best Anxiety Supplements ${SEO_YEAR}: Evidence & Safety`,
  focus: `Best Focus Supplements ${SEO_YEAR}: Stimulant vs Non-Stimulant`,
  pain: `Best Pain Supplements ${SEO_YEAR}: Evidence & Safety`,
  inflammation: `Best Anti-Inflammatory Supplements ${SEO_YEAR}: Evidence`,
  cognition: `Best Cognitive Supplements ${SEO_YEAR}: Memory & Focus`,
  energy: `Best Energy Supplements ${SEO_YEAR}: Stimulant vs Adaptogen`,
  longevity: `Best Longevity Supplements ${SEO_YEAR}: Evidence & Safety`,
  'blood-pressure': `Best Blood Pressure Supplements ${SEO_YEAR}: Evidence`,
  'testosterone-support': `Best Testosterone Supplements ${SEO_YEAR}: Evidence`,
}

const GOAL_SEO_DESCRIPTIONS: Record<string, string> = {
  sleep:
    'Compare melatonin, magnesium, and L-theanine for sleep onset and wind-down — evidence tiers, grogginess risk, and safety before you stack sedatives.',
  stress:
    'Ashwagandha vs rhodiola vs L-theanine for stress: evidence strength, thyroid and bipolar cautions, and what people stop for.',
  anxiety:
    'Calming options for everyday tension — L-theanine, ashwagandha, and kava compared with medication and liver safety context.',
  focus:
    'Caffeine vs L-theanine vs rhodiola for focus: stimulant tradeoffs, sleep impact, and non-stimulant alternatives compared.',
  pain:
    'Curcumin, boswellia, and PEA for joint discomfort — onset windows, NSAID-adjacent cautions, and evidence limits explained.',
}

const GOAL_SEO_ENTRY_ROUTES: Record<string, string> = {
  sleep: '/guides/sleep/best-supplements-for-sleep',
  stress: '/guides/best/supplements-for-stress',
  focus: '/guides/focus/best-supplements-for-focus',
  anxiety: '/guides/anxiety/best-herbs-for-anxiety',
}

const GOAL_GUIDE_ROUTES: Record<string, string> = {
  sleep: '/guides/sleep',
  stress: '/guides/anxiety',
  anxiety: '/guides/anxiety',
  focus: '/guides/focus',
  cognition: '/guides/focus',
  energy: '/guides/focus',
  pain: '/guides/best/supplements-for-joint-support',
  inflammation: '/guides/best/supplements-for-joint-support',
  'blood-pressure': '/guides/best/supplements-for-blood-pressure',
  'gut-health': '/guides/best/supplements-for-gut-health',
  'fat-loss': '/guides/best/supplements-for-fat-loss',
}

function fallbackGoalTitle(goal: Goal): string {
  const short = goal.title.replace(/\s+decisions?$/i, '').trim()
  return `Best Evidence-Based Supplements for ${short} ${SEO_YEAR}`
}

export function getGoalSeoTitle(goal: Goal): string {
  // Cap the metadata <title> at 60 chars; the visible goal-page H1 is unaffected.
  return compactMetaTitle(GOAL_SEO_TITLES[goal.slug] ?? fallbackGoalTitle(goal))
}

export function buildGoalMetaDescription(
  goal: Goal,
  topNames: string[],
): string {
  const custom = GOAL_SEO_DESCRIPTIONS[goal.slug]
  if (custom) {
    return formatMetaDescription(`${custom} Educational only — not medical advice.`, goal.description, 155)
  }
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
    path: GOAL_GUIDE_ROUTES[goal.slug] ?? '/guides',
    openGraphType: 'article',
  })
}

export function getGoalSeoEntryRoute(slug: string): string | undefined {
  return GOAL_SEO_ENTRY_ROUTES[slug]
}
