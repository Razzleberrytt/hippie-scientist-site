import {
  approvedClaims,
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
  type ResearchClaim,
} from './research-coverage'
import type { OutcomeMetadataAnalysis } from './research-outcome-metadata'
import type { OutcomeRegistrationAlignmentAnalysis } from './research-outcome-registration-alignment'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { SelectiveOutcomeReportingReport } from './research-selective-outcome-reporting'

export type OutcomeReportingRisk =
  | 'registered-reported-primary-mismatch'
  | 'registered-reported-primary-partial-mismatch'
  | 'explicit-outcome-switch'
  | 'explicit-registered-outcome-nonreporting'
  | 'null-primary-with-favorable-secondary'

export type OutcomeReportingSeverity = 'moderate' | 'high'

export type StudyOutcomeReportingIntegrityFinding = {
  url: string
  studyId: string
  trialRegistrationIds: string[]
  risks: OutcomeReportingRisk[]
  severity: OutcomeReportingSeverity
}

export type ClaimOutcomeReportingIntegrityFinding = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  linkedStudyCount: number
  affectedStudyIds: string[]
  risks: OutcomeReportingRisk[]
  severity: OutcomeReportingSeverity
}

export type OutcomeReportingIntegrityAnalysis = {
  studies: StudyOutcomeReportingIntegrityFinding[]
  claims: ClaimOutcomeReportingIntegrityFinding[]
  highPriorityStudies: StudyOutcomeReportingIntegrityFinding[]
  highPriorityClaims: ClaimOutcomeReportingIntegrityFinding[]
  summary: {
    affectedStudies: number
    affectedApprovedOutcomeClaims: number
    highPriorityStudies: number
    highPriorityClaims: number
    explicitOutcomeSwitches: number
    explicitRegisteredOutcomeNonReporting: number
    primaryOutcomeMismatches: number
    primaryOutcomePartialMismatches: number
    selectiveOutcomeClaims: number
  }
}

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isOutcomeClaim(claim: ResearchClaim): boolean {
  return /supports_outcome|benefit|efficacy/i.test(text(claim.predicate))
}

function severityFor(risks: readonly OutcomeReportingRisk[]): OutcomeReportingSeverity {
  return risks.some((risk) =>
    risk === 'registered-reported-primary-mismatch'
    || risk === 'explicit-outcome-switch'
    || risk === 'explicit-registered-outcome-nonreporting',
  ) ? 'high' : 'moderate'
}

function uniqueRisks(risks: OutcomeReportingRisk[]): OutcomeReportingRisk[] {
  return [...new Set(risks)]
}

/**
 * Canonical integration layer for outcome-reporting integrity. Study-level
 * registered/reported alignment and explicit reporting flags are joined to
 * claim-level selective-outcome findings so downstream policy/editorial code
 * does not have to recompute or reconcile these signals independently.
 */
