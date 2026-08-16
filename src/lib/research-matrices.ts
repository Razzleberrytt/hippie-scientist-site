import 'server-only'

import { cache } from '@/lib/react-cache'
import { reconcileEvidenceGrade, type CanonicalEvidenceGrade } from '../../lib/evidence-grade'
import { buildResearchQualitySnapshot } from '../../lib/research-quality-snapshot'
import { getRuntimeVisibility } from '../../lib/runtime-visibility'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { normalizeEffect, normalizeSafetySignals, uniqueNormalized } from '@/lib/botanical-atlas-taxonomy'
import type { RuntimeRecord } from '@/types/content'
import type { ResearchMatrixRow } from './research-matrices.shared'

export {
  RISK_MATRIX_DEFINITIONS,
  rowsForRiskMatrix,
  type ResearchMatrixRow,
  type RiskMatrixId,
} from './research-matrices.shared'

const POPULAR_SLUG_PRIORITY = [
  'ashwagandha', 'magnesium', 'melatonin', 'l-theanine', 'creatine', 'berberine',
  'rhodiola-rosea', 'rhodiola', 'saffron', 'lions-mane', 'bacopa-monnieri', 'bacopa',
  'valerian', 'chamomile', 'turmeric', 'curcumin', 'omega-3', 'fish-oil', 'caffeine',
  'citicoline', 'alpha-gpc', 'inositol', 'cinnamon', 'st-johns-wort',
]

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[;,|]/).map((item) => item.trim()).filter(Boolean)
  return []
}

const collect = (...values: unknown[]) => values.flatMap(list)

const text = (...values: unknown[]) => {
  const found = values.find((value) => typeof value === 'string' && value.trim())
  return typeof found === 'string' ? found.trim() : ''
}

const positiveInteger = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.floor(value)
    if (Array.isArray(value) && value.length) return value.length
    if (typeof value === 'string') {
      const match = value.match(/\d+/)
      if (match) return Number.parseInt(match[0], 10)
    }
  }
  return 0
}

const canonicalEvidence = (record: RuntimeRecord): CanonicalEvidenceGrade | 'Unassigned' => {
  const reconciled = reconcileEvidenceGrade(
    record.evidence_grade ?? record.evidenceGrade,
    record.evidence_tier ?? record.evidenceTier ?? record.evidenceLevel,
  )
  return reconciled.grade ?? 'Unassigned'
}

type CanonicalHumanCount = {
  publicationCount: number
  underlyingStudyCount: number
  collapsedPublicationCount: number
}

const toMatrixRow = (
  record: RuntimeRecord,
  canonicalHumanByUrl: ReadonlyMap<string, CanonicalHumanCount>,
): ResearchMatrixRow => {
  const entityType = record.entityType === 'compound' ? 'compound' : 'herb'
  const outcomes = uniqueNormalized(
    collect(record.primary_effects, record.effects, record.primaryActions, record.benefits, record.conditions),
    normalizeEffect,
  )
  const mechanisms = Array.from(new Set(collect(
    record.mechanisms,
    record.raw_mechanisms,
    record.canonical_mechanisms,
    record.mechanism_target_systems,
    record.mechanism_classes,
  )))
  const safetyRaw = collect(
    record.safety_flags,
    record.interactionTags,
    record.contraindications,
    record.interactions,
    record.safety,
    record.warnings,
    record.side_effects,
  )
  const safetySignals = Array.from(new Set(safetyRaw.flatMap(normalizeSafetySignals)))
  const name = text(record.displayName, record.name, record.compoundName, record.commonName, record.slug)
  const slug = String(record.slug ?? '')
  const href = entityType === 'compound' ? `/compounds/${slug}/` : `/herbs/${slug}/`
  const legacyHumanCount = positiveInteger(
    record.human_trial_count,
    record.humanTrialCount,
    record.human_study_count,
    record.humanStudyCount,
    record.clinical_study_count,
    record.clinicalStudyCount,
    record.human_trials,
    record.humanTrials,
    record.clinical_trials,
    record.clinicalTrials,
  )
  const canonicalHuman = canonicalHumanByUrl.get(href)

  return {
    slug,
    name,
    entityType,
    href,
    evidenceGrade: canonicalEvidence(record),
    humanEvidenceCount: canonicalHuman?.underlyingStudyCount ?? legacyHumanCount,
    humanPublicationCount: canonicalHuman?.publicationCount ?? legacyHumanCount,
    collapsedHumanPublicationCount: canonicalHuman?.collapsedPublicationCount ?? 0,
    humanEvidenceCountCanonical: Boolean(canonicalHuman),
    outcomes,
    mechanisms,
    safetySignals,
  }
}

const priorityIndex = (slug: string) => {
  const index = POPULAR_SLUG_PRIORITY.indexOf(slug)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

const evidenceRank: Record<ResearchMatrixRow['evidenceGrade'], number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  'Avoid/Insufficient': 1,
  Unassigned: 0,
}

export const getResearchMatrixRows = cache(async (): Promise<ResearchMatrixRow[]> => {
  const { allRecords } = await getUnifiedRuntimeRecords()
  const { topology } = buildResearchQualitySnapshot(process.cwd())
  const canonicalHumanByUrl = new Map<string, CanonicalHumanCount>(
    topology.underlyingStudyIndependence.profiles.map((profile) => [
      profile.url,
      {
        publicationCount: profile.primaryHumanPublicationCount,
        underlyingStudyCount: profile.primaryHumanUnderlyingStudyCount,
        collapsedPublicationCount: profile.collapsedPrimaryHumanPublicationCount,
      },
    ]),
  )

  return (allRecords as RuntimeRecord[])
    .filter((record) => Boolean(record.slug) && getRuntimeVisibility(record).canRender)
    .map((record) => toMatrixRow(record, canonicalHumanByUrl))
    .filter((row) => row.outcomes.length || row.safetySignals.length || row.humanEvidenceCount > 0)
    .sort((a, b) => {
      const priorityDelta = priorityIndex(a.slug) - priorityIndex(b.slug)
      if (priorityDelta) return priorityDelta
      const humanDelta = b.humanEvidenceCount - a.humanEvidenceCount
      if (humanDelta) return humanDelta
      const evidenceDelta = evidenceRank[b.evidenceGrade] - evidenceRank[a.evidenceGrade]
      if (evidenceDelta) return evidenceDelta
      return a.name.localeCompare(b.name)
    })
})
