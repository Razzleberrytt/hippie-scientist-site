import type { ResearchClaim } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

function claimKey(url: string, claimId: unknown): string {
  return `${url}::${String(claimId ?? 'unknown-claim')}`
}

/**
 * Canonical outcome-claim eligibility is computed once by research-quality
 * analysis. Downstream topology analyzers consume that decision instead of
 * maintaining competing predicate regexes.
 */
export function canonicalOutcomeClaimKeys(analysis: ResearchQualityAnalysis): Set<string> {
  return new Set(
    analysis.claimAnalyses
      .filter((claim) => claim.outcomeClaim)
      .map((claim) => claimKey(claim.url, claim.claimId)),
  )
}

export function isCanonicalOutcomeClaim(
  keys: ReadonlySet<string>,
  url: string,
  claim: ResearchClaim,
): boolean {
  return keys.has(claimKey(url, claim.id))
}
