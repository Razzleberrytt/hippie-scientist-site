import type { ResearchQualityTopology } from './research-quality-topology'

export type AggregatedTopologyGapWeights = {
  narrowCrossProfileEvidenceBundle: number
  semanticMismatch: number
  highConfidenceSemanticMismatchBonus: number
  semanticSingleSource: number
  semanticSupportConcentration: number
  highConfidenceSemanticConcentrationBonus: number
  semanticMetadataCoverageGap: number
  highConfidenceSemanticCoverageGapBonus: number
  causalWithoutControlledOrSynthesis: number
  causalWithoutDirectControlled: number
  synthesisOnlyCausalSupport: number
  highConfidenceCausalLanguageBonus: number
  claimCitationMetadataGap: number
  highConfidenceCitationMetadataBonus: number
  provenanceNarrowMultiStudySupport: number
  highConfidenceProvenanceNarrowBonus: number
  pseudoMultiSourceSupport: number
  underlyingStudyPublicationReuse: number
  highConfidenceUnderlyingStudyPublicationReuseBonus: number
  independenceMetadataGap: number
  highConfidenceIndependenceMetadataBonus: number
  severeStudyClassConflict: number
  studyClassAmbiguity: number
}

export type AggregatedTopologyGapSignal = {
  url: string
  kind: string
  weight: number
  detail: string
}

function groupByUrl<T extends { url: string }>(items: readonly T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const item of items) {
    const values = grouped.get(item.url) ?? []
    values.push(item)
    grouped.set(item.url, values)
  }
  return grouped
}

/**
 * Collapse claim-level and bundle-level topology findings to one reason per
 * profile/root issue before dimension-capped scoring. This preserves signal
 * strength while preventing dozens of closely-related claims from swamping the
 * remediation queue.
 */
