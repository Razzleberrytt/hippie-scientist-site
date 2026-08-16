import type { ResearchQualityTopology } from './research-quality-topology'

export type ClaimEvidenceIndependenceCoverage = {
  url: string
  claimId: string
  confidence: number
  studyCount: number
  registryCoverage: number
  nonRegistryLineageCoverage: number
  combinedCoverage: number
  unresolvedStudyCount: number
  independenceUnresolved: boolean
  highConfidenceIndependenceUnresolved: boolean
}

export type EvidenceIndependenceCoverage = {
  claims: ClaimEvidenceIndependenceCoverage[]
  unresolvedClaims: ClaimEvidenceIndependenceCoverage[]
  highConfidenceUnresolvedClaims: ClaimEvidenceIndependenceCoverage[]
  summary: {
    multiStudyApprovedClaims: number
    fullyResolvedClaims: number
    unresolvedClaims: number
    highConfidenceUnresolvedClaims: number
    meanCombinedCoverage: number
  }
}

function round(value: number, digits = 3): number {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

/**
 * Combine the two explicit lineage systems already present in the canonical
 * topology. This measures our ability to assess independence; it never treats
 * missing lineage as evidence that publications are dependent.
 */
export function analyzeEvidenceIndependenceCoverage(
  topology: Pick<ResearchQualityTopology, 'trialRegistrationIndependence' | 'evidenceLineage'>,
): EvidenceIndependenceCoverage {
  const registryByClaim = new Map(
    topology.trialRegistrationIndependence.claims.map((claim) => [`${claim.url}::${claim.claimId}`, claim]),
  )
  const lineageByClaim = new Map(
    topology.evidenceLineage.claims.map((claim) => [`${claim.url}::${claim.claimId}`, claim]),
  )

  const claimKeys = new Set([...registryByClaim.keys(), ...lineageByClaim.keys()])
  const claims: ClaimEvidenceIndependenceCoverage[] = []

  for (const key of claimKeys) {
    const registry = registryByClaim.get(key)
    const lineage = lineageByClaim.get(key)
    const [url, claimId] = key.split('::')
    const studyCount = registry?.apparentStudyCount ?? lineage?.studyCount ?? 0
    if (studyCount < 2) continue

    const registryKnown = registry?.registryKnownStudyCount ?? 0
    const lineageKnown = lineage?.studiesWithExplicitLineage ?? 0
    // We cannot safely know whether the same studies are represented in both
    // sources, so combined coverage uses the stronger explicit coverage rather
    // than summing and risking false certainty.
    const registryCoverage = registry?.registryCoverage ?? 0
    const nonRegistryLineageCoverage = lineage?.explicitLineageCoverage ?? 0
    const combinedCoverage = Math.max(registryCoverage, nonRegistryLineageCoverage)
    const resolvedStudyCount = Math.min(studyCount, Math.max(registryKnown, lineageKnown))
    const unresolvedStudyCount = Math.max(0, studyCount - resolvedStudyCount)
    const confidence = registry?.confidence ?? lineage?.confidence ?? 0
    const independenceUnresolved = unresolvedStudyCount > 0

    claims.push({
      url,
      claimId,
      confidence,
      studyCount,
      registryCoverage: round(registryCoverage),
      nonRegistryLineageCoverage: round(nonRegistryLineageCoverage),
      combinedCoverage: round(combinedCoverage),
      unresolvedStudyCount,
      independenceUnresolved,
      highConfidenceIndependenceUnresolved: independenceUnresolved && confidence >= 0.75,
    })
  }

  claims.sort((a, b) =>
    Number(b.highConfidenceIndependenceUnresolved) - Number(a.highConfidenceIndependenceUnresolved)
    || b.unresolvedStudyCount - a.unresolvedStudyCount
    || a.combinedCoverage - b.combinedCoverage
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )

  const unresolvedClaims = claims.filter((claim) => claim.independenceUnresolved)
  const highConfidenceUnresolvedClaims = claims.filter((claim) => claim.highConfidenceIndependenceUnresolved)

  return {
    claims,
    unresolvedClaims,
    highConfidenceUnresolvedClaims,
    summary: {
      multiStudyApprovedClaims: claims.length,
      fullyResolvedClaims: claims.length - unresolvedClaims.length,
      unresolvedClaims: unresolvedClaims.length,
      highConfidenceUnresolvedClaims: highConfidenceUnresolvedClaims.length,
      meanCombinedCoverage: round(claims.length ? claims.reduce((sum, claim) => sum + claim.combinedCoverage, 0) / claims.length : 1),
    },
  }
}
