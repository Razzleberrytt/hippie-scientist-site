import { canonicalStudyGroups, canonicalStudyIdentityMap, type ResearchSource } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type StudyLineage = {
  url: string
  studyId: string
  lineageIds: string[]
  explicitLineage: boolean
}

export type ClaimLineageAnalysis = {
  url: string
  claimId: string
  confidence: number
  studyCount: number
  studiesWithExplicitLineage: number
  explicitLineageCoverage: number
  explicitLineageCount: number
  repeatedExplicitLineages: string[]
  sharedUnderlyingStudy: boolean
  highConfidenceSharedUnderlyingStudy: boolean
}

export type EvidenceLineageAnalysis = {
  studies: StudyLineage[]
  claims: ClaimLineageAnalysis[]
  sharedUnderlyingStudyClaims: ClaimLineageAnalysis[]
  highConfidenceSharedUnderlyingStudyClaims: ClaimLineageAnalysis[]
  summary: {
    studies: number
    studiesWithExplicitLineage: number
    explicitStudyLineageCoverage: number
    multiStudyApprovedClaims: number
    sharedUnderlyingStudyClaims: number
    highConfidenceSharedUnderlyingStudyClaims: number
  }
}

const REGISTRY_KEYS = [
  'trialRegistrationId', 'trialRegistryId', 'registrationId', 'registryId',
  'clinicalTrialId', 'clinicalTrialsId', 'nctId', 'isrctnId', 'actrnId',
] as const
const COHORT_KEYS = ['cohortId', 'cohortIdentifier', 'studyCohortId'] as const
const DATASET_KEYS = ['datasetId', 'dataSetId', 'datasetIdentifier'] as const
const PARENT_KEYS = ['parentStudyId', 'studyGroupId', 'lineageId', 'underlyingStudyId'] as const

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function normalizeIdentifier(value: unknown): string {
  return text(value)
    .replace(/^https?:\/\/(?:www\.)?clinicaltrials\.gov\/(?:study\/)?/i, '')
    .replace(/^urn:/i, '')
    .trim()
    .toUpperCase()
}

function values(source: ResearchSource, keys: readonly string[]): string[] {
  const out: string[] = []
  for (const key of keys) {
    const value = source[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        const normalized = normalizeIdentifier(item)
        if (normalized) out.push(normalized)
      }
    } else {
      const normalized = normalizeIdentifier(value)
      if (normalized) out.push(normalized)
    }
  }
  return out
}

export function explicitSourceLineageIds(source: ResearchSource): string[] {
  return [...new Set([
    ...values(source, REGISTRY_KEYS).map((id) => `registry:${id}`),
    ...values(source, COHORT_KEYS).map((id) => `cohort:${id}`),
    ...values(source, DATASET_KEYS).map((id) => `dataset:${id}`),
    ...values(source, PARENT_KEYS).map((id) => `parent:${id}`),
  ])].sort()
}

export function analyzeEvidenceLineage(analysis: ResearchQualityAnalysis): EvidenceLineageAnalysis {
  const studies: StudyLineage[] = []
  const claims: ClaimLineageAnalysis[] = []

  for (const profile of analysis.profiles) {
    const identities = canonicalStudyIdentityMap(profile.record)
    const groups = canonicalStudyGroups(profile.record)
    const lineagesByStudy = new Map<string, string[]>()

    for (const [studyId, group] of groups) {
      const lineageIds = [...new Set(group.flatMap(explicitSourceLineageIds))].sort()
      lineagesByStudy.set(studyId, lineageIds)
      studies.push({
        url: profile.url,
        studyId,
        lineageIds,
        explicitLineage: lineageIds.length > 0,
      })
    }

    const rawClaims = Array.isArray(profile.record.claimMap) ? profile.record.claimMap : []
    for (const claim of rawClaims) {
      if (text(claim.reviewStatus).toLowerCase() !== 'approved') continue
      const rawRefs = Array.isArray(claim.sourceRefIds) ? claim.sourceRefIds.map(text).filter(Boolean) : []
      const studyIds = [...new Set(rawRefs.map((ref) => identities.get(ref)).filter((id): id is string => Boolean(id)))]
      if (studyIds.length < 2) continue

      const explicit = studyIds
        .map((studyId) => ({ studyId, lineageIds: lineagesByStudy.get(studyId) ?? [] }))
        .filter((item) => item.lineageIds.length > 0)
      const lineageUse = new Map<string, Set<string>>()
      for (const item of explicit) {
        for (const lineageId of item.lineageIds) {
          const studySet = lineageUse.get(lineageId) ?? new Set<string>()
          studySet.add(item.studyId)
          lineageUse.set(lineageId, studySet)
        }
      }
      const repeatedExplicitLineages = [...lineageUse.entries()]
        .filter(([, studySet]) => studySet.size >= 2)
        .map(([lineageId]) => lineageId)
        .sort()
      const sharedUnderlyingStudy = repeatedExplicitLineages.length > 0
      const confidence = Number(claim.confidence ?? 0)
      const studiesWithExplicitLineage = explicit.length
      const explicitLineageCount = new Set(explicit.flatMap((item) => item.lineageIds)).size

      claims.push({
        url: profile.url,
        claimId: text(claim.id) || 'unknown-claim',
        confidence,
        studyCount: studyIds.length,
        studiesWithExplicitLineage,
        explicitLineageCoverage: studyIds.length ? studiesWithExplicitLineage / studyIds.length : 0,
        explicitLineageCount,
        repeatedExplicitLineages,
        sharedUnderlyingStudy,
        highConfidenceSharedUnderlyingStudy: sharedUnderlyingStudy && confidence >= 0.75,
      })
    }
  }

  const sharedUnderlyingStudyClaims = claims.filter((claim) => claim.sharedUnderlyingStudy)
  const highConfidenceSharedUnderlyingStudyClaims = claims.filter((claim) => claim.highConfidenceSharedUnderlyingStudy)
  const studiesWithExplicitLineage = studies.filter((study) => study.explicitLineage).length

  return {
    studies,
    claims,
    sharedUnderlyingStudyClaims,
    highConfidenceSharedUnderlyingStudyClaims,
    summary: {
      studies: studies.length,
      studiesWithExplicitLineage,
      explicitStudyLineageCoverage: studies.length ? studiesWithExplicitLineage / studies.length : 1,
      multiStudyApprovedClaims: claims.length,
      sharedUnderlyingStudyClaims: sharedUnderlyingStudyClaims.length,
      highConfidenceSharedUnderlyingStudyClaims: highConfidenceSharedUnderlyingStudyClaims.length,
    },
  }
}
