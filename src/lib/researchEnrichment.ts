import { cleanText } from '@/lib/sanitize'
import type {
  ConflictState,
  EvidenceJudgment,
  EditorialStatus,
  EvidenceClass,
  EvidenceLabel,
  EvidenceTier,
  ExtractConfidence,
  ResearchClaim,
  ResearchEnrichment,
  ResearchSourceRef,
  SourceRefType,
} from '@/types/researchEnrichment'

const EVIDENCE_CLASSES = new Set<EvidenceClass>([
  'human-clinical',
  'human-observational',
  'preclinical-mechanistic',
  'traditional-use',
  'regulatory-monograph',
])

const EVIDENCE_TIERS = new Set<EvidenceTier>([
  'tier-1-strong',
  'tier-2-moderate',
  'tier-3-limited',
  'tier-4-insufficient',
])

const EDITORIAL_STATUSES = new Set<EditorialStatus>([
  'draft',
  'needs_review',
  'reviewed',
  'in-review',
  'approved',
  'published',
  'blocked',
  'needs-update',
  'deprecated',
])

const SOURCE_TYPES = new Set<SourceRefType>([
  'rct',
  'systematic-review',
  'observational',
  'preclinical',
  'monograph',
  'traditional-text',
  'regulatory',
  'other',
])

const EXTRACT_CONFIDENCE_VALUES = new Set<ExtractConfidence>(['high', 'medium', 'low'])
const EVIDENCE_LABELS = new Set<EvidenceLabel>([
  'stronger_human_support',
  'limited_human_support',
  'observational_only',
  'preclinical_only',
  'traditional_use_only',
  'mixed_or_uncertain',
  'conflicting_evidence',
  'insufficient_evidence',
])
const CONFLICT_STATES = new Set<ConflictState>(['none', 'mixed_or_uncertain', 'conflicting_evidence'])
const isNonNullable = <T>(value: T | null | undefined): value is T => value != null

function asEvidenceJudgment(value: unknown): EvidenceJudgment | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const evidenceLabelText = cleanText(row.evidenceLabel)
  if (!EVIDENCE_LABELS.has(evidenceLabelText as EvidenceLabel)) return null
  const grading = row.grading && typeof row.grading === 'object' ? (row.grading as Record<string, unknown>) : null
  if (!grading) return null
  const evidenceClass = Array.isArray(grading.evidenceClass)
    ? Array.from(new Set(grading.evidenceClass.map(item => asEvidenceClass(item)).filter(isNonNullable)))
    : []
  const studyDesignWeight = Number(grading.studyDesignWeight)
  const humanRelevance = cleanText(grading.humanRelevance)
  const directnessToClaim = cleanText(grading.directnessToClaim)
  const replicationDepth = Number(grading.replicationDepth)
  const sourceReliabilityTier = cleanText(grading.sourceReliabilityTier)
  const recencyWeight = Number(grading.recencyWeight)
  const editorialConfidence = cleanText(grading.editorialConfidence)
  const conflictStateText = cleanText(grading.conflictState)
  const confidenceIndex = Number(grading.confidenceIndex)
  const toneGuidance = cleanText(row.toneGuidance)
  const conflictNotes = Array.isArray(row.conflictNotes)
    ? row.conflictNotes.map(item => cleanText(item)).filter(Boolean)
    : []
  const uncertaintyNotes = Array.isArray(row.uncertaintyNotes)
    ? row.uncertaintyNotes.map(item => cleanText(item)).filter(Boolean)
    : []
  if (
    evidenceClass.length === 0 ||
    !Number.isFinite(studyDesignWeight) ||
    !humanRelevance ||
    !directnessToClaim ||
    !Number.isFinite(replicationDepth) ||
    !sourceReliabilityTier ||
    !Number.isFinite(recencyWeight) ||
    !['high', 'medium', 'low'].includes(editorialConfidence) ||
    !CONFLICT_STATES.has(conflictStateText as ConflictState) ||
    !Number.isFinite(confidenceIndex) ||
    !toneGuidance
  ) {
    return null
  }
  return {
    evidenceLabel: evidenceLabelText as EvidenceLabel,
    grading: {
      evidenceClass,
      studyDesignWeight,
      humanRelevance: humanRelevance as EvidenceJudgment['grading']['humanRelevance'],
      directnessToClaim: directnessToClaim as EvidenceJudgment['grading']['directnessToClaim'],
      replicationDepth,
      sourceReliabilityTier: sourceReliabilityTier as EvidenceJudgment['grading']['sourceReliabilityTier'],
      recencyWeight,
      editorialConfidence: editorialConfidence as EvidenceJudgment['grading']['editorialConfidence'],
      conflictState: conflictStateText as ConflictState,
      confidenceIndex,
    },
    conflictNotes,
    uncertaintyNotes,
    toneGuidance,
  }
}

