import { canonicalStudyGroups, type PubmedCache, type ResearchSource } from './research-coverage'
import { researchSourceEvidenceText } from './research-evidence-text'
import type { ResearchQualityAnalysis } from './research-quality-analysis'
import type { TrialRegistrationIndependenceAnalysis } from './research-trial-registration-independence'

export type PrimaryOutcomeStatus = 'met' | 'not-met' | 'mixed' | 'unknown'

export type StudyOutcomeMetadata = {
  url: string
  studyId: string
  trialRegistrationIds: string[]
  primaryOutcomes: string[]
  secondaryOutcomes: string[]
  registeredPrimaryOutcomes: string[]
  reportedPrimaryOutcomes: string[]
  primaryOutcomeStatus: PrimaryOutcomeStatus
  explicitOutcomeSwitch: boolean
  explicitRegisteredOutcomeNotReported: boolean
  structuredFieldCount: number
  hasOutcomeMetadata: boolean
}

export type OutcomeMetadataAnalysis = {
  studies: StudyOutcomeMetadata[]
  summary: {
    canonicalStudies: number
    studiesWithOutcomeMetadata: number
    studiesWithPrimaryOutcomes: number
    studiesWithSecondaryOutcomes: number
    studiesWithRegisteredPrimaryOutcomes: number
    studiesWithReportedPrimaryOutcomes: number
    studiesWithRegistryIds: number
    primaryOutcomeNotMet: number
    explicitOutcomeSwitches: number
    explicitRegisteredOutcomeNonReporting: number
  }
}

const PRIMARY_FIELDS = ['primaryOutcome', 'primaryOutcomes'] as const
const SECONDARY_FIELDS = ['secondaryOutcome', 'secondaryOutcomes'] as const
const REGISTERED_PRIMARY_FIELDS = [
  'registeredPrimaryOutcome',
  'registeredPrimaryOutcomes',
  'prespecifiedPrimaryOutcome',
  'prespecifiedPrimaryOutcomes',
  'preSpecifiedPrimaryOutcome',
  'preSpecifiedPrimaryOutcomes',
  'protocolPrimaryOutcome',
  'protocolPrimaryOutcomes',
] as const
const REPORTED_PRIMARY_FIELDS = ['reportedPrimaryOutcome', 'reportedPrimaryOutcomes'] as const
const STATUS_FIELDS = ['primaryOutcomeStatus', 'outcomeStatus'] as const
const SWITCH_FIELDS = ['outcomeSwitch', 'outcomeSwitched', 'primaryOutcomeChanged'] as const
const NON_REPORTING_FIELDS = ['registeredOutcomeNotReported', 'prespecifiedOutcomeNotReported'] as const

const PRIMARY_NOT_MET_TEXT = /\bprimary (?:outcome|endpoint)[^.]{0,180}(?:was not met|not met|failed to meet|did not meet|no significant|not statistically significant|non[- ]significant|not superior|(?:did not|does not|not) favou?r(?:ed|s|ing)?)\b/i
const PRIMARY_MET_TEXT = /\bprimary (?:outcome|endpoint)[^.]{0,180}(?:was met|met the|was statistically significant|was significantly (?:improved|reduced|increased|decreased)|favou?r(?:ed|s)|superior)\b/i
const NEGATED_PRIMARY_POSITIVE_TEXT = /\b(?:not|never|did not|does not|failed to)\s+(?:statistically significant|significantly (?:improved|reduced|increased|decreased)|favou?r(?:ed|s|ing)?|superior)\b/gi
const OUTCOME_SWITCH_TEXT = /\b(outcome switch(?:ing|ed)?|switched (?:the )?(?:primary )?(?:outcome|endpoint)|changed (?:the )?(?:primary )?(?:outcome|endpoint)|primary outcome (?:was )?changed|deviation from (?:the )?(?:registered|prespecified|protocol[- ]specified) outcome)\b/i
const OUTCOME_NOT_REPORTED_TEXT = /\b(?:registered|prespecified|pre[- ]specified|protocol[- ]specified) (?:primary )?(?:outcome|endpoint)[^.]{0,140}(?:not reported|was not reported|unreported|omitted)\b/i

