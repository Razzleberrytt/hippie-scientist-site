import freshnessData from '@/public/data/freshness-metadata.json'

interface FreshnessInfo {
  lastReviewed: string
  citationCount: number
}

export function getHomepageFreshness(): FreshnessInfo {
  return {
    lastReviewed: freshnessData.homepage.lastReviewed,
    citationCount: freshnessData.homepage.citationCount,
  }
}

export function getGoalFreshness(goalSlug: string): FreshnessInfo {
  const goal = (freshnessData.goals as Record<string, FreshnessInfo>)[goalSlug]
  return {
    lastReviewed: goal?.lastReviewed || '2026-06-06',
    citationCount: goal?.citationCount || 0,
  }
}

export function getProfileFreshness(slug: string): FreshnessInfo {
  const profile = (freshnessData.profiles as Record<string, FreshnessInfo>)[slug]
  return {
    lastReviewed: profile?.lastReviewed || '2026-06-06',
    citationCount: profile?.citationCount || 0,
  }
}