function asEvidenceClass(value: unknown): EvidenceClass | null {
  const text = cleanText(value)
  return EVIDENCE_CLASSES.has(text as EvidenceClass) ? (text as EvidenceClass) : null
}

function asClaims(value: unknown): ResearchClaim[] {
  if (!Array.isArray(value)) return []

  return value
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const claim = cleanText(row.claim)
      const evidenceClass = asEvidenceClass(row.evidenceClass)
      const sourceRefIds = Array.isArray(row.sourceRefIds)
        ? row.sourceRefIds.map(id => cleanText(id)).filter(Boolean)
        : []
      const strengthNote = cleanText(row.strengthNote)
      const evidenceGradeText = cleanText(row.evidence_grade)
      const evidenceGrade =
        evidenceGradeText === 'A' || evidenceGradeText === 'B' ? evidenceGradeText : null
      const population = cleanText(row.population)
      const primaryPmids = Array.isArray(row.primary_pmids)
        ? row.primary_pmids.map(item => cleanText(item)).filter(Boolean)
        : []
      if (!claim || !evidenceClass || sourceRefIds.length === 0) return null
      return {
        claim,
        evidenceClass,
        sourceRefIds: Array.from(new Set(sourceRefIds)),
        ...(strengthNote ? { strengthNote } : {}),
        ...(evidenceGrade ? { evidenceGrade } : {}),
        ...(population ? { population } : {}),
        ...(primaryPmids.length > 0 ? { primaryPmids: Array.from(new Set(primaryPmids)) } : {}),
      }
    })
    .filter((item): item is ResearchClaim => Boolean(item))
}

function asSourceRefs(value: unknown): ResearchSourceRef[] {
  if (!Array.isArray(value)) return []

  return value
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const source = item as Record<string, unknown>
      const sourceId = cleanText(source.sourceId)
      const sourceTypeText = cleanText(source.sourceType)
      const sourceType = SOURCE_TYPES.has(sourceTypeText as SourceRefType)
        ? (sourceTypeText as SourceRefType)
        : null
      const title = cleanText(source.title)
      const evidenceClass = asEvidenceClass(source.evidenceClass)
      const extractConfidenceText = cleanText(source.extractConfidence)
      const extractConfidence = EXTRACT_CONFIDENCE_VALUES.has(
        extractConfidenceText as ExtractConfidence,
      )
        ? (extractConfidenceText as ExtractConfidence)
        : null
      const reviewer = cleanText(source.reviewer)
      const organization = cleanText(source.organization)
      const url = cleanText(source.url)
      const citationKey = cleanText(source.citationKey)
      const notes = cleanText(source.notes)
      const publicationYear = Number(source.publicationYear)

      if (
        !sourceId ||
        !sourceType ||
        !title ||
        !evidenceClass ||
        !extractConfidence ||
        !reviewer ||
        (!url && !citationKey)
      ) {
        return null
      }

      return {
        sourceId,
        sourceType,
        title,
        evidenceClass,
        extractConfidence,
        reviewer,
        ...(organization ? { organization } : {}),
        ...(Number.isInteger(publicationYear) ? { publicationYear } : {}),
        ...(url ? { url } : {}),
        ...(citationKey ? { citationKey } : {}),
        ...(notes ? { notes } : {}),
      }
    })
    .filter((item): item is ResearchSourceRef => Boolean(item))
}

