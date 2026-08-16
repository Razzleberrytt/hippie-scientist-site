import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  approvedClaims,
  canonicalStudyClass,
  canonicalStudyGroups,
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
  type ResearchClaim,
} from './research-coverage'
import type { OutcomeMetadataAnalysis } from './research-outcome-metadata'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type OutcomeMetadataCoverageCounts = {
  primaryHumanStudies: number
  studiesWithOutcomeMetadata: number
  studiesWithRegistryIds: number
  studiesWithNamedRegisteredPrimary: number
  studiesWithNamedReportedPrimary: number
  studiesWithNamedAlignmentData: number
}

export type ProfileOutcomeMetadataCoverage = OutcomeMetadataCoverageCounts & {
  url: string
  outcomeMetadataCoverage: number
  registryCoverage: number
  namedRegisteredPrimaryCoverage: number
  namedReportedPrimaryCoverage: number
  namedAlignmentCoverage: number
  lowOutcomeMetadataCoverage: boolean
  lowNamedAlignmentCoverage: boolean
}

export type ClaimOutcomeMetadataCoverage = OutcomeMetadataCoverageCounts & {
  url: string
  claimId: string
  predicate: string
  confidence: number
  outcomeMetadataCoverage: number
  namedAlignmentCoverage: number
  outcomeMetadataGap: boolean
  highConfidenceOutcomeMetadataGap: boolean
}

export type OutcomeMetadataCoverageAnalysis = {
  profiles: ProfileOutcomeMetadataCoverage[]
  claims: ClaimOutcomeMetadataCoverage[]
  profileCoverageGaps: ProfileOutcomeMetadataCoverage[]
  claimCoverageGaps: ClaimOutcomeMetadataCoverage[]
  highConfidenceClaimCoverageGaps: ClaimOutcomeMetadataCoverage[]
  summary: {
    profiles: number
    profilesWithPrimaryHumanEvidence: number
    profileCoverageGaps: number
    approvedOutcomeClaimsWithPrimaryHumanEvidence: number
    claimCoverageGaps: number
    highConfidenceClaimCoverageGaps: number
  }
}

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

function rate(numerator: number, denominator: number): number {
  return denominator ? round(numerator / denominator) : 1
}

/** Keep coverage eligibility aligned with ResearchQualityAnalysis.outcomeClaim. */
function isOutcomeClaim(claim: ResearchClaim): boolean {
  return text(claim.predicate) === 'supports_outcome'
}

function countsForStudyIds(
  url: string,
  studyIds: readonly string[],
  metadataByStudy: Map<string, OutcomeMetadataAnalysis['studies'][number]>,
): OutcomeMetadataCoverageCounts {
  const rows = studyIds.map((studyId) => metadataByStudy.get(`${url}::${studyId}`)).filter(Boolean)
  return {
    primaryHumanStudies: studyIds.length,
    studiesWithOutcomeMetadata: rows.filter((row) => row!.hasOutcomeMetadata).length,
    studiesWithRegistryIds: rows.filter((row) => row!.trialRegistrationIds.length > 0).length,
    studiesWithNamedRegisteredPrimary: rows.filter((row) => row!.registeredPrimaryOutcomes.length > 0).length,
    studiesWithNamedReportedPrimary: rows.filter((row) => row!.reportedPrimaryOutcomes.length > 0).length,
    studiesWithNamedAlignmentData: rows.filter((row) =>
      row!.registeredPrimaryOutcomes.length > 0 && row!.reportedPrimaryOutcomes.length > 0,
    ).length,
  }
}

function coverageFields(counts: OutcomeMetadataCoverageCounts) {
  return {
    outcomeMetadataCoverage: rate(counts.studiesWithOutcomeMetadata, counts.primaryHumanStudies),
    registryCoverage: rate(counts.studiesWithRegistryIds, counts.primaryHumanStudies),
    namedRegisteredPrimaryCoverage: rate(counts.studiesWithNamedRegisteredPrimary, counts.primaryHumanStudies),
    namedReportedPrimaryCoverage: rate(counts.studiesWithNamedReportedPrimary, counts.primaryHumanStudies),
    namedAlignmentCoverage: rate(counts.studiesWithNamedAlignmentData, counts.primaryHumanStudies),
  }
}

/**
 * Audit how much canonical primary-human evidence is actually assessable for
 * outcome-reporting integrity. Coverage gaps remain distinct from integrity
 * findings: missing metadata means unknown, not clean and not biased.
 */
