import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityTopology } from './research-quality-topology'

export type DirectionalConsistencyInvariantFailure = {
  kind: string
  detail: string
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

/** Validate self-consistency of the canonical directional-consistency product. */
export function validateDirectionalConsistencySnapshotInvariants(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
): DirectionalConsistencyInvariantFailure[] {
  const failures: DirectionalConsistencyInvariantFailure[] = []
  const report = topology.directionalConsistency
  const approvedOutcomeClaimKeys = new Set(
    analysis.claimAnalyses
      .filter((claim) => claim.outcomeClaim)
      .map((claim) => claimKey(claim.url, claim.claimId)),
  )
  const add = (kind: string, detail: string) => failures.push({ kind, detail })

  if (report.summary.approvedOutcomeClaims !== approvedOutcomeClaimKeys.size) {
    add(
      'directional-approved-outcome-count-mismatch',
      `summary=${report.summary.approvedOutcomeClaims}; analysis=${approvedOutcomeClaimKeys.size}`,
    )
  }
  if (report.summary.assessableClaims !== report.claims.length) {
    add('directional-assessable-count-mismatch', `summary=${report.summary.assessableClaims}; rows=${report.claims.length}`)
  }
  if (report.summary.findings !== report.findings.length) {
    add('directional-finding-count-mismatch', `summary=${report.summary.findings}; rows=${report.findings.length}`)
  }
  if (report.summary.highConfidenceFindings !== report.highConfidenceFindings.length) {
    add(
      'directional-high-confidence-count-mismatch',
      `summary=${report.summary.highConfidenceFindings}; rows=${report.highConfidenceFindings.length}`,
    )
  }

  const endpointFindings = report.findings.filter((claim) => claim.endpointCherryPickRisk).length
  const heterogeneityFindings = report.findings.filter((claim) => claim.directionalHeterogeneity).length
  const uniformlyPositiveFindings = report.findings.filter((claim) => claim.uniformlyPositiveOverstatement).length
  if (report.summary.endpointCherryPickRisks !== endpointFindings) {
    add('directional-endpoint-count-mismatch', `summary=${report.summary.endpointCherryPickRisks}; rows=${endpointFindings}`)
  }
  if (report.summary.directionalHeterogeneityClaims !== heterogeneityFindings) {
    add(
      'directional-heterogeneity-count-mismatch',
      `summary=${report.summary.directionalHeterogeneityClaims}; rows=${heterogeneityFindings}`,
    )
  }
  if (report.summary.uniformlyPositiveOverstatements !== uniformlyPositiveFindings) {
    add(
      'directional-uniform-overstatement-count-mismatch',
      `summary=${report.summary.uniformlyPositiveOverstatements}; rows=${uniformlyPositiveFindings}`,
    )
  }

  const claimKeys = new Set<string>()
  for (const claim of report.claims) {
    const key = claimKey(claim.url, claim.claimId)
    claimKeys.add(key)
    if (!approvedOutcomeClaimKeys.has(key)) add('directional-unknown-approved-outcome-claim', key)
    if (!claim.favorableClaim) add('directional-nonfavorable-assessable-claim', key)

    for (const [label, count] of Object.entries({
      positive: claim.positiveSourceCount,
      null: claim.nullSourceCount,
      negative: claim.negativeSourceCount,
      mixed: claim.mixedSourceCount,
      primaryNullOrNegative: claim.primaryNullOrNegativeSourceCount,
      secondaryOrSubgroupPositive: claim.secondaryOrSubgroupPositiveSourceCount,
    })) {
      if (count < 0 || count > claim.humanSourceCount) {
        add('directional-source-count-invalid', `${key} · ${label}=${count}; human=${claim.humanSourceCount}`)
      }
    }

    if (claim.endpointCherryPickRisk
      && (claim.primaryNullOrNegativeSourceCount === 0 || claim.secondaryOrSubgroupPositiveSourceCount === 0)) {
      add('directional-endpoint-state-invalid', key)
    }
    if (claim.directionalHeterogeneity
      && (claim.positiveSourceCount === 0 || claim.nullSourceCount + claim.negativeSourceCount + claim.mixedSourceCount === 0)) {
      add('directional-heterogeneity-state-invalid', key)
    }
    if (claim.uniformlyPositiveOverstatement && !claim.directionalHeterogeneity) {
      add('directional-uniform-state-invalid', key)
    }

    const isFinding = claim.endpointCherryPickRisk || claim.directionalHeterogeneity
    if (isFinding && claim.reasons.length === 0) add('directional-finding-without-reason', key)
    if (!isFinding && claim.reasons.length > 0) add('directional-nonfinding-with-reason', key)
  }

  for (const finding of report.findings) {
    const key = claimKey(finding.url, finding.claimId)
    if (!claimKeys.has(key)) add('directional-finding-not-assessable', key)
    if (!finding.endpointCherryPickRisk && !finding.directionalHeterogeneity) add('directional-finding-state-invalid', key)
  }

  const findingKeys = new Set(report.findings.map((claim) => claimKey(claim.url, claim.claimId)))
  for (const finding of report.highConfidenceFindings) {
    const key = claimKey(finding.url, finding.claimId)
    if (!findingKeys.has(key)) add('directional-high-confidence-not-finding', key)
    if (finding.confidence < 0.75) add('directional-high-confidence-threshold-invalid', `${key} · confidence=${finding.confidence}`)
  }

  return failures
}
