import type { ResearchQualityTopology } from './research-quality-topology'

export type ExtendedTopologyGapWeights = {
  crossProfileBundleReuse: number
  semanticMismatch: number
  highConfidenceSemanticMismatchBonus: number
  semanticCoverageGap: number
  highConfidenceSemanticCoverageGapBonus: number
  semanticConcentration: number
  highConfidenceSemanticConcentrationBonus: number
  causalWithoutDirectControlledSupport: number
  synthesisOnlyCausalSupport: number
  highConfidenceCausalLanguageBonus: number
  claimCitationMetadataGap: number
  highConfidenceCitationMetadataBonus: number
  severeStudyClassConflict: number
  studyClassAmbiguity: number
}

export type ExtendedTopologyGapSignal = {
  url: string
  kind: string
  weight: number
  detail: string
}

function groupByUrl<T extends { url: string }>(items: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const item of items) {
    const values = grouped.get(item.url) ?? []
    values.push(item)
    grouped.set(item.url, values)
  }
  return grouped
}

/**
 * Aggregate newer claim-level topology findings to one reason per profile before
 * they enter the dimension-capped remediation queue. This keeps the queue
 * actionable and avoids multiplying one root issue into dozens of claim rows.
 */
export function buildExtendedTopologyGapSignals(
  topology: ResearchQualityTopology,
  weights: ExtendedTopologyGapWeights,
): ExtendedTopologyGapSignal[] {
  const signals: ExtendedTopologyGapSignal[] = []

  const bundleByProfile = new Map<string, { bundles: number; claims: number; maxProfiles: number }>()
  for (const bundle of topology.narrowCrossProfileEvidenceBundles) {
    for (const url of bundle.profiles) {
      const item = bundleByProfile.get(url) ?? { bundles: 0, claims: 0, maxProfiles: 0 }
      item.bundles += 1
      item.claims += bundle.claims.filter((claim) => claim.url === url).length
      item.maxProfiles = Math.max(item.maxProfiles, bundle.profileCount)
      bundleByProfile.set(url, item)
    }
  }
  for (const [url, item] of bundleByProfile) {
    const bonus = Math.min(8, Math.max(0, item.bundles - 1) * 2)
    signals.push({
      url,
      kind: 'cross-profile-narrow-evidence-bundle',
      weight: weights.crossProfileBundleReuse + bonus,
      detail: `${item.bundles} narrow multi-study bundle(s) reused across profiles; ${item.claims} approved claim(s) on this profile affected; widest reuse spans ${item.maxProfiles} profiles`,
    })
  }

  for (const [url, items] of groupByUrl(topology.semanticAlignment.findings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    const role = items.filter((item) => item.roleMismatch).length
    const domain = items.filter((item) => item.domainMismatch).length
    const population = items.filter((item) => item.populationMismatch).length
    const countBonus = Math.min(10, Math.max(0, items.length - 1) * 2)
    signals.push({
      url,
      kind: 'semantic-evidence-mismatch',
      weight: weights.semanticMismatch + countBonus + (highConfidence ? weights.highConfidenceSemanticMismatchBonus : 0),
      detail: `${items.length} approved claim(s) have explicit semantic evidence mismatch; ${highConfidence} high-confidence; role ${role}, domain ${domain}, population ${population}`,
    })
  }

  for (const [url, items] of groupByUrl(topology.semanticAlignment.coverageGapFindings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    const minCoverage = Math.min(...items.map((item) => item.semanticMetadataCoverage))
    const countBonus = Math.min(6, Math.max(0, items.length - 1))
    signals.push({
      url,
      kind: 'semantic-evidence-coverage-gap',
      weight: weights.semanticCoverageGap + countBonus + (highConfidence ? weights.highConfidenceSemanticCoverageGapBonus : 0),
      detail: `${items.length} approved claim(s) have <50% semantically comparable linked-source coverage; ${highConfidence} high-confidence; minimum coverage ${Math.round(minCoverage * 100)}%`,
    })
  }

  for (const [url, items] of groupByUrl(topology.semanticAlignment.concentrationFindings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    signals.push({
      url,
      kind: 'semantic-support-concentration',
      weight: weights.semanticConcentration + (highConfidence ? weights.highConfidenceSemanticConcentrationBonus : 0),
      detail: `${items.length} approved claim(s) have semantic support concentrated in a minority of linked sources; ${highConfidence} high-confidence`,
    })
  }

  for (const [url, items] of groupByUrl(topology.claimLanguageCalibration.directEvidenceFindings)) {
    const highConfidence = items.filter((item) => item.confidence >= 0.75).length
    const synthesisOnly = items.filter((item) => item.synthesisOnlyCausalSupport).length
    const unsupportedBeyondSynthesis = items.filter((item) => item.causalWithoutControlledSupport).length
    const base = unsupportedBeyondSynthesis > 0
      ? weights.causalWithoutDirectControlledSupport
      : weights.synthesisOnlyCausalSupport
    signals.push({
      url,
      kind: 'causal-language-without-direct-controlled-support',
      weight: base + (highConfidence ? weights.highConfidenceCausalLanguageBonus : 0),
      detail: `${items.length} direct-causal outcome claim(s) lack directly linked controlled-human evidence; ${synthesisOnly} synthesis-only; ${unsupportedBeyondSynthesis} lack both controlled-human and synthesis support; ${highConfidence} high-confidence`,
    })
  }

  for (const [url, items] of groupByUrl(topology.claimCitationMetadata.lowCoverageClaims)) {
    const highConfidence = items.filter((item) => item.highConfidenceLowMetadataCoverage).length
    const minCoverage = Math.min(...items.map((item) => item.fieldMetadataCoverage))
    const countBonus = Math.min(6, Math.max(0, items.length - 1))
    signals.push({
      url,
      kind: 'claim-linked-citation-metadata-gap',
      weight: weights.claimCitationMetadataGap + countBonus + (highConfidence ? weights.highConfidenceCitationMetadataBonus : 0),
      detail: `${items.length} approved claim(s) rely on supporting studies with <70% citation-field coverage; ${highConfidence} high-confidence; minimum field coverage ${Math.round(minCoverage * 100)}%`,
    })
  }

  for (const conflict of topology.studyClassConflicts.severeConflicts) {
    signals.push({
      url: conflict.url,
      kind: 'severe-canonical-study-class-conflict',
      weight: weights.severeStudyClassConflict,
      detail: `${conflict.studyId} is classified across incompatible evidence families: ${conflict.classes.join(' <> ')}`,
    })
  }

  const advisoryByUrl = groupByUrl(topology.studyClassConflicts.conflicts.filter((conflict) => !conflict.severe))
  for (const [url, items] of advisoryByUrl) {
    signals.push({
      url,
      kind: 'canonical-study-class-ambiguity',
      weight: weights.studyClassAmbiguity,
      detail: `${items.length} canonical study/studies have same-family classification ambiguity`,
    })
  }

  return signals.sort((a, b) => b.weight - a.weight || a.url.localeCompare(b.url) || a.kind.localeCompare(b.kind))
}
