import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityTopology } from './research-quality-topology'

export type SelectiveOutcomeReportingInvariantFailure = {
  kind: string
  detail: string
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

/** Validate self-consistency of the canonical selective-outcome-reporting product. */
export function validateSelectiveOutcomeReportingSnapshotInvariants(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
): SelectiveOutcomeReportingInvariantFailure[] {
  const failures: SelectiveOutcomeReportingInvariantFailure[] = []
  const report = topology.selectiveOutcomeReporting
  const approvedOutcomeClaimKeys = new Set(
    analysis.claimAnalyses
      .filter((claim) => claim.outcomeClaim)
      .map((claim) => claimKey(claim.url, claim.claimId)),
  )
  const add = (kind: string, detail: string) => failures.push({ kind, detail })

  if (report.summary.approvedOutcomeClaims !== approvedOutcomeClaimKeys.size) {
    add(
      'selective-outcome-approved-outcome-count-mismatch',
      `summary=${report.summary.approvedOutcomeClaims}; analysis=${approvedOutcomeClaimKeys.size}`,
    )
  }
  if (report.summary.assessableClaims !== report.claims.length) {
    add('selective-outcome-assessable-count-mismatch', `summary=${report.summary.assessableClaims}; rows=${report.claims.length}`)
  }
  if (report.summary.findings !== report.findings.length) {
    add('selective-outcome-finding-count-mismatch', `summary=${report.summary.findings}; rows=${report.findings.length}`)
  }
  if (report.summary.highConfidenceFindings !== report.highConfidenceFindings.length) {
    add(
      'selective-outcome-high-confidence-count-mismatch',
      `summary=${report.summary.highConfidenceFindings}; rows=${report.highConfidenceFindings.length}`,
    )
  }

  const selectiveRisks = report.findings.filter((claim) => claim.selectiveOutcomeRisk).length
  const explicitSwitchRisks = report.findings.filter((claim) => claim.explicitOutcomeSwitchRisk).length
  if (report.summary.selectiveOutcomeRisks !== selectiveRisks) {
    add('selective-outcome-risk-count-mismatch', `summary=${report.summary.selectiveOutcomeRisks}; rows=${selectiveRisks}`)
  }
  if (report.summary.explicitOutcomeSwitchRisks !== explicitSwitchRisks) {
    add('selective-outcome-switch-count-mismatch', `summary=${report.summary.explicitOutcomeSwitchRisks}; rows=${explicitSwitchRisks}`)
  }

  const claimKeys = new Set<string>()
  for (const claim of report.claims) {
    const key = claimKey(claim.url, claim.claimId)
    if (claimKeys.has(key)) add('selective-outcome-duplicate-claim', key)
    claimKeys.add(key)
    if (!approvedOutcomeClaimKeys.has(key)) add('selective-outcome-unknown-approved-outcome-claim', key)
    if (claim.humanSourceCount < 1) add('selective-outcome-invalid-human-source-count', `${key} · human=${claim.humanSourceCount}`)
    if (claim.assessableSourceCount < 1 || claim.assessableSourceCount > claim.humanSourceCount) {
      add(
        'selective-outcome-invalid-assessable-source-count',
        `${key} · assessable=${claim.assessableSourceCount}; human=${claim.humanSourceCount}`,
      )
    }

    for (const [label, count] of Object.entries({
      registeredPrimaryNull: claim.registeredOrPrespecifiedPrimaryNullCount,
      favorableSecondary: claim.favorableSecondaryOrExploratoryCount,
      explicitOutcomeSwitch: claim.explicitOutcomeSwitchCount,
      primaryOutcomeNotMet: claim.primaryOutcomeNotMetCount,
    })) {
      if (count < 0 || count > claim.assessableSourceCount) {
        add(
          'selective-outcome-source-count-invalid',
          `${key} · ${label}=${count}; assessable=${claim.assessableSourceCount}`,
        )
      }
    }

    if (claim.registeredOrPrespecifiedPrimaryNullCount > claim.primaryOutcomeNotMetCount) {
      add(
        'selective-outcome-registered-null-count-invalid',
        `${key} · registeredNull=${claim.registeredOrPrespecifiedPrimaryNullCount}; primaryNotMet=${claim.primaryOutcomeNotMetCount}`,
      )
    }
    if (claim.selectiveOutcomeRisk
      && (claim.primaryOutcomeNotMetCount === 0 || claim.favorableSecondaryOrExploratoryCount === 0)) {
      add('selective-outcome-risk-state-invalid', key)
    }
    if (claim.explicitOutcomeSwitchRisk !== (claim.explicitOutcomeSwitchCount > 0)) {
      add(
        'selective-outcome-switch-state-invalid',
        `${key} · risk=${claim.explicitOutcomeSwitchRisk}; switches=${claim.explicitOutcomeSwitchCount}`,
      )
    }

    const isFinding = claim.selectiveOutcomeRisk || claim.explicitOutcomeSwitchRisk
    if (isFinding && claim.reasons.length === 0) add('selective-outcome-finding-without-reason', key)
    if (!isFinding && claim.reasons.length > 0) add('selective-outcome-nonfinding-with-reason', key)
  }

  for (const finding of report.findings) {
    const key = claimKey(finding.url, finding.claimId)
    if (!claimKeys.has(key)) add('selective-outcome-finding-not-assessable', key)
    if (!finding.selectiveOutcomeRisk && !finding.explicitOutcomeSwitchRisk) {
      add('selective-outcome-finding-state-invalid', key)
    }
  }

  const findingKeys = new Set(report.findings.map((claim) => claimKey(claim.url, claim.claimId)))
  for (const finding of report.highConfidenceFindings) {
    const key = claimKey(finding.url, finding.claimId)
    if (!findingKeys.has(key)) add('selective-outcome-high-confidence-not-finding', key)
    if (finding.confidence < 0.75) {
      add('selective-outcome-high-confidence-threshold-invalid', `${key} · confidence=${finding.confidence}`)
    }
  }

  return failures
}
