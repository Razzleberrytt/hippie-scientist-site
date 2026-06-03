import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildSemanticAnalyticsReport } from './semantic-analytics'
import { buildSemanticQAReport } from './semantic-qa'

export type AutonomousSemanticState = {
  autonomousClusters: string[]
  adaptiveWeightAdjustments: Record<string, number>
  retrievalBias: 'authority-first' | 'continuity-first' | 'exploration-first'
  graphRefinementTargets: string[]
  learningSignals: string[]
  ecosystemBalancingTargets: string[]
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

export function buildAutonomousSemanticState(
  source: any,
  records: any[],
): AutonomousSemanticState {
  const analytics = buildSemanticAnalyticsReport(source, records)
  const qa = buildSemanticQAReport(records)
  const supernodes = buildAuthoritySupernodes(records)

  const autonomousClusters = supernodes
    .filter(
      (node) =>
        node.authorityTier === 'foundational' ||
        node.authorityTier === 'canonical',
    )
    .slice(0, 12)
    .map((node) => node.slug)

  const adaptiveWeightAdjustments: Record<string, number> = {}

  for (const [ecosystem, count] of Object.entries(
    analytics.ecosystemEngagement,
  )) {
    adaptiveWeightAdjustments[ecosystem] = Math.min(
      Math.round(count * 1.5),
      100,
    )
  }

  let retrievalBias: AutonomousSemanticState['retrievalBias'] = 'exploration-first'

  if (analytics.runtimeAnalytics.authorityNodes >= 15) {
    retrievalBias = 'authority-first'
  } else if (
    analytics.runtimeAnalytics.continuityNodes >= 20
  ) {
    retrievalBias = 'continuity-first'
  }

  const graphRefinementTargets = [
    ...qa.orphanNodes,
    ...qa.traversalDeadEnds,
  ].slice(0, 20)

  const learningSignals = [
    ...qa.semanticDriftRisks,
    ...qa.redundantClusters,
  ].slice(0, 20)

  const ecosystemBalancingTargets = [
    ...qa.fragmentedEcosystems,
    ...qa.overweightedSupernodes,
  ].slice(0, 20)

  return {
    autonomousClusters,
    adaptiveWeightAdjustments,
    retrievalBias,
    graphRefinementTargets,
    learningSignals,
    ecosystemBalancingTargets,
  }
}
