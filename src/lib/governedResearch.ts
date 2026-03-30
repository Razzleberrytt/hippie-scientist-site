import rollupPreview from '../../ops/reports/enrichment-rollup-preview.json'
import sourceRegistry from '../../public/data/source-registry.json'
import type {
  EvidenceJudgment,
  EvidenceLabel,
  EditorialStatus,
  ResearchEnrichment,
  ResearchSourceRef,
} from '@/types/researchEnrichment'

export type GovernedEntityType = 'herb' | 'compound'

type RollupEntry = {
  entityType: GovernedEntityType
  entitySlug: string
  researchEnrichment: Omit<ResearchEnrichment, 'sourceRefs'> & {
    sourceRegistryIds?: string[]
  }
}

type SourceRegistryEntry = {
  sourceId: string
  sourceType: string
  sourceClass: string
  title: string
  publicationYear?: number
  canonicalUrl?: string
  citationText?: string
  evidenceClass?: ResearchSourceRef['evidenceClass']
  reviewer?: string
  active?: boolean
}

const PUBLISHABLE_EDITORIAL_STATUSES = new Set<EditorialStatus>(['approved', 'published'])

const EVIDENCE_LABEL_META: Record<EvidenceLabel, { title: string; tone: string; className: string }> = {
  stronger_human_support: {
    title: 'Stronger human support',
    tone: 'Human clinical evidence is stronger, but still not universal for every outcome.',
    className: 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100',
  },
  limited_human_support: {
    title: 'Limited human support',
    tone: 'Some human evidence exists, but effect certainty remains limited.',
    className: 'border-cyan-300/40 bg-cyan-500/10 text-cyan-100',
  },
  observational_only: {
    title: 'Observational only',
    tone: 'Findings are observational and do not establish causality on their own.',
    className: 'border-sky-300/40 bg-sky-500/10 text-sky-100',
  },
  preclinical_only: {
    title: 'Preclinical only',
    tone: 'Evidence is preclinical and should not be interpreted as proven clinical efficacy.',
    className: 'border-violet-300/40 bg-violet-500/10 text-violet-100',
  },
  traditional_use_only: {
    title: 'Traditional use only',
    tone: 'Use context is traditional; modern clinical confirmation is limited.',
    className: 'border-amber-300/40 bg-amber-500/10 text-amber-100',
  },
  mixed_or_uncertain: {
    title: 'Mixed or uncertain',
    tone: 'Signals are mixed and should be read with uncertainty.',
    className: 'border-yellow-300/40 bg-yellow-500/10 text-yellow-100',
  },
  conflicting_evidence: {
    title: 'Conflicting evidence',
    tone: 'Evidence conflicts across sources or contexts.',
    className: 'border-rose-300/40 bg-rose-500/10 text-rose-100',
  },
  insufficient_evidence: {
    title: 'Insufficient evidence',
    tone: 'Current evidence is insufficient for reliable efficacy conclusions.',
    className: 'border-white/25 bg-white/5 text-white/85',
  },
}

const sourceRegistryById = new Map(
  (sourceRegistry as SourceRegistryEntry[]).map(entry => [entry.sourceId, entry]),
)

function toSourceType(sourceType: string): ResearchSourceRef['sourceType'] {
  if (sourceType.includes('regulatory')) return 'regulatory'
  if (sourceType.includes('traditional')) return 'traditional-text'
  if (sourceType.includes('monograph')) return 'monograph'
  if (sourceType.includes('observational')) return 'observational'
  if (sourceType.includes('preclinical')) return 'preclinical'
  if (sourceType.includes('review')) return 'systematic-review'
  if (sourceType.includes('trial') || sourceType.includes('journal')) return 'rct'
  return 'other'
}

function toSourceRefs(sourceIds: string[] | undefined): ResearchSourceRef[] {
  if (!Array.isArray(sourceIds)) return []
  return sourceIds
    .map(sourceId => {
      const source = sourceRegistryById.get(sourceId)
      if (!source?.active || !source.title || !source.evidenceClass) return null
      return {
        sourceId,
        sourceType: toSourceType(source.sourceClass || source.sourceType || ''),
        title: source.title,
        evidenceClass: source.evidenceClass,
        reviewer: source.reviewer || 'editorial-team',
        extractConfidence: 'high' as const,
        ...(source.publicationYear ? { publicationYear: source.publicationYear } : {}),
        ...(source.canonicalUrl ? { url: source.canonicalUrl } : {}),
        ...(source.citationText ? { notes: source.citationText } : {}),
      }
    })
    .filter((source): source is ResearchSourceRef => Boolean(source))
}

export function isPublishableGovernedEnrichment(enrichment: ResearchEnrichment | null | undefined) {
  if (!enrichment) return false
  if (!PUBLISHABLE_EDITORIAL_STATUSES.has(enrichment.editorialStatus)) return false
  if (!enrichment.editorialReadiness?.publishable) return false
  return true
}

const rollupMap = new Map(
  (rollupPreview as RollupEntry[]).map(entry => {
    const researchEnrichment = {
      ...entry.researchEnrichment,
      sourceRefs: toSourceRefs(entry.researchEnrichment.sourceRegistryIds),
    } as ResearchEnrichment
    return [`${entry.entityType}:${entry.entitySlug}`, researchEnrichment]
  }),
)

export function getGovernedResearchEnrichment(entityType: GovernedEntityType, entitySlug: string) {
  const enrichment = rollupMap.get(`${entityType}:${entitySlug}`)
  return isPublishableGovernedEnrichment(enrichment) ? enrichment : null
}

export function getEvidenceLabelMeta(label: EvidenceLabel) {
  return EVIDENCE_LABEL_META[label]
}

export function getTopicJudgment(enrichment: ResearchEnrichment, topicType: string): EvidenceJudgment {
  return enrichment.topicEvidenceJudgments[topicType] || enrichment.pageEvidenceJudgment
}
