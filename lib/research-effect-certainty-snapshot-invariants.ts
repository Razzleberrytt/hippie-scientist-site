import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { ResearchQualityTopology } from './research-quality-topology'

export type EffectCertaintySnapshotInvariantFailure = {
  kind: string
  detail: string
}

function claimKey(url: string, claimId: string): string {
  return `${url}::${claimId}`
}

/** Validate self-consistency for the canonical effect-size/certainty product. */
export function validateEffectCertaintySnapshotInvariants(
  analysis: ResearchQualityAnalysis,
  topology: ResearchQualityTopology,
): EffectCertaintySnapshotInvariantFailure[] {
  const failures: EffectCertaintySnapshotInvariantFailure[] = []
  const add = (kind: string, detail: string) => failures.push({ kind, detail })
  const product = topology.effectCertainty
  const outcomeClaims = new Set(
    analysis.claimAnalyses
      .filter((claim) => claim.outcomeClaim)
      .map((claim) => claimKey(claim.url, claim.claimId)),
  )

  if (product.summary.approvedOutcomeClaims !== outcomeClaims.size) {
    add('effect-certainty-approved-outcome-count-mismatch', `summary=${product.summary.approvedOutcomeClaims}; analysis=${outcomeClaims.size}`)
  }
  if (product.summary.assessableClaims !== product.claims.length) {
    add('effect-certainty-assessable-count-mismatch', `summary=${product.summary.assessableClaims}; rows=${product.claims.length}`)
  }
  if (product.summary.findings !== product.findings.length) {
    add('effect-certainty-finding-count-mismatch', `summary=${product.summary.findings}; rows=${product.findings.length}`)
  }
  if (product.summary.highConfidenceFindings !== product.highConfidenceFindings.length) {
    add('effect-certainty-high-confidence-count-mismatch', `summary=${product.summary.highConfidenceFindings}; rows=${product.highConfidenceFindings.length}`)
  }
  if (product.summary.magnitudeOverstatements !== product.findings.filter((claim) => claim.magnitudeOverstatement).length) {
    add('effect-certainty-magnitude-count-mismatch', `summary=${product.summary.magnitudeOverstatements}`)
  }
  if (product.summary.clinicalImportanceOverstatements !== product.findings.filter((claim) => claim.clinicalImportanceOverstatement).length) {
    add('effect-certainty-clinical-count-mismatch', `summary=${product.summary.clinicalImportanceOverstatements}`)
  }
  if (product.summary.certaintyOverstatements !== product.findings.filter((claim) => claim.certaintyOverstatement).length) {
    add('effect-certainty-reliability-count-mismatch', `summary=${product.summary.certaintyOverstatements}`)
  }

  const claimKeys = new Set<string>()
  for (const claim of product.claims) {
    const key = claimKey(claim.url, claim.claimId)
    if (claimKeys.has(key)) add('effect-certainty-duplicate-claim', key)
    claimKeys.add(key)
    if (!outcomeClaims.has(key)) add('effect-certainty-unknown-outcome-claim', key)
    if (claim.comparableHumanSourceCount < 1 || claim.comparableHumanSourceCount > claim.humanSourceCount) {
      add('effect-certainty-invalid-human-source-count', `${key}: human=${claim.humanSourceCount}; comparable=${claim.comparableHumanSourceCount}`)
    }
    for (const [label, count] of [
      ['small-or-modest', claim.smallOrModestSourceCount],
      ['null', claim.nullSourceCount],
      ['mixed', claim.mixedSourceCount],
      ['clinically-insufficient', claim.clinicallyInsufficientSourceCount],
      ['statistical-only', claim.statisticalOnlySourceCount],
    ] as const) {
      if (count < 0 || count > claim.comparableHumanSourceCount) {
        add('effect-certainty-invalid-counterevidence-count', `${key}: ${label}=${count}; comparable=${claim.comparableHumanSourceCount}`)
      }
    }
    const finding = claim.magnitudeOverstatement || claim.clinicalImportanceOverstatement || claim.certaintyOverstatement
    if (finding && claim.reasons.length === 0) add('effect-certainty-finding-without-reason', key)
  }

  const findingKeys = new Set(product.findings.map((claim) => claimKey(claim.url, claim.claimId)))
  for (const finding of product.findings) {
    const key = claimKey(finding.url, finding.claimId)
    if (!claimKeys.has(key)) add('effect-certainty-orphan-finding', key)
    if (!finding.magnitudeOverstatement && !finding.clinicalImportanceOverstatement && !finding.certaintyOverstatement) {
      add('effect-certainty-nonfinding-in-findings', key)
    }
  }
  for (const finding of product.highConfidenceFindings) {
    const key = claimKey(finding.url, finding.claimId)
    if (!findingKeys.has(key)) add('effect-certainty-orphan-high-confidence-finding', key)
    if (finding.confidence < 0.75) add('effect-certainty-invalid-high-confidence-finding', `${key}: confidence=${finding.confidence}`)
  }

  return failures
}
