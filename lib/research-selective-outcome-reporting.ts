import {
  PRIMARY_HUMAN_STUDY_CLASSES,
  approvedClaims,
  sourceMap,
  sourceStudyClass,
  uniqueSourceRefs,
  type ResearchClaim,
} from './research-coverage'
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

const REGISTERED_PRIMARY_NULL = /\b(?:registered|prespecified|pre[- ]specified|protocol[- ]specified) (?:primary )?(?:outcome|endpoint)[^.]{0,220}(?:no significant|not statistically significant|non[- ]significant|did not|failed to|not met|was not met|null)\b/i
const PRIMARY_NOT_MET = /\bprimary (?:outcome|endpoint)[^.]{0,180}(?:was not met|not met|failed to meet|did not meet|no significant|not statistically significant|non[- ]significant)\b/i
const FAVORABLE_SECONDARY = /\b(?:secondary (?:outcome|endpoint)|subgroup|sub-group|post[- ]hoc|exploratory (?:outcome|endpoint|analysis))[^.]{0,220}(?:significant|improv|reduc|benefit|favou?r|superior|positive)\b/i
const OUTCOME_SWITCH = /\b(outcome switch(?:ing|ed)?|switched (?:the )?(?:primary )?(?:outcome|endpoint)|changed (?:the )?(?:primary )?(?:outcome|endpoint)|primary outcome (?:was )?changed|deviation from (?:the )?(?:registered|prespecified|protocol[- ]specified) outcome|registered outcome[^.]{0,120}not reported|prespecified outcome[^.]{0,120}not reported)\b/i
const REGISTERED_LANGUAGE = /\b(registered|prespecified|pre[- ]specified|protocol[- ]specified|trial registration|registry)\b/i

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function sourceEvidenceText(source: Record<string, unknown>, cache: ResearchQualityAnalysis['cache']): string {
  const pmid = text(source.pmid ?? source.pubmedId)
  const meta = pmid ? cache[pmid] ?? {} : {}
  return [
    source.title,
    source.note,
    source.citation,
    source.result,
    source.results,
    source.effect,
    source.primaryOutcome,
    source.secondaryOutcome,
    source.outcomeRegistration,
    meta.title,
    meta.abstract,
    meta.primaryOutcome,
    meta.secondaryOutcome,
    meta.outcomeRegistration,
  ].map(text).filter(Boolean).join(' · ')
}

function isOutcomeClaim(claim: ResearchClaim): boolean {
  return /supports_outcome|benefit|efficacy/i.test(text(claim.predicate))
}

export function analyzeSelectiveOutcomeReporting(
  analysis: ResearchQualityAnalysis,
): SelectiveOutcomeReportingReport {
  const claims: SelectiveOutcomeReportingFinding[] = []
  let approvedOutcomeClaims = 0

  for (const { url, record } of analysis.profiles) {
    const sourcesById = sourceMap(record)
    for (const claim of approvedClaims(record)) {
      if (!isOutcomeClaim(claim)) continue
      approvedOutcomeClaims += 1

      const humanSources = uniqueSourceRefs(claim)
        .map((id) => sourcesById.get(id))
        .filter((source): source is Record<string, unknown> => Boolean(source))
        .filter((source) => PRIMARY_HUMAN_STUDY_CLASSES.has(sourceStudyClass(source, analysis.cache)))
      if (!humanSources.length) continue

      const sourceTexts = humanSources.map((source) => sourceEvidenceText(source, analysis.cache)).filter(Boolean)
      const assessable = sourceTexts.filter((value) =>
        REGISTERED_PRIMARY_NULL.test(value)
        || PRIMARY_NOT_MET.test(value)
        || FAVORABLE_SECONDARY.test(value)
        || OUTCOME_SWITCH.test(value)
        || REGISTERED_LANGUAGE.test(value),
      )
      if (!assessable.length) continue

      const registeredOrPrespecifiedPrimaryNullCount = assessable.filter((value) => REGISTERED_PRIMARY_NULL.test(value)).length
      const primaryOutcomeNotMetCount = assessable.filter((value) => PRIMARY_NOT_MET.test(value)).length
      const favorableSecondaryOrExploratoryCount = assessable.filter((value) => FAVORABLE_SECONDARY.test(value)).length
      const explicitOutcomeSwitchCount = assessable.filter((value) => OUTCOME_SWITCH.test(value)).length

      const selectiveOutcomeRisk = assessable.some((value) =>
        (REGISTERED_PRIMARY_NULL.test(value) || PRIMARY_NOT_MET.test(value)) && FAVORABLE_SECONDARY.test(value),
      )
      const explicitOutcomeSwitchRisk = explicitOutcomeSwitchCount > 0

      const reasons: string[] = []
      if (selectiveOutcomeRisk) {
        reasons.push('linked human evidence explicitly pairs a null/not-met primary outcome with a favorable secondary, subgroup, post-hoc, or exploratory result')
      }
      if (explicitOutcomeSwitchRisk) {
        reasons.push(`${explicitOutcomeSwitchCount} linked human source(s) explicitly describe outcome switching, changed primary outcomes, or unreported registered/prespecified outcomes`)
      }

      claims.push({
        url,
        claimId: text(claim.id) || 'unknown-claim',
        predicate: text(claim.predicate),
        confidence: Number(claim.confidence ?? 0),
        humanSourceCount: humanSources.length,
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
