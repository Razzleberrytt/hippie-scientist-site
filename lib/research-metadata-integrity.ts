import type { ClaimCitationMetadataAnalysis } from './research-claim-citation-metadata'
import type { StudyYearConflict } from './research-evidence-age'
import type { StudyProvenanceConflict } from './research-provenance-concentration'
import type { StudyClassConflictAnalysis } from './research-study-class-conflicts'

export type ResearchMetadataIntegrityProfile = {
  url: string
  yearConflicts: number
  provenanceConflicts: number
  studyClassConflicts: number
  severeStudyClassConflicts: number
  lowCitationMetadataClaims: number
  highConfidenceLowCitationMetadataClaims: number
  issueCount: number
  severeIssueCount: number
}

export type ResearchMetadataIntegrity = {
  profiles: ResearchMetadataIntegrityProfile[]
  summary: {
    profilesWithIssues: number
    profilesWithSevereIssues: number
    yearConflicts: number
    provenanceConflicts: number
    studyClassConflicts: number
    severeStudyClassConflicts: number
    lowCitationMetadataClaims: number
    highConfidenceLowCitationMetadataClaims: number
  }
}

type MetadataIntegrityInputs = {
  studyYearConflicts: readonly StudyYearConflict[]
  provenanceConflicts: readonly StudyProvenanceConflict[]
  studyClassConflicts: StudyClassConflictAnalysis
  claimCitationMetadata: ClaimCitationMetadataAnalysis
}

type MutableProfile = Omit<ResearchMetadataIntegrityProfile, 'issueCount' | 'severeIssueCount'>

function emptyProfile(url: string): MutableProfile {
  return {
    url,
    yearConflicts: 0,
    provenanceConflicts: 0,
    studyClassConflicts: 0,
    severeStudyClassConflicts: 0,
    lowCitationMetadataClaims: 0,
    highConfidenceLowCitationMetadataClaims: 0,
  }
}

/**
 * Canonical roll-up for metadata-integrity findings. Specialized analyzers own
 * detection; this layer only groups their outputs by profile so reporting and
 * remediation consumers do not rebuild overlapping metadata summaries.
 */
export function buildResearchMetadataIntegrity(inputs: MetadataIntegrityInputs): ResearchMetadataIntegrity {
  const byUrl = new Map<string, MutableProfile>()
  const profile = (url: string) => {
    const value = byUrl.get(url) ?? emptyProfile(url)
    byUrl.set(url, value)
    return value
  }

  for (const conflict of inputs.studyYearConflicts) profile(conflict.url).yearConflicts += 1
  for (const conflict of inputs.provenanceConflicts) profile(conflict.url).provenanceConflicts += 1
  for (const conflict of inputs.studyClassConflicts.conflicts) {
    const value = profile(conflict.url)
    value.studyClassConflicts += 1
    if (conflict.severe) value.severeStudyClassConflicts += 1
  }
  for (const claim of inputs.claimCitationMetadata.lowCoverageClaims) profile(claim.url).lowCitationMetadataClaims += 1
  for (const claim of inputs.claimCitationMetadata.highConfidenceLowCoverageClaims) {
    profile(claim.url).highConfidenceLowCitationMetadataClaims += 1
  }

  const profiles = [...byUrl.values()]
    .map((value): ResearchMetadataIntegrityProfile => {
      const issueCount = value.yearConflicts
        + value.provenanceConflicts
        + value.studyClassConflicts
        + value.lowCitationMetadataClaims
      const severeIssueCount = value.severeStudyClassConflicts + value.highConfidenceLowCitationMetadataClaims
      return { ...value, issueCount, severeIssueCount }
    })
    .filter((value) => value.issueCount > 0)
    .sort((a, b) =>
      b.severeIssueCount - a.severeIssueCount
      || b.issueCount - a.issueCount
      || a.url.localeCompare(b.url),
    )

  return {
    profiles,
    summary: {
      profilesWithIssues: profiles.length,
      profilesWithSevereIssues: profiles.filter((value) => value.severeIssueCount > 0).length,
      yearConflicts: inputs.studyYearConflicts.length,
      provenanceConflicts: inputs.provenanceConflicts.length,
      studyClassConflicts: inputs.studyClassConflicts.conflicts.length,
      severeStudyClassConflicts: inputs.studyClassConflicts.severeConflicts.length,
      lowCitationMetadataClaims: inputs.claimCitationMetadata.lowCoverageClaims.length,
      highConfidenceLowCitationMetadataClaims: inputs.claimCitationMetadata.highConfidenceLowCoverageClaims.length,
    },
  }
}
