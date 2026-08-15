import freshnessData from '@/public/data/freshness-metadata.json'

export interface FreshnessInfo {
  lastReviewed: string
  evidenceSearchDate: string
  factualUpdatedAt: string
  templateUpdatedAt: string
  citationCount: number
}

type PartialFreshnessInfo = Partial<FreshnessInfo>

function normalizeFreshness(info: PartialFreshnessInfo | undefined): FreshnessInfo {
  return {
    lastReviewed: info?.lastReviewed || '',
    evidenceSearchDate: info?.evidenceSearchDate || '',
    factualUpdatedAt: info?.factualUpdatedAt || '',
    templateUpdatedAt: info?.templateUpdatedAt || '',
    citationCount: info?.citationCount || 0,
  }
}

export function getHomepageFreshness(): FreshnessInfo {
  return normalizeFreshness(freshnessData.homepage as PartialFreshnessInfo)
}

export function getGoalFreshness(goalSlug: string): FreshnessInfo {
  const goal = (freshnessData.goals as Record<string, PartialFreshnessInfo>)[goalSlug]
  return normalizeFreshness(goal)
}

export function getProfileFreshness(slug: string): FreshnessInfo {
  const profile = (freshnessData.profiles as Record<string, PartialFreshnessInfo>)[slug]
  return normalizeFreshness(profile)
}
