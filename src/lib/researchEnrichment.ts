import { cleanText } from '@/lib/sanitize'
import type {
  EditorialStatus,
  EvidenceClass,
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
  'in-review',
  'approved',
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
      if (!claim || !evidenceClass || sourceRefIds.length === 0) return null
      return {
        claim,
        evidenceClass,
        sourceRefIds: Array.from(new Set(sourceRefIds)),
        ...(strengthNote ? { strengthNote } : {}),
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
        new Set(raw.evidenceClassesPresent.map(item => asEvidenceClass(item)).filter(Boolean)),
      )
    : []

  const sourceRefs = asSourceRefs(raw.sourceRefs)
  const reviewedBy = cleanText(raw.reviewedBy)
  const lastReviewedAt = cleanText(raw.lastReviewedAt)

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
            entityType,
            slug,
            relationshipType,
            ...(notes ? { notes } : {}),
          }
        })
        .filter(Boolean)
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
    sourceRefs,
    lastReviewedAt,
    reviewedBy,
    editorialStatus,
    ...(relatedEntities.length ? { relatedEntities } : {}),
  }
}