function text(value: unknown): string {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function stringValues(value: unknown): string[] {
  if (typeof value === 'string') return value.split(/[;\n|]+/).map(text).filter(Boolean)
  if (Array.isArray(value)) return value.flatMap(stringValues)
  return []
}

function booleanValue(value: unknown): boolean {
  if (value === true) return true
  return /^(?:true|yes|1|changed|switched|not[- ]?reported)$/i.test(text(value))
}

function sourceAndCacheRecords(source: ResearchSource, cache: PubmedCache): Record<string, unknown>[] {
  const pmid = text(source.pmid ?? source.pubmedId)
  return [source, ...(pmid && cache[pmid] ? [cache[pmid]] : [])]
}

function valuesForFields(group: ResearchSource[], cache: PubmedCache, fields: readonly string[]): string[] {
  const values = group.flatMap((source) => sourceAndCacheRecords(source, cache))
    .flatMap((record) => fields.flatMap((field) => stringValues(record[field])))
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function anyBooleanField(group: ResearchSource[], cache: PubmedCache, fields: readonly string[]): boolean {
  return group.flatMap((source) => sourceAndCacheRecords(source, cache))
    .some((record) => fields.some((field) => booleanValue(record[field])))
}

function explicitStructuredFieldCount(group: ResearchSource[], cache: PubmedCache): number {
  const fields = [
    ...PRIMARY_FIELDS,
    ...SECONDARY_FIELDS,
    ...REGISTERED_PRIMARY_FIELDS,
    ...REPORTED_PRIMARY_FIELDS,
    ...STATUS_FIELDS,
    ...SWITCH_FIELDS,
    ...NON_REPORTING_FIELDS,
  ]
  return group.flatMap((source) => sourceAndCacheRecords(source, cache))
    .reduce((sum, record) => sum + fields.filter((field) => {
      const value = record[field]
      return Array.isArray(value) ? value.length > 0 : text(value).length > 0
    }).length, 0)
}

function normalizedStatus(group: ResearchSource[], cache: PubmedCache): PrimaryOutcomeStatus {
  const explicit = valuesForFields(group, cache, STATUS_FIELDS).map((value) => value.toLowerCase())
  const explicitMet = explicit.some((value) => /^(?:met|positive|significant|benefit)$/.test(value))
  const explicitNotMet = explicit.some((value) => /^(?:not[- ]?met|null|negative|non[- ]?significant|nonsignificant)$/.test(value))
  if (explicitMet && explicitNotMet) return 'mixed'
  if (explicitNotMet) return 'not-met'
  if (explicitMet) return 'met'

  const evidenceText = group.map((source) => researchSourceEvidenceText(source, cache)).filter(Boolean).join(' · ')
  const positiveEvidenceText = evidenceText.replace(NEGATED_PRIMARY_POSITIVE_TEXT, '')
  const textMet = PRIMARY_MET_TEXT.test(positiveEvidenceText)
  const textNotMet = PRIMARY_NOT_MET_TEXT.test(evidenceText)
  if (textMet && textNotMet) return 'mixed'
  if (textNotMet) return 'not-met'
  if (textMet) return 'met'
  return 'unknown'
}

/**
 * Build one canonical outcome-hierarchy record per canonical publication.
 * Explicit structured outcome names are preserved; prose is used only for
 * conservative status/switch/non-reporting flags, never to manufacture outcome
 * labels that are not present in structured metadata.
 */
export function analyzeOutcomeMetadata(input: {
  analysis: ResearchQualityAnalysis
  trialRegistrationIndependence: TrialRegistrationIndependenceAnalysis
}): OutcomeMetadataAnalysis {
  const { analysis, trialRegistrationIndependence } = input
  const registryByStudy = new Map(
    trialRegistrationIndependence.studies.map((study) => [`${study.url}::${study.studyId}`, study.registryIds]),
  )
  const studies: StudyOutcomeMetadata[] = []

  for (const { url, record } of analysis.profiles) {
    for (const [studyId, group] of canonicalStudyGroups(record)) {
      const primaryOutcomes = valuesForFields(group, analysis.cache, PRIMARY_FIELDS)
      const secondaryOutcomes = valuesForFields(group, analysis.cache, SECONDARY_FIELDS)
      const registeredPrimaryOutcomes = valuesForFields(group, analysis.cache, REGISTERED_PRIMARY_FIELDS)
      const reportedPrimaryOutcomes = valuesForFields(group, analysis.cache, REPORTED_PRIMARY_FIELDS)
      const evidenceText = group.map((source) => researchSourceEvidenceText(source, analysis.cache)).filter(Boolean).join(' · ')
      const explicitOutcomeSwitch = anyBooleanField(group, analysis.cache, SWITCH_FIELDS) || OUTCOME_SWITCH_TEXT.test(evidenceText)
      const explicitRegisteredOutcomeNotReported = anyBooleanField(group, analysis.cache, NON_REPORTING_FIELDS)
        || OUTCOME_NOT_REPORTED_TEXT.test(evidenceText)
      const primaryOutcomeStatus = normalizedStatus(group, analysis.cache)
      const structuredFieldCount = explicitStructuredFieldCount(group, analysis.cache)
      const trialRegistrationIds = registryByStudy.get(`${url}::${studyId}`) ?? []
      const hasOutcomeMetadata = structuredFieldCount > 0
        || primaryOutcomeStatus !== 'unknown'
        || explicitOutcomeSwitch
        || explicitRegisteredOutcomeNotReported

      studies.push({
        url,
        studyId,
        trialRegistrationIds,
        primaryOutcomes,
        secondaryOutcomes,
        registeredPrimaryOutcomes,
        reportedPrimaryOutcomes,
        primaryOutcomeStatus,
        explicitOutcomeSwitch,
        explicitRegisteredOutcomeNotReported,
        structuredFieldCount,
        hasOutcomeMetadata,
      })
    }
  }

  studies.sort((a, b) => a.url.localeCompare(b.url) || a.studyId.localeCompare(b.studyId))
  return {
    studies,
    summary: {
      canonicalStudies: studies.length,
      studiesWithOutcomeMetadata: studies.filter((study) => study.hasOutcomeMetadata).length,
      studiesWithPrimaryOutcomes: studies.filter((study) => study.primaryOutcomes.length > 0).length,
      studiesWithSecondaryOutcomes: studies.filter((study) => study.secondaryOutcomes.length > 0).length,
      studiesWithRegisteredPrimaryOutcomes: studies.filter((study) => study.registeredPrimaryOutcomes.length > 0).length,
      studiesWithReportedPrimaryOutcomes: studies.filter((study) => study.reportedPrimaryOutcomes.length > 0).length,
      studiesWithRegistryIds: studies.filter((study) => study.trialRegistrationIds.length > 0).length,
      primaryOutcomeNotMet: studies.filter((study) => study.primaryOutcomeStatus === 'not-met').length,
      explicitOutcomeSwitches: studies.filter((study) => study.explicitOutcomeSwitch).length,
      explicitRegisteredOutcomeNonReporting: studies.filter((study) => study.explicitRegisteredOutcomeNotReported).length,
    },
  }
}