export function analyzeOutcomeReportingIntegrity(input: {
  analysis: ResearchQualityAnalysis
  outcomeMetadata: OutcomeMetadataAnalysis
  outcomeRegistrationAlignment: OutcomeRegistrationAlignmentAnalysis
  selectiveOutcomeReporting: SelectiveOutcomeReportingReport
}): OutcomeReportingIntegrityAnalysis {
  const {
    analysis,
    outcomeMetadata,
    outcomeRegistrationAlignment,
    selectiveOutcomeReporting,
  } = input

  const metadataByStudy = new Map(
    outcomeMetadata.studies.map((study) => [`${study.url}::${study.studyId}`, study]),
  )
  const studyRisks = new Map<string, OutcomeReportingRisk[]>()

  for (const alignment of outcomeRegistrationAlignment.studies) {
    const risks: OutcomeReportingRisk[] = []
    if (alignment.status === 'mismatch') risks.push('registered-reported-primary-mismatch')
    if (alignment.status === 'partial-mismatch') risks.push('registered-reported-primary-partial-mismatch')
    if (alignment.explicitOutcomeSwitch) risks.push('explicit-outcome-switch')
    if (alignment.explicitRegisteredOutcomeNotReported) risks.push('explicit-registered-outcome-nonreporting')
    if (risks.length) studyRisks.set(`${alignment.url}::${alignment.studyId}`, uniqueRisks(risks))
  }

  const selectiveByClaim = new Map(
    selectiveOutcomeReporting.findings.map((claim) => [`${claim.url}::${claim.claimId}`, claim]),
  )

  const studies = [...studyRisks.entries()].map(([key, risks]) => {
    const separator = key.indexOf('::')
    const url = key.slice(0, separator)
    const studyId = key.slice(separator + 2)
    return {
      url,
      studyId,
      trialRegistrationIds: metadataByStudy.get(key)?.trialRegistrationIds ?? [],
      risks,
      severity: severityFor(risks),
    }
  }).sort((a, b) =>
    Number(b.severity === 'high') - Number(a.severity === 'high')
    || a.url.localeCompare(b.url)
    || a.studyId.localeCompare(b.studyId),
  )

  const claims: ClaimOutcomeReportingIntegrityFinding[] = []
  for (const { url, record } of analysis.profiles) {
    const identities = canonicalStudyIdentityMap(record)
    for (const claim of approvedClaims(record)) {
      if (!isOutcomeClaim(claim)) continue
      const claimId = text(claim.id) || 'unknown-claim'
      const studyIds = uniqueClaimStudyIdentities(claim, identities)
      const affectedStudyIds = studyIds.filter((studyId) => studyRisks.has(`${url}::${studyId}`))
      const risks = affectedStudyIds.flatMap((studyId) => studyRisks.get(`${url}::${studyId}`) ?? [])
      const selective = selectiveByClaim.get(`${url}::${claimId}`)
      if (selective?.selectiveOutcomeRisk) risks.push('null-primary-with-favorable-secondary')
      if (selective?.explicitOutcomeSwitchRisk && !risks.some((risk) =>
        risk === 'explicit-outcome-switch' || risk === 'explicit-registered-outcome-nonreporting')) {
        risks.push('explicit-outcome-switch')
      }
      const unique = uniqueRisks(risks)
      if (!unique.length) continue

      claims.push({
        url,
        claimId,
        predicate: text(claim.predicate),
        confidence: Number(claim.confidence ?? 0),
        linkedStudyCount: studyIds.length,
        affectedStudyIds,
        risks: unique,
        severity: severityFor(unique),
      })
    }
  }

  claims.sort((a, b) =>
    Number(b.severity === 'high') - Number(a.severity === 'high')
    || b.confidence - a.confidence
    || b.affectedStudyIds.length - a.affectedStudyIds.length
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )

  const highPriorityStudies = studies.filter((study) => study.severity === 'high')
  const highPriorityClaims = claims.filter((claim) => claim.severity === 'high')

  return {
    studies,
    claims,
    highPriorityStudies,
    highPriorityClaims,
    summary: {
      affectedStudies: studies.length,
      affectedApprovedOutcomeClaims: claims.length,
      highPriorityStudies: highPriorityStudies.length,
      highPriorityClaims: highPriorityClaims.length,
      explicitOutcomeSwitches: studies.filter((study) => study.risks.includes('explicit-outcome-switch')).length,
      explicitRegisteredOutcomeNonReporting: studies.filter((study) => study.risks.includes('explicit-registered-outcome-nonreporting')).length,
      primaryOutcomeMismatches: studies.filter((study) => study.risks.includes('registered-reported-primary-mismatch')).length,
      primaryOutcomePartialMismatches: studies.filter((study) => study.risks.includes('registered-reported-primary-partial-mismatch')).length,
      selectiveOutcomeClaims: claims.filter((claim) => claim.risks.includes('null-primary-with-favorable-secondary')).length,
    },
  }
}
