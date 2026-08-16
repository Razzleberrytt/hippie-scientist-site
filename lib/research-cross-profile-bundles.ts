import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type CrossProfileEvidenceBundleReuse = {
  studyIds: string[]
  studyCount: number
  profileCount: number
  approvedClaimCount: number
  outcomeClaimCount: number
  highConfidenceClaimCount: number
  profiles: string[]
  predicates: string[]
  claims: Array<{ url: string; claimId: string; predicate: string; confidence: number }>
  narrowCrossProfileBundle: boolean
}

/**
 * Detect the same canonical multi-study evidence bundle being reused across
 * different profiles. Single-study reuse is intentionally left to the existing
 * cross-profile study-load analysis; this focuses on narrow 2-study bundles
 * that can otherwise look diversified while still being copied site-wide.
 */
export function analyzeCrossProfileEvidenceBundles(
  analysis: ResearchQualityAnalysis,
): CrossProfileEvidenceBundleReuse[] {
  const groups = new Map<string, {
    studyIds: string[]
    profiles: Set<string>
    claims: Array<{ url: string; claimId: string; predicate: string; confidence: number; outcomeClaim: boolean }>
  }>()

  for (const claim of analysis.claimAnalyses) {
    if (claim.studyIds.length < 2) continue
    const studyIds = [...claim.studyIds].sort()
    const key = studyIds.join('|')
    const item = groups.get(key) ?? { studyIds, profiles: new Set<string>(), claims: [] }
    item.profiles.add(claim.url)
    item.claims.push({
      url: claim.url,
      claimId: claim.claimId,
      predicate: claim.predicate,
      confidence: claim.confidence,
      outcomeClaim: claim.outcomeClaim,
    })
    groups.set(key, item)
  }

  return [...groups.values()]
    .filter((item) => item.profiles.size >= 2)
    .map((item) => {
      const approvedClaimCount = item.claims.length
      const studyCount = item.studyIds.length
      const profileCount = item.profiles.size
      return {
        studyIds: item.studyIds,
        studyCount,
        profileCount,
        approvedClaimCount,
        outcomeClaimCount: item.claims.filter((claim) => claim.outcomeClaim).length,
        highConfidenceClaimCount: item.claims.filter((claim) => claim.confidence >= 0.75).length,
        profiles: [...item.profiles].sort(),
        predicates: [...new Set(item.claims.map((claim) => claim.predicate))].sort(),
        claims: item.claims
          .map(({ url, claimId, predicate, confidence }) => ({ url, claimId, predicate, confidence }))
          .sort((a, b) => a.url.localeCompare(b.url) || a.claimId.localeCompare(b.claimId)),
        narrowCrossProfileBundle: studyCount <= 2 && profileCount >= 2 && approvedClaimCount >= 3,
      }
    })
    .sort((a, b) =>
      Number(b.narrowCrossProfileBundle) - Number(a.narrowCrossProfileBundle)
      || b.profileCount - a.profileCount
      || b.approvedClaimCount - a.approvedClaimCount
      || a.studyCount - b.studyCount
      || a.studyIds.join('|').localeCompare(b.studyIds.join('|')),
    )
}
