import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'
import { evaluateSemanticAuthority } from './semantic-authority'

export type ConfidenceAwareRendering = {
  renderMode:
    | 'expanded-authority'
    | 'standard-authority'
    | 'conservative-authority'
    | 'minimal-authority'
  showExpandedDiscovery: boolean
  showFreshnessNotice: boolean
  showContinuityModules: boolean
  showProtocolModules: boolean
  suppressAggressiveRecommendations: boolean
  indexingEligible: boolean
  authorityStrength: number
  reasons: string[]
}

export function buildConfidenceAwareRendering(
  record: any,
): ConfidenceAwareRendering {
  const confidence = calculateSemanticConfidence(record)
  const freshness = calculateSemanticFreshness(record)
  const authority = evaluateSemanticAuthority(record)

  const reasons: string[] = [
    ...confidence.reasons,
    ...freshness.reasons,
    ...authority.reasons,
  ]

  let renderMode: ConfidenceAwareRendering['renderMode'] = 'minimal-authority'

  if (
    confidence.confidence === 'strong' &&
    authority.confidence === 'strong'
  ) {
    renderMode = 'expanded-authority'
  } else if (
    confidence.confidence === 'moderate'
  ) {
    renderMode = 'standard-authority'
  } else if (
    confidence.confidence === 'low'
  ) {
    renderMode = 'conservative-authority'
  }

  const authorityStrength = Math.min(
    Math.round(
      confidence.score * 0.5 +
      freshness.authorityFreshness * 0.25 +
      (authority.confidence === 'strong' ? 25 : 10),
    ),
    100,
  )

  return {
    renderMode,
    showExpandedDiscovery: authorityStrength >= 75,
    showFreshnessNotice: freshness.freshnessScore <= 52,
    showContinuityModules: confidence.routingConfidence >= 58,
    showProtocolModules: confidence.recommendationConfidence >= 62,
    suppressAggressiveRecommendations:
      confidence.confidence === 'low',
    indexingEligible: authority.canIndex,
    authorityStrength,
    reasons,
  }
}
