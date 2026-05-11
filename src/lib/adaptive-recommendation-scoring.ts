import { buildAuthorityHierarchy } from '@/lib/runtime-authority-hierarchy'
import { buildEvidenceConfidence } from '@/lib/runtime-evidence-confidence'
import { buildRuntimeGovernance } from '@/lib/runtime-governance'
import {
  clampScore,
  safeArray,
  safeObject,
  safeText,
} from '@/lib/runtime-render-guards'

export type AdaptiveRecommendationScore = {
  slug: string
  adaptiveScore: number
  authorityScore: number
  evidenceScore: number
  freshnessScore: number
  continuityScore: number
  ecosystemScore: number
  recommendationTier:
    | 'primary'
    | 'secondary'
    | 'supporting'
    | 'suppressed'
}

function overlapScore(source: any, candidate: any) {
  const sourceClusters = new Set(
    safeArray<string>(source?.clusters || source?.ecosystem_taxonomy),
  )

  const candidateClusters = safeArray<string>(
    candidate?.clusters || candidate?.ecosystem_taxonomy,
  )

  const overlap = candidateClusters.filter((cluster) =>
    sourceClusters.has(cluster),
  ).length

  return clampScore(overlap * 22, 30)
}

function ecosystemDensity(candidate: any) {
  return clampScore(
    safeArray(candidate?.clusters).length * 12 +
      safeArray(candidate?.ecosystem_taxonomy).length * 14 +
      safeArray(candidate?.pathways).length * 8,
    35,
  )
}

function tier(score: number): AdaptiveRecommendationScore['recommendationTier'] {
  if (score >= 78) {
    return 'primary'
  }

  if (score >= 62) {
    return 'secondary'
  }

  if (score >= 45) {
    return 'supporting'
  }

  return 'suppressed'
}

export function buildAdaptiveRecommendationScores(
  source: unknown,
  candidates: unknown,
): AdaptiveRecommendationScore[] {
  const record = safeObject(source)

  return safeArray(candidates)
    .map((candidateValue) => {
      const candidate = safeObject(candidateValue)
      const slug = safeText(candidate.slug)

      const authority = buildAuthorityHierarchy(candidate)
      const evidence = buildEvidenceConfidence(candidate)
      const governance = buildRuntimeGovernance(candidate)
      const continuityScore = overlapScore(record, candidate)
      const ecosystemScore = ecosystemDensity(candidate)

      const adaptiveScore = clampScore(
        Math.round(
          authority.authorityScore * 0.24 +
            evidence.confidenceScore * 0.24 +
            governance.freshnessScore * 0.18 +
            continuityScore * 0.2 +
            ecosystemScore * 0.14,
        ),
        0,
      )

      return {
        slug,
        adaptiveScore,
        authorityScore: authority.authorityScore,
        evidenceScore: evidence.confidenceScore,
        freshnessScore: governance.freshnessScore,
        continuityScore,
        ecosystemScore,
        recommendationTier: tier(adaptiveScore),
      }
    })
    .filter((item) => item.slug.length > 0)
    .sort((a, b) => b.adaptiveScore - a.adaptiveScore)
}
