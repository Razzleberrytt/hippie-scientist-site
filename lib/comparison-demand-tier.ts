export type ObservedDemandTier = 'high-confidence' | 'promising' | 'emerging' | 'insufficient'
export type EditorialQueueAction = 'build-next' | 'research-first' | 'validate-and-outline' | 'keep-observing' | 'no-action'

export type ObservedDemandInput = {
  impressions: number
  clicks: number
  ctr: number
  observedBehaviorScore: number
}

export function classifyObservedDemand({
  impressions,
  clicks,
  ctr,
  observedBehaviorScore,
}: ObservedDemandInput): ObservedDemandTier {
  if (impressions >= 20 && clicks >= 5 && ctr >= 0.2 && observedBehaviorScore >= 4.5) return 'high-confidence'
  if (impressions >= 10 && clicks >= 2 && ctr >= 0.12 && observedBehaviorScore >= 2.5) return 'promising'
  if (impressions >= 5 && clicks >= 1) return 'emerging'
  return 'insufficient'
}

export function observedDemandRank(tier: ObservedDemandTier) {
  if (tier === 'high-confidence') return 3
  if (tier === 'promising') return 2
  if (tier === 'emerging') return 1
  return 0
}

export function recommendEditorialAction(
  demandTier: ObservedDemandTier,
  evidenceTier: number,
): EditorialQueueAction {
  if (demandTier === 'high-confidence') return evidenceTier >= 2 ? 'build-next' : 'research-first'
  if (demandTier === 'promising') return evidenceTier >= 2 ? 'validate-and-outline' : 'research-first'
  if (demandTier === 'emerging') return 'keep-observing'
  return 'no-action'
}
