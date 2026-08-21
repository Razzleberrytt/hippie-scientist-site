import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  approvedClaims,
  canonicalStudyClass,
  canonicalStudyGroups,
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
  type ResearchClaim,
} from './research-coverage'
import { researchSourceEvidenceText } from './research-evidence-text'
import type { OutcomeMetadataAnalysis } from './research-outcome-metadata'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type SelectiveOutcomeReportingFinding = {
  url: string
  claimId: string
  predicate: string
  confidence: number
  humanSourceCount: number
  assessableSourceCount: number
  registeredOrPrespecifiedPrimaryNullCount: number
  favorableSecondaryOrExploratoryCount: number
  explicitOutcomeSwitchCount: number
  primaryOutcomeNotMetCount: number
  selectiveOutcomeRisk: boolean
  explicitOutcomeSwitchRisk: boolean
  reasons: string[]
}

export type SelectiveOutcomeReportingReport = {
  summary: {
    approvedOutcomeClaims: number
    assessableClaims: number
    findings: number
    highConfidenceFindings: number
    selectiveOutcomeRisks: number
    explicitOutcomeSwitchRisks: number
  }
  claims: SelectiveOutcomeReportingFinding[]
  findings: SelectiveOutcomeReportingFinding[]
  highConfidenceFindings: SelectiveOutcomeReportingFinding[]
}

