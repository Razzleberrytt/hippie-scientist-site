import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'
import { evaluateSemanticAuthority } from './semantic-authority'
import { evaluateSemanticSuppression } from './semantic-suppression'

export type RetrievalPriorityResult = {
  slug: string
  retrievalScore: number
  retrievalTier: 'primary' | 'secondary' | 'supporting' | 'suppressed'
  authorityScore: number
  freshnessScore: number
  confidenceScore: number
  reasons: string[]
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRetrievalPriorities(
  source: any,
  candidates: any[],
): RetrievalPriorityResult[] {
  return candidates
    .map((candidate) => {
      const confidence = calculateSemanticConfidence(candidate)
      const freshness = calculateSemanticFreshness(candidate)
      const authority = evaluateSemanticAuthority(candidate)
      const suppression = evaluateSemanticSuppression(source, candidate)

      const reasons: string[] = [
        ...confidence.reasons,
        ...freshness.reasons,
        ...authority.reasons,
      ]

      let retrievalScore =
        confidence.retrievalConfidence * 0.4 +
        freshness.authorityFreshness * 0.25 +
        confidence.recommendationConfidence * 0.2 +
        (authority.confidence === 'strong' ? 15 : 6)

      retrievalScore -= suppression.redundancyPenalty * 0.45

      retrievalScore = Math.max(
        0,
        Math.min(Math.round(retrievalScore), 100),
      )

      let retrievalTier: RetrievalPriorityResult['retrievalTier'] = 'supporting'

      if (!suppression.allowed) {
        retrievalTier = 'suppressed'
        reasons.push('suppressed-for-semantic-redundancy')
      } else if (retrievalScore >= 78) {
        retrievalTier = 'primary'
      } else if (retrievalScore >= 55) {
        retrievalTier = 'secondary'
      }

      return {
        slug: normalizeText(candidate?.slug || 'discovery'),
        retrievalScore,
        retrievalTier,
        authorityScore: confidence.score,
        freshnessScore: freshness.authorityFreshness,
        confidenceScore: confidence.routingConfidence,
        reasons,
      }
    })
    .sort((a, b) => b.retrievalScore - a.retrievalScore)
}
