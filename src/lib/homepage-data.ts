import homepageData from '@/generated/homepage-data.json'
import type { Herb } from '@/types'

export type HomepageQuality = {
  score: number
  flags: {
    isIncomplete: boolean
    hasPlaceholderText: boolean
    hasWeakSources: boolean
  }
}

export type HomepageGovernedSummary = {
  label: string
  title: string
  hasHumanEvidence: boolean
  safetyCautionsPresent: boolean
  mechanismCoveragePresent: boolean
  conflictingEvidence: boolean
  enrichedAndReviewed: boolean
  lastReviewedAt: string
}

export type HomepageFeaturedItem = {
  slug: string
  name: string
  blurb: string
  kind: 'herb' | 'compound'
  whyItMatters: string
  quality: HomepageQuality
  qualityBadge: 'High confidence' | 'Needs sources' | 'Incomplete' | 'Enriched + reviewed'
  governedSummary?: HomepageGovernedSummary | null
  governedEligible?: boolean
  publicationIndexed?: boolean
  governanceSource?: 'approved_governed_rollup' | 'none'
}

type HomepagePayload = {
  generatedAt: string
  counts: { herbs: number; compounds: number; articles: number }
  trustBadges: string[]
  popularEffects: string[]
  featuredPool: HomepageFeaturedItem[]
  diverseFeatured: HomepageFeaturedItem[]
  curated: HomepageFeaturedItem[]
  governedHighlights: HomepageFeaturedItem[]
  effectExplorerHerbs: Herb[]
}

const payload = homepageData as HomepagePayload

function dayHash() {
  const seed = new Date().toISOString().slice(0, 10)
  return Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function rotate<T>(items: T[], startIndex: number) {
  if (!items.length) return []
  const offset = startIndex % items.length
  return [...items.slice(offset), ...items.slice(0, offset)]
}

export function getHomepageFeaturedItems(): HomepageFeaturedItem[] {
  const dailyPool = payload.featuredPool
  const diversePool = payload.diverseFeatured
  if (!dailyPool.length && !diversePool.length) return []

  const hash = dayHash()
  const dailyPick = dailyPool[hash % Math.max(1, dailyPool.length)]
  const rotatedDiverse = rotate(diversePool, hash)
  const merged = dailyPick
    ? [dailyPick, ...rotatedDiverse.filter(item => item.slug !== dailyPick.slug)]
    : rotatedDiverse

  return merged.slice(0, 5)
}

export function getHomepageData() {
  return {
    generatedAt: payload.generatedAt,
    counts: payload.counts,
    trustBadges: payload.trustBadges,
    popularEffects: payload.popularEffects,
    curated: payload.curated,
    featured: getHomepageFeaturedItems(),
    governedHighlights: payload.governedHighlights,
    effectExplorerHerbs: payload.effectExplorerHerbs,
  }
}
