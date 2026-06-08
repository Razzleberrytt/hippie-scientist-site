import { text } from '@/lib/display-utils'
import { topAuthorityProfiles } from '@/lib/top-authority-priority'

export function detectContentGap(record: Record<string, unknown>) {
  return !text(record?.summary) || text(record?.summary).length < 240
}

export function detectCompareGap(record: Record<string, unknown>) {
  return !(record?.compare_candidates?.length || record?.compareCandidates?.length)
}

export function detectEcosystemGap(record: Record<string, unknown>) {
  return !(record?.topics?.length || record?.pathways?.length)
}

export function buildPublishingOpportunity(record: Record<string, unknown>) {
  const slug = text(record?.slug)

  return {
    slug,
    authorityPriority: topAuthorityProfiles.includes(slug),
    needsContentExpansion: detectContentGap(record),
    needsCompareExpansion: detectCompareGap(record),
    needsEcosystemExpansion: detectEcosystemGap(record),
  }
}
