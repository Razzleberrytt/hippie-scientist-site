import { text } from '@/lib/display-utils'
import { topAuthorityProfiles } from '@/lib/top-authority-priority'

export function detectContentGap(record: Record<string, unknown>) {
  return !text(record?.summary) || text(record?.summary).length < 240
}

export function detectCompareGap(record: Record<string, unknown>) {
  return !(Array.isArray(record?.compare_candidates) && record.compare_candidates.length || Array.isArray(record?.compareCandidates) && record.compareCandidates.length)
}

export function detectEcosystemGap(record: Record<string, unknown>) {
  return !(Array.isArray(record?.topics) && record.topics.length || Array.isArray(record?.pathways) && record.pathways.length)
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
