import { citationCompleteness } from './citation-identifiers.mjs'
import {
  approvedClaims,
  canonicalStudyGroups,
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
  type ResearchSource,
} from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type ClaimCitationMetadataCoverage = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  studyCount: number
  completeStudyCount: number
  metadataCoverage: number
  missingFieldCounts: Record<string, number>
  lowMetadataCoverage: boolean
  highConfidenceLowMetadataCoverage: boolean
}

export type ClaimCitationMetadataAnalysis = {
  claims: ClaimCitationMetadataCoverage[]
  lowCoverageClaims: ClaimCitationMetadataCoverage[]
  highConfidenceLowCoverageClaims: ClaimCitationMetadataCoverage[]
  summary: {
    approvedClaimsWithStudies: number
    lowMetadataCoverageClaims: number
    highConfidenceLowMetadataCoverageClaims: number
    averageMetadataCoverage: number
  }
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function canonicalGroupMissingFields(group: ResearchSource[]): string[] {
  if (!group.length) return ['identifier', 'title', 'year', 'authors', 'journal']
  const missingBySource = group.map((source) => new Set(citationCompleteness(source).missing))
  const fields = ['identifier', 'title', 'year', 'authors', 'journal']
  return fields.filter((field) => missingBySource.every((missing) => missing.has(field)))
}

/**
 * Measure citation metadata completeness only for canonical studies that carry
 * approved claims. Duplicate source aliases are merged before completeness is
 * assessed, so an incomplete alias does not penalize a study when another alias
 * already supplies the missing metadata.
 */
export function analyzeClaimCitationMetadata(
  analysis: ResearchQualityAnalysis,
): ClaimCitationMetadataAnalysis {
  const qualityByKey = new Map(
    analysis.claimAnalyses.map((claim) => [`${claim.url}::${claim.claimId}`, claim] as const),
  )
  const claims: ClaimCitationMetadataCoverage[] = []

  for (const { url, record } of analysis.profiles) {
    const identities = canonicalStudyIdentityMap(record)
    const groups = canonicalStudyGroups(record)
    const missingByStudy = new Map<string, string[]>()
    for (const [studyId, group] of groups) missingByStudy.set(studyId, canonicalGroupMissingFields(group))

    for (const rawClaim of approvedClaims(record)) {
      const claimId = String(rawClaim.id ?? 'unknown-claim')
      const quality = qualityByKey.get(`${url}::${claimId}`)
      if (!quality) continue
      const studyIds = uniqueClaimStudyIdentities(rawClaim, identities)
      if (!studyIds.length) continue

      const missingFieldCounts: Record<string, number> = {}
      let completeStudyCount = 0
      for (const studyId of studyIds) {
        const missing = missingByStudy.get(studyId) ?? ['identifier', 'title', 'year', 'authors', 'journal']
        if (missing.length === 0) completeStudyCount += 1
        for (const field of missing) missingFieldCounts[field] = (missingFieldCounts[field] ?? 0) + 1
      }

      const metadataCoverage = completeStudyCount / studyIds.length
      const lowMetadataCoverage = studyIds.length >= 2 && metadataCoverage < 0.7
      claims.push({
        url,
        claimId,
        predicate: quality.predicate,
        confidence: quality.confidence,
        studyCount: studyIds.length,
        completeStudyCount,
        metadataCoverage: round(metadataCoverage),
        missingFieldCounts,
        lowMetadataCoverage,
        highConfidenceLowMetadataCoverage: lowMetadataCoverage && quality.confidence >= 0.75,
      })
    }
  }

  claims.sort((a, b) =>
    Number(b.highConfidenceLowMetadataCoverage) - Number(a.highConfidenceLowMetadataCoverage)
    || Number(b.lowMetadataCoverage) - Number(a.lowMetadataCoverage)
    || a.metadataCoverage - b.metadataCoverage
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const lowCoverageClaims = claims.filter((claim) => claim.lowMetadataCoverage)
  const highConfidenceLowCoverageClaims = claims.filter((claim) => claim.highConfidenceLowMetadataCoverage)
  const averageMetadataCoverage = claims.length
    ? claims.reduce((sum, claim) => sum + claim.metadataCoverage, 0) / claims.length
    : 1

  return {
    claims,
    lowCoverageClaims,
    highConfidenceLowCoverageClaims,
    summary: {
      approvedClaimsWithStudies: claims.length,
      lowMetadataCoverageClaims: lowCoverageClaims.length,
      highConfidenceLowMetadataCoverageClaims: highConfidenceLowCoverageClaims.length,
      averageMetadataCoverage: round(averageMetadataCoverage),
    },
  }
}
