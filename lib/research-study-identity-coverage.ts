import type { ResearchQualityAnalysis } from './research-quality-analysis'

const FALLBACK_PREFIX = 'source-ref:'

export type ClaimStudyIdentityCoverage = {
  url: string
  claimId: string
  confidence: number
  studyCount: number
  stableIdentityCount: number
  fallbackIdentityCount: number
  stableIdentityCoverage: number
  uncertainIndependence: boolean
  highConfidenceUncertainIndependence: boolean
}

export type ProfileStudyIdentityCoverage = {
  url: string
  approvedStudyCount: number
  stableIdentityCount: number
  fallbackIdentityCount: number
  stableIdentityCoverage: number
  uncertainMultiStudyClaimCount: number
  highConfidenceUncertainClaimCount: number
  weakIdentityCoverage: boolean
}

export type ResearchStudyIdentityCoverage = {
  claims: ClaimStudyIdentityCoverage[]
  profiles: ProfileStudyIdentityCoverage[]
  summary: {
    approvedClaims: number
    uncertainMultiStudyClaims: number
    highConfidenceUncertainClaims: number
    profilesWithWeakIdentityCoverage: number
  }
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function isFallbackIdentity(studyId: string): boolean {
  return studyId.startsWith(FALLBACK_PREFIX)
}

/**
 * Stable PMID/DOI identities let the topology deduplicate aliases confidently.
 * `source-ref:*` identities preserve usable edges but cannot prove two records
 * are independent publications, so they are reported as identity uncertainty.
 */
export function analyzeStudyIdentityCoverage(analysis: ResearchQualityAnalysis): ResearchStudyIdentityCoverage {
  const claims: ClaimStudyIdentityCoverage[] = analysis.claimAnalyses.map((claim) => {
    const fallbackIdentityCount = claim.studyIds.filter(isFallbackIdentity).length
    const stableIdentityCount = claim.studyCount - fallbackIdentityCount
    const stableIdentityCoverage = claim.studyCount ? stableIdentityCount / claim.studyCount : 1
    const uncertainIndependence = claim.studyCount >= 2 && fallbackIdentityCount > 0
    return {
      url: claim.url,
      claimId: claim.claimId,
      confidence: claim.confidence,
      studyCount: claim.studyCount,
      stableIdentityCount,
      fallbackIdentityCount,
      stableIdentityCoverage: round(stableIdentityCoverage),
      uncertainIndependence,
      highConfidenceUncertainIndependence: uncertainIndependence && claim.confidence >= 0.75,
    }
  })

  const byProfile = new Map<string, typeof claims>()
  for (const claim of claims) {
    const list = byProfile.get(claim.url) ?? []
    list.push(claim)
    byProfile.set(claim.url, list)
  }

  const approvedStudyIdsByProfile = new Map<string, Set<string>>()
  for (const claim of analysis.claimAnalyses) {
    const ids = approvedStudyIdsByProfile.get(claim.url) ?? new Set<string>()
    for (const studyId of claim.studyIds) ids.add(studyId)
    approvedStudyIdsByProfile.set(claim.url, ids)
  }

  const profiles: ProfileStudyIdentityCoverage[] = analysis.profileAnalyses.map((profile) => {
    const studyIds = approvedStudyIdsByProfile.get(profile.url) ?? new Set<string>()
    const fallbackIdentityCount = [...studyIds].filter(isFallbackIdentity).length
    const approvedStudyCount = studyIds.size
    const stableIdentityCount = approvedStudyCount - fallbackIdentityCount
    const stableIdentityCoverage = approvedStudyCount ? stableIdentityCount / approvedStudyCount : 1
    const profileClaims = byProfile.get(profile.url) ?? []
    const uncertainMultiStudyClaimCount = profileClaims.filter((claim) => claim.uncertainIndependence).length
    const highConfidenceUncertainClaimCount = profileClaims.filter((claim) => claim.highConfidenceUncertainIndependence).length
    const weakIdentityCoverage =
      approvedStudyCount >= 3 &&
      (stableIdentityCoverage < 0.8 || uncertainMultiStudyClaimCount >= 2)

    return {
      url: profile.url,
      approvedStudyCount,
      stableIdentityCount,
      fallbackIdentityCount,
      stableIdentityCoverage: round(stableIdentityCoverage),
      uncertainMultiStudyClaimCount,
      highConfidenceUncertainClaimCount,
      weakIdentityCoverage,
    }
  })

  return {
    claims: claims.sort((a, b) =>
      Number(b.highConfidenceUncertainIndependence) - Number(a.highConfidenceUncertainIndependence)
      || Number(b.uncertainIndependence) - Number(a.uncertainIndependence)
      || a.stableIdentityCoverage - b.stableIdentityCoverage
      || a.url.localeCompare(b.url)
      || a.claimId.localeCompare(b.claimId),
    ),
    profiles: profiles.sort((a, b) =>
      Number(b.weakIdentityCoverage) - Number(a.weakIdentityCoverage)
      || b.highConfidenceUncertainClaimCount - a.highConfidenceUncertainClaimCount
      || a.stableIdentityCoverage - b.stableIdentityCoverage
      || a.url.localeCompare(b.url),
    ),
    summary: {
      approvedClaims: claims.length,
      uncertainMultiStudyClaims: claims.filter((claim) => claim.uncertainIndependence).length,
      highConfidenceUncertainClaims: claims.filter((claim) => claim.highConfidenceUncertainIndependence).length,
      profilesWithWeakIdentityCoverage: profiles.filter((profile) => profile.weakIdentityCoverage).length,
    },
  }
}
