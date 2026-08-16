import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type CrossProfileStudyLoad = {
  studyId: string
  approvedClaimCount: number
  profileCount: number
  outcomeClaimCount: number
  highConfidenceClaimCount: number
  profiles: string[]
  claims: Array<{ url: string; claimId: string; predicate: string; confidence: number }>
  systemicLoadBearing: boolean
}

export type EvidenceBundleReuse = {
  url: string
  studyIds: string[]
  studyCount: number
  approvedClaimCount: number
  outcomeClaimCount: number
  highConfidenceClaimCount: number
  predicates: string[]
  claims: Array<{ claimId: string; predicate: string; confidence: number }>
  repeatedEvidenceBundle: boolean
  narrowRepeatedEvidenceBundle: boolean
}

/**
 * Measure how many approved claims and profiles depend on each canonical study.
 * This complements per-profile concentration: a study may look harmless on every
 * individual page while still underwriting a large portion of the site globally.
 */
export function analyzeCrossProfileStudyLoad(analysis: ResearchQualityAnalysis): CrossProfileStudyLoad[] {
  const byStudy = new Map<string, {
    profiles: Set<string>
    claims: Map<string, { url: string; claimId: string; predicate: string; confidence: number }>
    outcomeClaimCount: number
    highConfidenceClaimCount: number
  }>()

  for (const claim of analysis.claimAnalyses) {
    for (const studyId of claim.studyIds) {
      const item = byStudy.get(studyId) ?? {
        profiles: new Set<string>(),
        claims: new Map<string, { url: string; claimId: string; predicate: string; confidence: number }>(),
        outcomeClaimCount: 0,
        highConfidenceClaimCount: 0,
      }
      const claimKey = `${claim.url}#${claim.claimId}`
      if (!item.claims.has(claimKey)) {
        item.claims.set(claimKey, {
          url: claim.url,
          claimId: claim.claimId,
          predicate: claim.predicate,
          confidence: claim.confidence,
        })
        if (claim.outcomeClaim) item.outcomeClaimCount += 1
        if (claim.confidence >= 0.75) item.highConfidenceClaimCount += 1
      }
      item.profiles.add(claim.url)
      byStudy.set(studyId, item)
    }
  }

  return [...byStudy.entries()]
    .map(([studyId, item]) => {
      const approvedClaimCount = item.claims.size
      const profileCount = item.profiles.size
      return {
        studyId,
        approvedClaimCount,
        profileCount,
        outcomeClaimCount: item.outcomeClaimCount,
        highConfidenceClaimCount: item.highConfidenceClaimCount,
        profiles: [...item.profiles].sort(),
        claims: [...item.claims.values()].sort((a, b) => a.url.localeCompare(b.url) || a.claimId.localeCompare(b.claimId)),
        systemicLoadBearing: approvedClaimCount >= 5 && profileCount >= 3,
      }
    })
    .sort((a, b) =>
      Number(b.systemicLoadBearing) - Number(a.systemicLoadBearing)
      || b.approvedClaimCount - a.approvedClaimCount
      || b.profileCount - a.profileCount
      || a.studyId.localeCompare(b.studyId),
    )
}

/**
 * Detect multiple approved structured claims on the same profile that reuse the
 * exact same canonical evidence bundle. Reuse is not automatically wrong, but
 * it is a topology warning when several apparently distinct claims are all
 * underwritten by the same narrow study set.
 */
export function analyzeEvidenceBundleReuse(analysis: ResearchQualityAnalysis): EvidenceBundleReuse[] {
  const bundles = new Map<string, {
    url: string
    studyIds: string[]
    claims: Array<{ claimId: string; predicate: string; confidence: number; outcomeClaim: boolean }>
  }>()

  for (const claim of analysis.claimAnalyses) {
    if (claim.studyIds.length === 0) continue
    const studyIds = [...claim.studyIds].sort()
    const key = `${claim.url}::${studyIds.join('|')}`
    const item = bundles.get(key) ?? { url: claim.url, studyIds, claims: [] }
    item.claims.push({
      claimId: claim.claimId,
      predicate: claim.predicate,
      confidence: claim.confidence,
      outcomeClaim: claim.outcomeClaim,
    })
    bundles.set(key, item)
  }

  return [...bundles.values()]
    .filter((item) => item.claims.length >= 2)
    .map((item) => {
      const predicates = [...new Set(item.claims.map((claim) => claim.predicate))].sort()
      const approvedClaimCount = item.claims.length
      const outcomeClaimCount = item.claims.filter((claim) => claim.outcomeClaim).length
      const highConfidenceClaimCount = item.claims.filter((claim) => claim.confidence >= 0.75).length
      const studyCount = item.studyIds.length
      return {
        url: item.url,
        studyIds: item.studyIds,
        studyCount,
        approvedClaimCount,
        outcomeClaimCount,
        highConfidenceClaimCount,
        predicates,
        claims: item.claims
          .map(({ claimId, predicate, confidence }) => ({ claimId, predicate, confidence }))
          .sort((a, b) => a.claimId.localeCompare(b.claimId)),
        repeatedEvidenceBundle: approvedClaimCount >= 2,
        narrowRepeatedEvidenceBundle: approvedClaimCount >= 3 && studyCount <= 2,
      }
    })
    .sort((a, b) =>
      Number(b.narrowRepeatedEvidenceBundle) - Number(a.narrowRepeatedEvidenceBundle)
      || b.approvedClaimCount - a.approvedClaimCount
      || a.studyCount - b.studyCount
      || a.url.localeCompare(b.url),
    )
}
