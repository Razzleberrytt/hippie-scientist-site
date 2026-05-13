import { text } from '@/lib/display-utils'
import { topAuthorityProfiles } from '@/lib/top-authority-priority'

export function detectContentGap(record: any) {
  return !text(record?.summary) || text(record?.summary).length < 240
}

export function detectCompareGap(record: any) {
  return !(record?.compare_candidates?.length || record?.compareCandidates?.length)
}

export function detectEcosystemGap(record: any) {
  return !(record?.topics?.length || record?.pathways?.length)
}

export function buildPublishingOpportunity(record: any) {
  const slug = text(record?.slug)

  return {
    slug,
    authorityPriority: topAuthorityProfiles.includes(slug),
    needsContentExpansion: detectContentGap(record),
    needsCompareExpansion: detectCompareGap(record),
    needsEcosystemExpansion: detectEcosystemGap(record),
  }
}
