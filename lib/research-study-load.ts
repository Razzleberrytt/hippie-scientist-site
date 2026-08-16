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
