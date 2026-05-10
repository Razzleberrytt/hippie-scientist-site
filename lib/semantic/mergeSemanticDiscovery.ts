type DiscoveryRecord = {
  href?: string
  title?: string
  score?: number
  overlap?: string[]
  rationale?: string
}

import { dedupeSemanticRecommendations } from './dedupeSemanticRecommendations'

export function mergeSemanticDiscovery(
  ...groups: DiscoveryRecord[][]
) {
  return dedupeSemanticRecommendations(
    groups.flat().filter(Boolean),
    18
  )
}
