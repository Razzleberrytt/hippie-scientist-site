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
  metadataIntegrity: number
  highConfidenceMetadataIntegrityBonus: number
  provenanceNarrowMultiStudySupport: number
  highConfidenceProvenanceNarrowBonus: number
  pseudoMultiSourceSupport: number
  underlyingStudyPublicationReuse: number
  highConfidenceUnderlyingStudyPublicationReuseBonus: number
  independenceMetadataGap: number
  highConfidenceIndependenceMetadataBonus: number
  severeStudyClassConflict: number
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

  const semanticByUrl = new Map<string, {
    explicit: typeof topology.semanticAlignment.findings
    breadth: typeof topology.claimBreadth.findings
    effect: typeof topology.effectCertainty.findings
    directional: typeof topology.directionalConsistency.findings
    outcomeIntegrity: typeof topology.outcomeReportingIntegrity.claims
  }>()
  const emptySemanticGroup = () => ({ explicit: [], breadth: [], effect: [], directional: [], outcomeIntegrity: [] })
  for (const item of topology.semanticAlignment.findings) {
    const group = semanticByUrl.get(item.url) ?? emptySemanticGroup()
    group.explicit.push(item)
    semanticByUrl.set(item.url, group)
  }
  for (const item of topology.claimBreadth.findings) {
    const group = semanticByUrl.get(item.url) ?? emptySemanticGroup()
    group.breadth.push(item)
    semanticByUrl.set(item.url, group)
  }
  for (const item of topology.effectCertainty.findings) {
    const group = semanticByUrl.get(item.url) ?? emptySemanticGroup()
    group.effect.push(item)
    semanticByUrl.set(item.url, group)
  }
  for (const item of topology.directionalConsistency.findings) {
    const group = semanticByUrl.get(item.url) ?? emptySemanticGroup()
    group.directional.push(item)
    semanticByUrl.set(item.url, group)
  }
  for (const item of topology.outcomeReportingIntegrity.claims) {
    const group = semanticByUrl.get(item.url) ?? emptySemanticGroup()
    group.outcomeIntegrity.push(item)
    semanticByUrl.set(item.url, group)
  }
  for (const [url, group] of semanticByUrl) {
    const highConfidence = [
      ...group.explicit.filter((item) => item.confidence >= 0.75),
      ...group.breadth.filter((item) => item.confidence >= 0.75),
      ...group.effect.filter((item) => item.confidence >= 0.75),
      ...group.directional.filter((item) => item.confidence >= 0.75),
      ...group.outcomeIntegrity.filter((item) => item.confidence >= 0.75),
    ].length
    const issueCount = group.explicit.length + group.breadth.length + group.effect.length + group.directional.length + group.outcomeIntegrity.length
    const breadthDimensions = {
      population: group.breadth.filter((item) => item.populationOverbroad).length,
      dose: group.breadth.filter((item) => item.doseOverbroad).length,
      duration: group.breadth.filter((item) => item.durationOverbroad).length,
      formulation: group.breadth.filter((item) => item.formulationOverbroad).length,
      endpoint: group.breadth.filter((item) => item.endpointOverbroad).length,
    }
    const effectDimensions = {
      magnitude: group.effect.filter((item) => item.magnitudeOverstatement).length,
      clinicalImportance: group.effect.filter((item) => item.clinicalImportanceOverstatement).length,
      certainty: group.effect.filter((item) => item.certaintyOverstatement).length,
    }
    const directionalDimensions = {
      cherryPick: group.directional.filter((item) => item.endpointCherryPickRisk).length,
      heterogeneous: group.directional.filter((item) => item.directionalHeterogeneity).length,
      uniformlyPositive: group.directional.filter((item) => item.uniformlyPositiveOverstatement).length,
    }
    const outcomeIntegrityDimensions = {
      selectiveOutcome: group.outcomeIntegrity.filter((item) => item.risks.includes('null-primary-with-favorable-secondary')).length,
      primaryMismatch: group.outcomeIntegrity.filter((item) => item.risks.includes('registered-reported-primary-mismatch')).length,
      partialPrimaryMismatch: group.outcomeIntegrity.filter((item) => item.risks.includes('registered-reported-primary-partial-mismatch')).length,
      outcomeSwitch: group.outcomeIntegrity.filter((item) => item.risks.includes('explicit-outcome-switch')).length,
      registeredNonreporting: group.outcomeIntegrity.filter((item) => item.risks.includes('explicit-registered-outcome-nonreporting')).length,
    }
    signals.push({
      url,
      kind: 'semantic-claim-source-mismatch',
      weight: weights.semanticMismatch + Math.min(10, Math.max(0, issueCount - 1) * 2) + (highConfidence ? weights.highConfidenceSemanticMismatchBonus : 0),
      detail: `${group.explicit.length} explicit alignment mismatch(es), ${group.breadth.length} claim-breadth overreach finding(s), ${group.effect.length} effect/certainty overstatement finding(s), ${group.directional.length} endpoint/directional consistency finding(s), and ${group.outcomeIntegrity.length} outcome-reporting integrity finding(s); ${highConfidence} high-confidence; role ${group.explicit.filter((item) => item.roleMismatch).length}, domain ${group.explicit.filter((item) => item.domainMismatch).length}, population mismatch ${group.explicit.filter((item) => item.populationMismatch).length}; breadth population ${breadthDimensions.population}, dose ${breadthDimensions.dose}, duration ${breadthDimensions.duration}, formulation ${breadthDimensions.formulation}, endpoint ${breadthDimensions.endpoint}; effect magnitude ${effectDimensions.magnitude}, clinical importance ${effectDimensions.clinicalImportance}, certainty ${effectDimensions.certainty}; endpoint cherry-pick ${directionalDimensions.cherryPick}, directional heterogeneity ${directionalDimensions.heterogeneous}, uniformly-positive overstatement ${directionalDimensions.uniformlyPositive}; selective outcome ${outcomeIntegrityDimensions.selectiveOutcome}, registered/reported primary mismatch ${outcomeIntegrityDimensions.primaryMismatch}, partial primary mismatch ${outcomeIntegrityDimensions.partialPrimaryMismatch}, explicit outcome switch ${outcomeIntegrityDimensions.outcomeSwitch}, registered outcome non-reporting ${outcomeIntegrityDimensions.registeredNonreporting}`,
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

  for (const item of topology.metadataIntegrity.profiles) {
    const advisoryStudyClassConflicts = Math.max(0, item.studyClassConflicts - item.severeStudyClassConflicts)
    const advisoryIssueCount = item.yearConflicts
      + item.provenanceConflicts
      + advisoryStudyClassConflicts
      + item.lowCitationMetadataClaims
    if (advisoryIssueCount === 0) continue
    const highConfidence = item.highConfidenceLowCitationMetadataClaims > 0
    signals.push({
      url: item.url,
      kind: 'research-metadata-integrity',
      weight: weights.metadataIntegrity
        + Math.min(12, Math.max(0, advisoryIssueCount - 1) * 2)
        + (highConfidence ? weights.highConfidenceMetadataIntegrityBonus : 0),
      detail: `${advisoryIssueCount} advisory metadata integrity issue(s): ${item.yearConflicts} publication-year conflict(s), ${item.provenanceConflicts} provenance alias conflict(s), ${advisoryStudyClassConflicts} advisory study-class ambiguity, ${item.lowCitationMetadataClaims} low-completeness claim(s); ${item.highConfidenceLowCitationMetadataClaims} high-confidence citation gap(s)`,
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

  for (const profile of topology.underlyingStudyIndependence.newlyOverDependentProfiles) {
    const concentrationBonus = Math.round(Math.min(15, profile.underlyingStudyConcentrationIndex * 20))
    const weight = Math.round(25 + profile.dominantUnderlyingStudySupportedClaimShare * 30 + concentrationBonus)
    signals.push({
      url: profile.url,
      kind: 'high-study-dependency',
      weight,
      detail: `${Math.round(profile.dominantUnderlyingStudySupportedClaimShare * 100)}% of supported approved claims depend on one underlying study after explicit publication-lineage collapse; ${profile.publicationStudyCount} publications resolve to ${profile.underlyingStudyCount} underlying studies; effective underlying-study count ${profile.effectiveUnderlyingStudyCount}`,
    })
  }

  for (const [url, items] of groupByUrl(topology.underlyingStudyIndependence.reducedClaims)) {
    const collapsedPublications = items.reduce((sum, item) => sum + item.collapsedPublicationCount, 0)
    const pseudoMultiStudy = items.filter((item) => item.pseudoMultiStudySupport).length
    const highConfidencePseudo = items.filter((item) => item.highConfidencePseudoMultiStudySupport).length
    const minimumUnderlyingStudyCount = Math.min(...items.map((item) => item.underlyingStudyCount))
    signals.push({
      url,
      kind: 'underlying-study-publication-reuse',
      weight: weights.underlyingStudyPublicationReuse
        + Math.min(12, Math.max(0, items.length - 1) * 2 + collapsedPublications + pseudoMultiStudy * 3)
        + (highConfidencePseudo ? weights.highConfidenceUnderlyingStudyPublicationReuseBonus : 0),
      detail: `${items.length} approved claim(s) lose apparent study independence after explicit lineage collapse; ${collapsedPublications} publication(s) collapse; ${pseudoMultiStudy} claim(s) reduce to one underlying study; ${highConfidencePseudo} high-confidence pseudo-multi-study; minimum adjusted count ${minimumUnderlyingStudyCount}`,
    })
  }

  const unresolvedByUrl = groupByUrl(topology.evidenceIndependenceCoverage.unresolvedClaims)
  const profileCoverageByUrl = new Map(
    topology.underlyingStudyIndependence.profiles
      .filter((profile) => profile.primaryHumanPublicationCount >= 2 && profile.primaryHumanIndependenceMetadataCoverage < 0.75)
      .map((profile) => [profile.url, profile] as const),
  )
  const independenceGapUrls = new Set([...unresolvedByUrl.keys(), ...profileCoverageByUrl.keys()])
  for (const url of independenceGapUrls) {
    const items = unresolvedByUrl.get(url) ?? []
    const profile = profileCoverageByUrl.get(url)
    const highConfidence = items.filter((item) => item.highConfidenceIndependenceUnresolved).length
    const unresolvedStudies = items.reduce((sum, item) => sum + item.unresolvedStudyCount, 0)
    const missingHumanMetadata = profile?.primaryHumanPublicationsWithoutIndependenceMetadata ?? 0
    const minimumClaimCoverage = items.length ? Math.min(...items.map((item) => item.combinedCoverage)) : null
    const profileCoverage = profile?.primaryHumanIndependenceMetadataCoverage ?? null
    const issueUnits = unresolvedStudies + missingHumanMetadata
    const details = [
      items.length
        ? `${items.length} approved multi-study claim(s) have unresolved independence; ${unresolvedStudies} claim-linked study slot(s) lack explicit lineage; ${highConfidence} high-confidence${minimumClaimCoverage === null ? '' : `; minimum claim coverage ${Math.round(minimumClaimCoverage * 100)}%`}`
        : '',
      profile
        ? `${missingHumanMetadata} of ${profile.primaryHumanPublicationCount} primary-human inventory publication(s) lack explicit registry/cohort/dataset/parent-study metadata; profile coverage ${Math.round((profileCoverage ?? 0) * 100)}%`
        : '',
    ].filter(Boolean)
    signals.push({
      url,
      kind: 'evidence-independence-metadata-gap',
      weight: weights.independenceMetadataGap
        + Math.min(12, Math.max(0, items.length - 1) * 2 + issueUnits)
        + (highConfidence ? weights.highConfidenceIndependenceMetadataBonus : 0),
      detail: details.join('; '),
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

  return signals.sort((a, b) => b.weight - a.weight || a.url.localeCompare(b.url) || a.kind.localeCompare(b.kind))
}