export function buildAggregatedTopologyGapSignals(
  topology: ResearchQualityTopology,
  weights: AggregatedTopologyGapWeights,
): AggregatedTopologyGapSignal[] {
  const signals: AggregatedTopologyGapSignal[] = []

  const crossProfile = new Map<string, { bundles: number; claims: number; maxProfiles: number }>()
  for (const bundle of topology.narrowCrossProfileEvidenceBundles) {
    for (const url of bundle.profiles) {
      const item = crossProfile.get(url) ?? { bundles: 0, claims: 0, maxProfiles: 0 }
      item.bundles += 1
      item.claims += bundle.claims.filter((claim) => claim.url === url).length
      item.maxProfiles = Math.max(item.maxProfiles, bundle.profileCount)
      crossProfile.set(url, item)
    }
  }
  for (const [url, item] of crossProfile) {
    signals.push({
      url,
      kind: 'narrow-cross-profile-evidence-bundle',
      weight: weights.narrowCrossProfileEvidenceBundle + Math.min(8, Math.max(0, item.bundles - 1) * 2),
      detail: `${item.bundles} narrow multi-study bundle(s) reused across profiles; ${item.claims} approved claim(s) on this profile affected; widest reuse spans ${item.maxProfiles} profiles`,
    })
  }

  for (const [url, items] of groupByUrl(topology.semanticAlignment.findings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    signals.push({
      url,
      kind: 'semantic-claim-source-mismatch',
      weight: weights.semanticMismatch + Math.min(10, Math.max(0, items.length - 1) * 2) + (highConfidence ? weights.highConfidenceSemanticMismatchBonus : 0),
      detail: `${items.length} approved claim(s) have explicit semantic mismatch; ${highConfidence} high-confidence; role ${items.filter((item) => item.roleMismatch).length}, domain ${items.filter((item) => item.domainMismatch).length}, population ${items.filter((item) => item.populationMismatch).length}`,
    })
  }

  for (const [url, items] of groupByUrl(topology.semanticAlignment.concentrationFindings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    const singleSource = items.filter((item) => item.semanticSingleSource).length
    signals.push({
      url,
      kind: 'semantic-support-concentration',
      weight: (singleSource ? weights.semanticSingleSource : weights.semanticSupportConcentration)
        + Math.min(6, Math.max(0, items.length - 1))
        + (highConfidence ? weights.highConfidenceSemanticConcentrationBonus : 0),
      detail: `${items.length} approved claim(s) have concentrated semantic support; ${singleSource} effectively single-source; ${highConfidence} high-confidence`,
    })
  }

  for (const [url, items] of groupByUrl(topology.semanticAlignment.coverageGapFindings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    const minCoverage = Math.min(...items.map((item) => item.semanticMetadataCoverage))
    signals.push({
      url,
      kind: 'semantic-metadata-coverage-gap',
      weight: weights.semanticMetadataCoverageGap + Math.min(6, Math.max(0, items.length - 1)) + (highConfidence ? weights.highConfidenceSemanticCoverageGapBonus : 0),
      detail: `${items.length} approved claim(s) have <50% semantically comparable source coverage; ${highConfidence} high-confidence; minimum coverage ${Math.round(minCoverage * 100)}%`,
    })
  }

  for (const [url, items] of groupByUrl(topology.claimLanguageCalibration.directEvidenceFindings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    const strict = items.filter((item) => item.causalWithoutControlledSupport).length
    const synthesisOnly = items.filter((item) => item.synthesisOnlyCausalSupport).length
    const base = strict > 0
      ? weights.causalWithoutControlledOrSynthesis
      : synthesisOnly === items.length
        ? weights.synthesisOnlyCausalSupport
        : weights.causalWithoutDirectControlled
    signals.push({
      url,
      kind: strict > 0
        ? 'causal-language-without-controlled-or-synthesis'
        : synthesisOnly === items.length
          ? 'synthesis-only-causal-language'
          : 'causal-language-without-direct-controlled-study',
      weight: base + Math.min(8, Math.max(0, items.length - 1) * 2) + (highConfidence ? weights.highConfidenceCausalLanguageBonus : 0),
      detail: `${items.length} direct-causal outcome claim(s) lack directly linked controlled-human evidence; ${strict} lack both controlled-human and synthesis support; ${synthesisOnly} synthesis-only; ${highConfidence} high-confidence`,
    })
  }

  for (const [url, items] of groupByUrl(topology.claimCitationMetadata.lowCoverageClaims)) {
    const highConfidence = items.filter((item) => item.highConfidenceLowMetadataCoverage).length
    const minCoverage = Math.min(...items.map((item) => item.fieldMetadataCoverage))
    signals.push({
      url,
      kind: 'claim-citation-metadata-gap',
      weight: weights.claimCitationMetadataGap + Math.min(6, Math.max(0, items.length - 1)) + (highConfidence ? weights.highConfidenceCitationMetadataBonus : 0),
      detail: `${items.length} approved claim(s) rely on studies with <70% citation-field completeness; ${highConfidence} high-confidence; minimum field coverage ${Math.round(minCoverage * 100)}%`,
    })
  }

  for (const [url, items] of groupByUrl(topology.provenanceNarrowMultiStudyClaims)) {
    const highConfidence = items.filter((item) => item.highConfidenceProvenanceNarrowMultiStudySupport).length
    const sameAuthor = items.filter((item) => item.sameFirstAuthorLineage).length
    const sameJournal = items.filter((item) => item.sameJournalLineage).length
    signals.push({
      url,
      kind: 'claim-provenance-narrow-multi-study-support',
      weight: weights.provenanceNarrowMultiStudySupport + Math.min(6, Math.max(0, items.length - 1)) + (highConfidence ? weights.highConfidenceProvenanceNarrowBonus : 0),
      detail: `${items.length} multi-study approved claim(s) have narrow publication provenance; ${sameAuthor} same-first-author lineage; ${sameJournal} same-journal lineage; ${highConfidence} high-confidence`,
    })
  }

  for (const [url, items] of groupByUrl(topology.edgeCardinality.pseudoMultiSourceClaims.filter((item) => item.approved))) {
    const collapsedRows = items.reduce((sum, item) => sum + item.aliasCollapsedSourceCount, 0)
    const maxNominalSources = Math.max(...items.map((item) => item.validUniqueSourceRefCount))
    signals.push({
      url,
      kind: 'pseudo-multi-source-support',
      weight: weights.pseudoMultiSourceSupport + Math.min(8, Math.max(0, items.length - 1) * 2 + collapsedRows),
      detail: `${items.length} approved claim(s) look multi-source but collapse to one canonical study; ${collapsedRows} redundant source row(s); widest nominal support ${maxNominalSources} source rows`,
    })
  }

  // Registration and non-registry lineage are alternate proofs of one root
  // problem: multiple publications are not independent underlying evidence.
  const underlyingReuse = new Map<string, {
    claimKeys: Set<string>
    highConfidenceClaimKeys: Set<string>
    registeredTrialClaims: number
    nonRegistryLineageClaims: number
    duplicatePublications: number
  }>()
  for (const claim of topology.trialRegistrationIndependence.sameTrialReuseClaims) {
    const item = underlyingReuse.get(claim.url) ?? {
      claimKeys: new Set<string>(), highConfidenceClaimKeys: new Set<string>(), registeredTrialClaims: 0,
      nonRegistryLineageClaims: 0, duplicatePublications: 0,
    }
    const key = `${claim.url}::${claim.claimId}`
    item.claimKeys.add(key)
    if (claim.highConfidenceSameTrialReuse) item.highConfidenceClaimKeys.add(key)
    item.registeredTrialClaims += 1
    item.duplicatePublications += claim.duplicatePublicationCount
    underlyingReuse.set(claim.url, item)
  }
  for (const claim of topology.evidenceLineage.sharedNonRegistryLineageClaims) {
    const item = underlyingReuse.get(claim.url) ?? {
      claimKeys: new Set<string>(), highConfidenceClaimKeys: new Set<string>(), registeredTrialClaims: 0,
      nonRegistryLineageClaims: 0, duplicatePublications: 0,
    }
    const key = `${claim.url}::${claim.claimId}`
    item.claimKeys.add(key)
    if (claim.highConfidenceSharedNonRegistryLineage) item.highConfidenceClaimKeys.add(key)
    item.nonRegistryLineageClaims += 1
    underlyingReuse.set(claim.url, item)
  }
  for (const [url, item] of underlyingReuse) {
    const affectedClaims = item.claimKeys.size
    const highConfidence = item.highConfidenceClaimKeys.size
    signals.push({
      url,
      kind: 'underlying-study-publication-reuse',
      weight: weights.underlyingStudyPublicationReuse
        + Math.min(8, Math.max(0, affectedClaims - 1) * 2 + item.duplicatePublications)
        + (highConfidence ? weights.highConfidenceUnderlyingStudyPublicationReuseBonus : 0),
      detail: `${affectedClaims} approved multi-publication claim(s) reuse underlying evidence; ${item.registeredTrialClaims} same registered trial, ${item.nonRegistryLineageClaims} shared cohort/dataset/parent-study lineage; ${highConfidence} high-confidence`,
    })
  }

  for (const [url, items] of groupByUrl(topology.evidenceIndependenceCoverage.unresolvedClaims)) {
    const highConfidence = items.filter((item) => item.highConfidenceIndependenceUnresolved).length
    const unresolvedStudies = items.reduce((sum, item) => sum + item.unresolvedStudyCount, 0)
    const minimumCoverage = Math.min(...items.map((item) => item.combinedCoverage))
    signals.push({
      url,
      kind: 'evidence-independence-metadata-gap',
      weight: weights.independenceMetadataGap
        + Math.min(8, Math.max(0, items.length - 1) * 2 + unresolvedStudies)
        + (highConfidence ? weights.highConfidenceIndependenceMetadataBonus : 0),
      detail: `${items.length} approved multi-study claim(s) have unresolved independence; ${unresolvedStudies} study slot(s) lack explicit registry/cohort/dataset/parent-study lineage; ${highConfidence} high-confidence; minimum explicit coverage ${Math.round(minimumCoverage * 100)}%`,
    })
  }

  for (const [url, items] of groupByUrl(topology.studyClassConflicts.severeConflicts)) {
    signals.push({
      url,
      kind: 'severe-canonical-study-class-conflict',
      weight: weights.severeStudyClassConflict,
      detail: `${items.length} canonical study classification conflict(s) cross evidence families; structural gate also blocks these`,
    })
  }

  for (const [url, items] of groupByUrl(topology.studyClassConflicts.conflicts.filter((item) => !item.severe))) {
    signals.push({
      url,
      kind: 'canonical-study-class-ambiguity',
      weight: weights.studyClassAmbiguity,
      detail: `${items.length} canonical study/studies have same-family design classification ambiguity`,
    })
  }

  return signals.sort((a, b) => b.weight - a.weight || a.url.localeCompare(b.url) || a.kind.localeCompare(b.kind))
}