export function normalizeResearchEnrichment(value: unknown): ResearchEnrichment | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>

  const evidenceSummary = cleanText(raw.evidenceSummary)
  const evidenceTierText = cleanText(raw.evidenceTier)
  const evidenceTier = EVIDENCE_TIERS.has(evidenceTierText as EvidenceTier)
    ? (evidenceTierText as EvidenceTier)
    : null
  const evidenceClassesPresent = Array.isArray(raw.evidenceClassesPresent)
    ? Array.from(
        new Set(raw.evidenceClassesPresent.map(item => asEvidenceClass(item)).filter(isNonNullable)),
      )
    : []

  const sourceRefs = asSourceRefs(raw.sourceRefs)
  const pageEvidenceJudgment = asEvidenceJudgment(raw.pageEvidenceJudgment)
  const topicEvidenceJudgments =
    raw.topicEvidenceJudgments && typeof raw.topicEvidenceJudgments === 'object'
      ? Object.fromEntries(
          Object.entries(raw.topicEvidenceJudgments as Record<string, unknown>)
            .map(([topicType, judgment]) => [topicType, asEvidenceJudgment(judgment)])
            .filter(([, judgment]) => Boolean(judgment)),
        )
      : {}
  const reviewedBy = cleanText(raw.reviewedBy)
  const lastReviewedAt = cleanText(raw.lastReviewedAt)
  const editorialReadinessRaw =
    raw.editorialReadiness && typeof raw.editorialReadiness === 'object'
      ? (raw.editorialReadiness as Record<string, unknown>)
      : null

  const editorialStatusText = cleanText(raw.editorialStatus)
  const editorialStatus = EDITORIAL_STATUSES.has(editorialStatusText as EditorialStatus)
    ? (editorialStatusText as EditorialStatus)
    : null

  if (!evidenceSummary || !evidenceTier || !reviewedBy || !lastReviewedAt || !editorialStatus) {
    return null
  }

  const relatedEntities = Array.isArray(raw.relatedEntities)
    ? raw.relatedEntities
        .map(item => {
          if (!item || typeof item !== 'object') return null
          const ref = item as Record<string, unknown>
          const entityType = cleanText(ref.entityType)
          const slug = cleanText(ref.slug)
          const relationshipType = cleanText(ref.relationshipType)
          const notes = cleanText(ref.notes)
          if ((entityType !== 'herb' && entityType !== 'compound') || !slug || !relationshipType) {
            return null
          }
          return {
            entityType: entityType as 'herb' | 'compound',
            slug,
            relationshipType,
            ...(notes ? { notes } : {}),
          }
        })
        .filter(isNonNullable)
    : []

  return {
    evidenceSummary,
    evidenceTier,
    evidenceClassesPresent,
    supportedUses: asClaims(raw.supportedUses),
    unsupportedOrUnclearUses: asClaims(raw.unsupportedOrUnclearUses),
    mechanisms: asClaims(raw.mechanisms),
    constituents: asClaims(raw.constituents),
    interactions: asClaims(raw.interactions),
    contraindications: asClaims(raw.contraindications),
    adverseEffects: asClaims(raw.adverseEffects),
    dosageContextNotes: asClaims(raw.dosageContextNotes),
    populationSpecificNotes: asClaims(raw.populationSpecificNotes),
    conflictNotes: asClaims(raw.conflictNotes),
    researchGaps: asClaims(raw.researchGaps),
    topicEvidenceJudgments,
    pageEvidenceJudgment: pageEvidenceJudgment ?? {
      evidenceLabel: 'insufficient_evidence',
      grading: {
        evidenceClass: evidenceClassesPresent,
        studyDesignWeight: 0,
        humanRelevance: 'none',
        directnessToClaim: 'indirect',
        replicationDepth: 0,
        sourceReliabilityTier: 'tier-d',
        recencyWeight: 0,
        editorialConfidence: 'low',
        conflictState: 'none',
        confidenceIndex: 0,
      },
      conflictNotes: [],
      uncertaintyNotes: ['Evidence grading not available in this dataset version.'],
      toneGuidance: 'State that evidence is insufficient and avoid efficacy implications.',
    },
    ...(editorialReadinessRaw &&
    typeof editorialReadinessRaw.publishable === 'boolean' &&
    typeof editorialReadinessRaw.hasConflictOrWeakEvidence === 'boolean' &&
    typeof editorialReadinessRaw.conflictLabelingPresent === 'boolean' &&
    typeof editorialReadinessRaw.weakEvidenceClaimsLabeled === 'boolean'
      ? {
          editorialReadiness: {
            publishable: editorialReadinessRaw.publishable,
            hasConflictOrWeakEvidence: editorialReadinessRaw.hasConflictOrWeakEvidence,
            conflictLabelingPresent: editorialReadinessRaw.conflictLabelingPresent,
            weakEvidenceClaimsLabeled: editorialReadinessRaw.weakEvidenceClaimsLabeled,
          },
        }
      : {}),
    sourceRefs,
    lastReviewedAt,
    reviewedBy,
    editorialStatus,
    ...(relatedEntities.length ? { relatedEntities } : {}),
  }
}