export function analyzeOutcomeMetadataCoverage(input: {
  analysis: ResearchQualityAnalysis
  outcomeMetadata: OutcomeMetadataAnalysis
}): OutcomeMetadataCoverageAnalysis {
  const { analysis, outcomeMetadata } = input
  const metadataByStudy = new Map(
    outcomeMetadata.studies.map((study) => [`${study.url}::${study.studyId}`, study]),
  )
  const profiles: ProfileOutcomeMetadataCoverage[] = []
  const claims: ClaimOutcomeMetadataCoverage[] = []

  for (const { url, record } of analysis.profiles) {
    const groups = canonicalStudyGroups(record)
    const primaryHumanStudyIds = [...groups.entries()]
      .filter(([, group]) => PRIMARY_HUMAN_STUDY_CLASSES.has(canonicalStudyClass(group, analysis.cache)))
      .map(([studyId]) => studyId)
    const profileCounts = countsForStudyIds(url, primaryHumanStudyIds, metadataByStudy)
    const profileCoverage = coverageFields(profileCounts)
    profiles.push({
      url,
      ...profileCounts,
      ...profileCoverage,
      lowOutcomeMetadataCoverage: profileCounts.primaryHumanStudies >= 3 && profileCoverage.outcomeMetadataCoverage < 0.5,
      lowNamedAlignmentCoverage: profileCounts.primaryHumanStudies >= 3 && profileCoverage.namedAlignmentCoverage < 0.25,
    })

    const identities = canonicalStudyIdentityMap(record)
    for (const claim of approvedClaims(record)) {
      if (!isOutcomeClaim(claim)) continue
      const linkedStudyIds = uniqueClaimStudyIdentities(claim, identities)
        .filter((studyId) => {
          const group = groups.get(studyId) ?? []
          return group.length > 0 && PRIMARY_HUMAN_STUDY_CLASSES.has(canonicalStudyClass(group, analysis.cache))
        })
      if (!linkedStudyIds.length) continue

      const claimCounts = countsForStudyIds(url, linkedStudyIds, metadataByStudy)
      const claimCoverage = coverageFields(claimCounts)
      const outcomeMetadataGap = claimCoverage.outcomeMetadataCoverage < 0.5 || claimCoverage.namedAlignmentCoverage === 0
      const confidence = Number(claim.confidence ?? 0)
      claims.push({
        url,
        claimId: text(claim.id) || 'unknown-claim',
        predicate: text(claim.predicate),
        confidence,
        ...claimCounts,
        outcomeMetadataCoverage: claimCoverage.outcomeMetadataCoverage,
        namedAlignmentCoverage: claimCoverage.namedAlignmentCoverage,
        outcomeMetadataGap,
        highConfidenceOutcomeMetadataGap: outcomeMetadataGap && confidence >= 0.75,
      })
    }
  }

  profiles.sort((a, b) =>
    Number(b.lowNamedAlignmentCoverage) - Number(a.lowNamedAlignmentCoverage)
    || Number(b.lowOutcomeMetadataCoverage) - Number(a.lowOutcomeMetadataCoverage)
    || a.namedAlignmentCoverage - b.namedAlignmentCoverage
    || a.url.localeCompare(b.url),
  )
  claims.sort((a, b) =>
    Number(b.highConfidenceOutcomeMetadataGap) - Number(a.highConfidenceOutcomeMetadataGap)
    || Number(b.outcomeMetadataGap) - Number(a.outcomeMetadataGap)
    || b.confidence - a.confidence
    || a.namedAlignmentCoverage - b.namedAlignmentCoverage
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )

  const profileCoverageGaps = profiles.filter((profile) => profile.lowOutcomeMetadataCoverage || profile.lowNamedAlignmentCoverage)
  const claimCoverageGaps = claims.filter((claim) => claim.outcomeMetadataGap)
  const highConfidenceClaimCoverageGaps = claims.filter((claim) => claim.highConfidenceOutcomeMetadataGap)

  return {
    profiles,
    claims,
    profileCoverageGaps,
    claimCoverageGaps,
    highConfidenceClaimCoverageGaps,
    summary: {
      profiles: profiles.length,
      profilesWithPrimaryHumanEvidence: profiles.filter((profile) => profile.primaryHumanStudies > 0).length,
      profileCoverageGaps: profileCoverageGaps.length,
      approvedOutcomeClaimsWithPrimaryHumanEvidence: claims.length,
      claimCoverageGaps: claimCoverageGaps.length,
      highConfidenceClaimCoverageGaps: highConfidenceClaimCoverageGaps.length,
    },
  }
}
