import type { ResearchQualityGate } from './research-quality-gate'
import type { ResearchGapItem } from './research-quality-policy'
import { EVIDENCE_GRADE_BLOCKER_REASON } from './research-quality-remediation'

export type ResearchRemediationInvariantFailure = {
  kind: 'missing-grade-blocker-remediation' | 'orphan-grade-blocker-remediation'
  url: string
}

export type ResearchRemediationInvariantReport = {
  passed: boolean
  failures: ResearchRemediationInvariantFailure[]
  summary: {
    failures: number
    missingGradeBlockerRemediation: number
    orphanGradeBlockerRemediation: number
  }
}

/**
 * Cross-check hard evidence-grade blockers against the editorial remediation
 * queue. A blocker without a remediation target strands the build; a remediation
 * blocker without a gate contradiction falsely escalates editorial priority.
 */
export function validateResearchRemediationInvariants(
  gate: ResearchQualityGate,
  researchGapQueue: ResearchGapItem[],
): ResearchRemediationInvariantReport {
  const gateUrls = new Set(gate.evidenceGradeContradictions.map((finding) => finding.url))
  const remediationUrls = new Set(
    researchGapQueue
      .filter((item) => item.reasons.some((reason) => reason.kind === EVIDENCE_GRADE_BLOCKER_REASON))
      .map((item) => item.url),
  )
  const failures: ResearchRemediationInvariantFailure[] = []

  for (const url of gateUrls) {
    if (!remediationUrls.has(url)) failures.push({ kind: 'missing-grade-blocker-remediation', url })
  }
  for (const url of remediationUrls) {
    if (!gateUrls.has(url)) failures.push({ kind: 'orphan-grade-blocker-remediation', url })
  }

  return {
    passed: failures.length === 0,
    failures,
    summary: {
      failures: failures.length,
      missingGradeBlockerRemediation: failures.filter((failure) => failure.kind === 'missing-grade-blocker-remediation').length,
      orphanGradeBlockerRemediation: failures.filter((failure) => failure.kind === 'orphan-grade-blocker-remediation').length,
    },
  }
}
