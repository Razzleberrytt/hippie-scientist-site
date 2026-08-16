import { canonicalStudyGroups, type ResearchSource } from './research-coverage'
import type { ResearchQualityAnalysis } from './research-quality-analysis'

export type StudyEvidenceLineage = {
  url: string
  studyId: string
  lineageIds: string[]
  explicitLineage: boolean
}

export type ClaimEvidenceLineage = {
  url: string
  claimId: string
  confidence: number
  studyCount: number
  studiesWithExplicitLineage: number
  explicitLineageCoverage: number
  repeatedExplicitLineages: string[]
  sharedNonRegistryLineage: boolean
  highConfidenceSharedNonRegistryLineage: boolean
}

export type EvidenceLineageAnalysis = {
  studies: StudyEvidenceLineage[]
  claims: ClaimEvidenceLineage[]
  sharedNonRegistryLineageClaims: ClaimEvidenceLineage[]
  highConfidenceSharedNonRegistryLineageClaims: ClaimEvidenceLineage[]
  summary: {
    studies: number
    studiesWithExplicitLineage: number
    explicitStudyLineageCoverage: number
    multiStudyApprovedClaims: number
    sharedNonRegistryLineageClaims: number
    highConfidenceSharedNonRegistryLineageClaims: number
  }
}

// Clinical-trial registration is owned by research-trial-registration-independence.
// This module covers explicit non-registry lineage that can still make separate
// publications dependent: cohort, dataset, parent-study, or analysis-family IDs.
const COHORT_KEYS = ['cohortId', 'cohortIdentifier', 'studyCohortId'] as const
const DATASET_KEYS = ['datasetId', 'dataSetId', 'datasetIdentifier', 'dataSourceId'] as const
const PARENT_KEYS = ['parentStudyId', 'studyGroupId', 'lineageId', 'underlyingStudyId', 'analysisFamilyId'] as const

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function normalizeIdentifier(value: unknown): string {
  return text(value).replace(/^urn:/i, '').trim().toUpperCase()
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

export function explicitNonRegistryLineageIds(source: ResearchSource): string[] {
  return [...new Set([
    ...values(source, COHORT_KEYS).map((id) => `cohort:${id}`),
    ...values(source, DATASET_KEYS).map((id) => `dataset:${id}`),
    ...values(source, PARENT_KEYS).map((id) => `parent:${id}`),
  ])].sort()
}

export function analyzeEvidenceLineage(analysis: ResearchQualityAnalysis): EvidenceLineageAnalysis {
  const studies: StudyEvidenceLineage[] = []
  const claims: ClaimEvidenceLineage[] = []
  const lineagesByUrl = new Map<string, Map<string, string[]>>()

  for (const profile of analysis.profiles) {
    const byStudy = new Map<string, string[]>()
    for (const [studyId, group] of canonicalStudyGroups(profile.record)) {
      const lineageIds = [...new Set(group.flatMap(explicitNonRegistryLineageIds))].sort()
      byStudy.set(studyId, lineageIds)
      studies.push({ url: profile.url, studyId, lineageIds, explicitLineage: lineageIds.length > 0 })
    }
    lineagesByUrl.set(profile.url, byStudy)
  }

  for (const claim of analysis.claimAnalyses) {
    if (claim.studyCount < 2) continue
    const byStudy = lineagesByUrl.get(claim.url) ?? new Map<string, string[]>()
    const explicit = claim.studyIds
      .map((studyId) => ({ studyId, lineageIds: byStudy.get(studyId) ?? [] }))
      .filter((item) => item.lineageIds.length > 0)
    const lineageUse = new Map<string, Set<string>>()
    for (const item of explicit) {
      for (const lineageId of item.lineageIds) {
        const studiesForLineage = lineageUse.get(lineageId) ?? new Set<string>()
        studiesForLineage.add(item.studyId)
        lineageUse.set(lineageId, studiesForLineage)
      }
    }
    const repeatedExplicitLineages = [...lineageUse.entries()]
      .filter(([, studyIds]) => studyIds.size >= 2)
      .map(([lineageId]) => lineageId)
      .sort()
    const sharedNonRegistryLineage = repeatedExplicitLineages.length > 0
    const studiesWithExplicitLineage = explicit.length

    claims.push({
      url: claim.url,
      claimId: claim.claimId,
      confidence: claim.confidence,
      studyCount: claim.studyCount,
      studiesWithExplicitLineage,
      explicitLineageCoverage: claim.studyCount ? studiesWithExplicitLineage / claim.studyCount : 0,
      repeatedExplicitLineages,
      sharedNonRegistryLineage,
      highConfidenceSharedNonRegistryLineage: sharedNonRegistryLineage && claim.confidence >= 0.75,
    })
  }

  const sharedNonRegistryLineageClaims = claims.filter((claim) => claim.sharedNonRegistryLineage)
  const highConfidenceSharedNonRegistryLineageClaims = claims.filter((claim) => claim.highConfidenceSharedNonRegistryLineage)
  const studiesWithExplicitLineage = studies.filter((study) => study.explicitLineage).length

  return {
    studies,
    claims,
    sharedNonRegistryLineageClaims,
    highConfidenceSharedNonRegistryLineageClaims,
    summary: {
      studies: studies.length,
      studiesWithExplicitLineage,
      explicitStudyLineageCoverage: studies.length ? studiesWithExplicitLineage / studies.length : 1,
      multiStudyApprovedClaims: claims.length,
      sharedNonRegistryLineageClaims: sharedNonRegistryLineageClaims.length,
      highConfidenceSharedNonRegistryLineageClaims: highConfidenceSharedNonRegistryLineageClaims.length,
    },
  }
}