const FAVORABLE_SECONDARY = /\b(?:secondary (?:outcome|endpoint)|subgroup|sub-group|post[- ]hoc|exploratory (?:outcome|endpoint|analysis))[^.]{0,220}(?:statistically\s+significant|significant(?:ly)?|improv\w*|reduc\w*|benefit\w*|favou?r\w*|superior|positive)\b/i
const NEGATED_FAVORABLE_SIGNAL = /\b(?:not|no|did not|didn't|failed to|without)\s+(?:(?:statistically|clinically)\s+)?(?:significant|significantly\s+(?:improv\w*|reduc\w*)|improv\w*|reduc\w*|benefit\w*|favou?r\w*|superior|positive)\b|\bnon[- ]?significant\b/gi
const REGISTERED_LANGUAGE = /\b(registered|prespecified|pre[- ]specified|protocol[- ]specified|trial registration|registry)\b/i

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

/** Keep the selective-reporting denominator aligned with ResearchQualityAnalysis.outcomeClaim. */
function isOutcomeClaim(claim: ResearchClaim): boolean {
  return text(claim.predicate) === 'supports_outcome'
}

/**
 * Look for an affirmative secondary/subgroup/exploratory signal after removing
 * explicitly negated result phrases. Removing only the negated signal preserves
 * mixed sentences where a null secondary endpoint is followed by a genuinely
 * favorable subgroup or post-hoc result.
 */
function hasFavorableSecondaryEvidence(value: string): boolean {
  return FAVORABLE_SECONDARY.test(value.replace(NEGATED_FAVORABLE_SIGNAL, ''))
}

/**
 * Claim-level selective-reporting analysis over canonical study outcome metadata.
 * Primary-outcome status, registration, switching, and non-reporting are owned by
 * the study-level outcome metadata product. This layer only adds claim-specific
 * favorable secondary/subgroup context and aggregates linked study findings.
 */
export function analyzeSelectiveOutcomeReporting(input: {
  analysis: ResearchQualityAnalysis
  outcomeMetadata: OutcomeMetadataAnalysis
}): SelectiveOutcomeReportingReport {
  const { analysis, outcomeMetadata } = input
  const claims: SelectiveOutcomeReportingFinding[] = []
  let approvedOutcomeClaims = 0
  const outcomeByStudy = new Map(outcomeMetadata.studies.map((study) => [`${study.url}::${study.studyId}`, study]))

  for (const { url, record } of analysis.profiles) {
    const identities = canonicalStudyIdentityMap(record)
    const groups = canonicalStudyGroups(record)
    for (const claim of approvedClaims(record)) {
      if (!isOutcomeClaim(claim)) continue
      approvedOutcomeClaims += 1

      const studyIds = uniqueClaimStudyIdentities(claim, identities)
      const linkedHumanStudies = studyIds
        .map((studyId) => ({ studyId, group: groups.get(studyId) ?? [] }))
        .filter(({ group }) => group.length > 0 && PRIMARY_HUMAN_STUDY_CLASSES.has(canonicalStudyClass(group, analysis.cache)))
      if (!linkedHumanStudies.length) continue

      const studyRows = linkedHumanStudies.map(({ studyId, group }) => {
        const metadata = outcomeByStudy.get(`${url}::${studyId}`)
        const evidenceText = group.map((source) => researchSourceEvidenceText(source, analysis.cache)).filter(Boolean).join(' · ')
        const favorableSecondary = hasFavorableSecondaryEvidence(evidenceText)
        const explicitHierarchy = Boolean(
          metadata?.hasOutcomeMetadata
          || metadata?.trialRegistrationIds.length
          || REGISTERED_LANGUAGE.test(evidenceText)
          || favorableSecondary,
        )
        return { metadata, favorableSecondary, explicitHierarchy }
      })
      const assessable = studyRows.filter((row) => row.explicitHierarchy)
      if (!assessable.length) continue

      const registeredOrPrespecifiedPrimaryNullCount = assessable.filter(({ metadata }) =>
        metadata?.primaryOutcomeStatus === 'not-met'
        && Boolean(metadata.registeredPrimaryOutcomes.length || metadata.trialRegistrationIds.length),
      ).length
      const primaryOutcomeNotMetCount = assessable.filter(({ metadata }) => metadata?.primaryOutcomeStatus === 'not-met').length
      const favorableSecondaryOrExploratoryCount = assessable.filter((row) => row.favorableSecondary).length
      const explicitOutcomeSwitchCount = assessable.filter(({ metadata }) =>
        Boolean(metadata?.explicitOutcomeSwitch || metadata?.explicitRegisteredOutcomeNotReported),
      ).length

      const selectiveOutcomeRisk = assessable.some(({ metadata, favorableSecondary }) =>
        Boolean(metadata?.primaryOutcomeStatus === 'not-met' && favorableSecondary),
      )
      const explicitOutcomeSwitchRisk = explicitOutcomeSwitchCount > 0

      const reasons: string[] = []
      if (selectiveOutcomeRisk) {
        reasons.push('linked human evidence pairs a canonical not-met primary outcome with a favorable secondary, subgroup, post-hoc, or exploratory result')
      }
      if (explicitOutcomeSwitchRisk) {
        reasons.push(`${explicitOutcomeSwitchCount} canonical linked study/studies explicitly indicate outcome switching, changed primary outcomes, or unreported registered/prespecified outcomes`)
      }

      claims.push({
        url,
        claimId: text(claim.id) || 'unknown-claim',
        predicate: text(claim.predicate),
        confidence: Number(claim.confidence ?? 0),
        humanSourceCount: linkedHumanStudies.length,
        assessableSourceCount: assessable.length,
        registeredOrPrespecifiedPrimaryNullCount,
        favorableSecondaryOrExploratoryCount,
        explicitOutcomeSwitchCount,
        primaryOutcomeNotMetCount,
        selectiveOutcomeRisk,
        explicitOutcomeSwitchRisk,
        reasons,
      })
    }
  }

  claims.sort((a, b) =>
    Number(b.explicitOutcomeSwitchRisk) - Number(a.explicitOutcomeSwitchRisk)
    || Number(b.selectiveOutcomeRisk) - Number(a.selectiveOutcomeRisk)
    || b.confidence - a.confidence
    || a.url.localeCompare(b.url)
    || a.claimId.localeCompare(b.claimId),
  )
  const findings = claims.filter((claim) => claim.selectiveOutcomeRisk || claim.explicitOutcomeSwitchRisk)
  const highConfidenceFindings = findings.filter((claim) => claim.confidence >= 0.75)

  return {
    summary: {
      approvedOutcomeClaims,
      assessableClaims: claims.length,
      findings: findings.length,
      highConfidenceFindings: highConfidenceFindings.length,
      selectiveOutcomeRisks: findings.filter((claim) => claim.selectiveOutcomeRisk).length,
      explicitOutcomeSwitchRisks: findings.filter((claim) => claim.explicitOutcomeSwitchRisk).length,
    },
    claims,
    findings,
    highConfidenceFindings,
  }
}
