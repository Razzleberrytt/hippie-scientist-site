import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import type { Herb } from '@/types'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getHerbSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'
import { hasInvalidEntityName, sanitizeHerbRecord } from '@/utils/sanitizeData'
import { normalizeResearchEnrichment } from '@/lib/researchEnrichment'
import type { PublishSafeEnrichmentSummary } from '@/types/enrichmentDiscovery'

type SourceRef = { title: string; url?: string; note?: string }
type ProductRecommendation = { label: string; type: string; url: string }

export type HerbSummary = {
  id: string
  slug: string
  name: string
  common: string
  scientific: string
  category: string
  class: string
  confidence: Herb['confidence']
  summaryShort: string
  description: string
  mechanism: string
  effects: string[]
  primaryEffects: string[]
  activeCompounds: string[]
  compounds: string[]
  interactionTags: string[]
  interactionNotes?: string[]
  interactions?: string[] | string
  contraindications?: string[] | string
  mechanismOfAction?: string
  safety?: string
  sideEffects?: string
  toxicity?: string
  tags?: string[]
  region?: string
  legalstatus?: string
  commonName?: string
  activeConstituents?: { name: string }[]
  sourceCount?: number
  hasInteractionData: boolean
  hasEvidenceNotes: boolean
  image: string
  aliases: string[]
  researchEnrichmentSummary?: PublishSafeEnrichmentSummary
  [key: string]: unknown
}

function normalizeEnrichmentSummary(value: unknown): PublishSafeEnrichmentSummary | undefined {
  if (!value || typeof value !== 'object') return undefined
  const summary = value as Record<string, unknown>
  const evidenceLabel = String(summary.evidenceLabel || '').trim()
  const evidenceLabelTitle = String(summary.evidenceLabelTitle || '').trim()
  const lastReviewedAt = String(summary.lastReviewedAt || '').trim()
  if (!evidenceLabel || !evidenceLabelTitle || !lastReviewedAt) return undefined

  return {
    evidenceLabel: evidenceLabel as PublishSafeEnrichmentSummary['evidenceLabel'],
    evidenceLabelTitle,
    hasHumanEvidence: Boolean(summary.hasHumanEvidence),
    safetyCautionsPresent: Boolean(summary.safetyCautionsPresent),
    supportedUseCoveragePresent: Boolean(summary.supportedUseCoveragePresent),
    mechanismOrConstituentCoveragePresent: Boolean(summary.mechanismOrConstituentCoveragePresent),
    traditionalUseOnly: Boolean(summary.traditionalUseOnly),
    conflictingEvidence: Boolean(summary.conflictingEvidence),
    enrichedAndReviewed: Boolean(summary.enrichedAndReviewed),
    lastReviewedAt,
  }
}

let herbSummariesPromise: Promise<HerbSummary[]> | null = null
const herbDetailPromiseBySlug = new Map<string, Promise<Herb | null>>()

function isPresent(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function mergeHerbSummaryRows(existing: HerbSummary, workbook: HerbSummary): HerbSummary {
  const merged: HerbSummary = { ...existing }
  for (const [key, value] of Object.entries(workbook)) {
    if (!isPresent(merged[key]) && isPresent(value)) {
      merged[key] = value
    }
  }
  return merged
}

function normalizeSlugCandidate(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

async function resolveHerbDetailSlug(slug: string): Promise<string | null> {
  const needle = normalizeSlugCandidate(slug)
  if (!needle) return null

  const summaries = await loadHerbSummaryData()
  const match = summaries.find(item => {
    const candidates = [
      item.slug,
      item.id,
      item.common,
      item.scientific,
      item.name,
      ...item.aliases,
    ]
    return candidates.some(candidate => normalizeSlugCandidate(candidate) === needle)
  })

  return match?.slug || null
}

function normalizeSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value
    .map((source): SourceRef | null => {
      if (typeof source === 'string') {
        const t = source.trim()
        return t ? { title: t, url: t } : null
      }
      if (source && typeof source === 'object') {
        const entry = source as Record<string, unknown>
        const title = String(entry.title || entry.url || '').trim()
        const url = String(entry.url || '').trim()
        const note = String(entry.note || '').trim()
        if (!title && !url) return null
        const normalized: SourceRef = { title: title || url }
        if (url) normalized.url = url
        if (note) normalized.note = note
        return normalized
      }
      return null
    })
    .filter((entry): entry is SourceRef => entry !== null)
}

function normalizeProductRecommendations(value: unknown): ProductRecommendation[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const rec = item as Record<string, unknown>
      const label = String(rec.label || '').trim()
      const type = String(rec.type || '')
        .trim()
        .toLowerCase()
      const url = String(rec.url || '').trim()
      if (!label || !type) return null
      return { label, type, url }
    })
    .filter((item): item is ProductRecommendation => item !== null)
    .slice(0, 2)
}

function normalizeHerbRow(raw: Record<string, unknown>): Herb {
  const { data } = sanitizeHerbRecord(raw, { debug: import.meta.env.DEV })
  const common = cleanText(data.common ?? data.commonName ?? data.name) || ''
  const scientific =
    cleanText(data.scientific ?? data.latin ?? data.latinName ?? data.scientificName) || ''
  const slug = String(data.slug || data.id || slugify(common || scientific || ''))
    .trim()
    .toLowerCase()

  const effects = splitClean(data.effects)
  const contraindications = splitClean(data.contraindications)
  const interactions = splitClean(data.interactions)
  const sideeffects = splitClean(data.sideEffects ?? data.sideeffects)
  const rawInteractionTags = splitClean(data.interactionTags)
  const rawInteractionNotes = splitClean(data.interactionNotes)
  const therapeuticUses = splitClean(data.therapeuticUses)
  const activeCompounds = splitClean(
    data.activeCompounds ?? data.active_compounds ?? data.compounds,
  )
  const sources = normalizeSources(data.sources)
  const researchEnrichment = normalizeResearchEnrichment(data.researchEnrichment)
  const productRecommendations = normalizeProductRecommendations(data.productRecommendations)
  const seededInteraction = getHerbSeedInteractionData(data)
  const mergedInteraction = mergeInteractionData({
    rawTags: rawInteractionTags,
    rawNotes: rawInteractionNotes,
    seed: seededInteraction,
  })

  const mechanism = cleanText(data.mechanism ?? data.mechanismOfAction) || ''
  const description = cleanText(data.description ?? data.summary) || ''
  const duration = cleanText(data.duration) || ''
  const dosage = cleanText(data.dosage) || ''
  const preparation = cleanText(data.preparation) || ''
  const legalStatus = cleanText(data.legalStatus ?? data.legalstatus) || ''
  const region = cleanText(data.region) || ''
  const category = cleanText(data.class ?? data.category) || ''
  const intensity = cleanText(data.intensity) || ''
  const relatedEntities = splitClean(data.relatedEntities)
  const relatedCompounds = splitClean(data.relatedCompounds)
  const identity = cleanText(data.identity) || ''
  const categoryUseContext = cleanText(data.categoryUseContext ?? data.category_use_context) || ''
  const evidenceLevel = cleanText(data.evidenceLevel ?? data.evidence_level) || ''

  return {
    ...(data as Herb),
    id: String(data.id || slug),
    slug,
    name: common || scientific,
    common,
    scientific,
    description,
    category,
    class: cleanText(data.class) || '',
    intensity,
    region,
    mechanism,
    effects,
    therapeuticUses,
    contraindications,
    interactions,
    interactionTags: mergedInteraction.interactionTags,
    interactionNotes: mergedInteraction.interactionNotes,
    dosage,
    duration,
    preparation,
    sideeffects,
    activeCompounds,
    compounds: activeCompounds,
    active_compounds: activeCompounds,
    legalStatus,
    identity,
    categoryUseContext,
    evidenceLevel,
    relatedEntities,
    relatedCompounds,
    sources,
    researchEnrichment: researchEnrichment || undefined,
    productRecommendations,
    confidence: calculateHerbConfidence({ mechanism, effects, compounds: activeCompounds }),
  }
}

function normalizeHerbSummaryRow(raw: Record<string, unknown>): HerbSummary {
  const slug = String(raw.slug || '')
    .trim()
    .toLowerCase()
  const common = cleanText(raw.common ?? raw.commonName ?? raw.name) || ''
  const scientific = cleanText(raw.scientific ?? raw.latin ?? raw.scientificName) || ''
  const effects = splitClean(raw.effects)
  const activeCompounds = splitClean(raw.activeCompounds ?? raw.compounds)
  const confidence = String(raw.confidence || '').toLowerCase()
  const confidenceLevel: Herb['confidence'] =
    confidence === 'high' || confidence === 'medium' ? confidence : 'low'

  return {
    id: String(raw.id || slug),
    slug,
    name: common || scientific || slug,
    common,
    scientific,
    category: cleanText(raw.category) || '',
    class: cleanText(raw.class) || '',
    confidence: confidenceLevel,
    summaryShort: cleanText(raw.summaryShort ?? raw.description) || '',
    description: cleanText(raw.description ?? raw.summaryShort) || '',
    mechanism: cleanText(raw.mechanism) || '',
    effects,
    primaryEffects: splitClean(raw.primaryEffects ?? effects).slice(0, 4),
    activeCompounds,
    compounds: activeCompounds,
    interactionTags: splitClean(raw.interactionTags),
    interactionNotes: splitClean(raw.interactionNotes),
    interactions: splitClean(raw.interactions),
    contraindications: splitClean(raw.contraindications),
    mechanismOfAction: cleanText(raw.mechanismOfAction) || '',
    safety: cleanText(raw.safety) || '',
    sideEffects: cleanText(raw.sideEffects) || '',
    toxicity: cleanText(raw.toxicity) || '',
    tags: splitClean(raw.tags),
    region: cleanText(raw.region) || '',
    legalstatus: cleanText(raw.legalstatus) || '',
    commonName: cleanText(raw.commonName) || '',
    activeConstituents: Array.isArray(raw.activeConstituents)
      ? raw.activeConstituents
          .map(entry =>
            entry && typeof entry === 'object' && 'name' in entry
              ? { name: cleanText((entry as { name?: unknown }).name) }
              : null,
          )
          .filter((entry): entry is { name: string } => Boolean(entry?.name))
      : undefined,
    sourceCount: Number.isFinite(Number(raw.sourceCount)) ? Number(raw.sourceCount) : undefined,
    hasInteractionData: Boolean(raw.hasInteractionData),
    hasEvidenceNotes: Boolean(raw.hasEvidenceNotes),
    image: cleanText(raw.image) || '',
    aliases: splitClean(raw.aliases),
    researchEnrichmentSummary: normalizeEnrichmentSummary(raw.researchEnrichmentSummary),
  }
}

export function isRenderableHerbRow(raw: Record<string, unknown>): boolean {
  const { data } = sanitizeHerbRecord(raw)
  return !hasInvalidEntityName(data)
}

export async function loadHerbSummaryData(): Promise<HerbSummary[]> {
  if (!herbSummariesPromise) {
    herbSummariesPromise = Promise.all([
      fetch('/data/herbs-summary.json', { cache: 'no-store' }).then(response => {
        if (!response.ok) throw new Error('Failed to load /data/herbs-summary.json')
        return response.json()
      }),
      fetch('/data/workbook-herbs.json', { cache: 'no-store' })
        .then(response => {
          if (!response.ok) throw new Error('Failed to load /data/workbook-herbs.json')
          return response.json()
        })
        .catch(() => []),
    ])
      .then(([summaryPayload, workbookPayload]) => {
        const summaryRows = Array.isArray(summaryPayload) ? summaryPayload : []
        const workbookRows = Array.isArray(workbookPayload) ? workbookPayload : []
        const mergedBySlug = new Map<string, HerbSummary>()

        summaryRows
          .map(row => normalizeHerbSummaryRow(row as Record<string, unknown>))
          .forEach(row => {
            if (!row.slug) return
            mergedBySlug.set(row.slug, row)
          })

        workbookRows
          .map(row => normalizeHerbSummaryRow(row as Record<string, unknown>))
          .forEach(row => {
            if (!row.slug) return
            const existing = mergedBySlug.get(row.slug)
            mergedBySlug.set(row.slug, existing ? mergeHerbSummaryRows(existing, row) : row)
          })

        return Array.from(mergedBySlug.values())
      })
      .catch(error => {
        herbSummariesPromise = null
        throw error
      })
  }

  return herbSummariesPromise
}

export async function loadHerbDetailBySlug(slug: string): Promise<Herb | null> {
  const slugKey = slug.trim().toLowerCase()
  if (!slugKey) return null

  const cached = herbDetailPromiseBySlug.get(slugKey)
  if (cached) return cached

  const request = fetch(`/data/herbs-detail/${encodeURIComponent(slugKey)}.json`, {
    cache: 'no-store',
  })
    .then(async response => {
      if (response.status === 404) {
        const resolvedSlug = await resolveHerbDetailSlug(slugKey)
        if (!resolvedSlug || resolvedSlug === slugKey) return null
        const fallbackResponse = await fetch(
          `/data/herbs-detail/${encodeURIComponent(resolvedSlug)}.json`,
          {
            cache: 'no-store',
          },
        )
        if (fallbackResponse.status === 404) return null
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to load /data/herbs-detail/${resolvedSlug}.json`)
        }
        return fallbackResponse.json()
      }
      if (!response.ok) {
        throw new Error(`Failed to load /data/herbs-detail/${slugKey}.json`)
      }
      return response.json()
    })
    .then(payload => {
      if (!payload || typeof payload !== 'object') return null
      return normalizeHerbRow(payload as Record<string, unknown>)
    })
    .catch(error => {
      herbDetailPromiseBySlug.delete(slugKey)
      throw error
    })

  herbDetailPromiseBySlug.set(slugKey, request)
  return request
}

// Back-compat aliases.
export async function loadHerbData(): Promise<HerbSummary[]> {
  return loadHerbSummaryData()
}

export function useHerbData() {
  const { herbs } = useHerbDataState()
  return herbs
}

export function useHerbDataState() {
  const [herbs, setHerbs] = useState<HerbSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadHerbSummaryData()
      .then(items => {
        if (!alive) return
        setHerbs(items)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setHerbs([])
        setError(cause instanceof Error ? cause : new Error('Failed to load herb summary data'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return { herbs, isLoading, error }
}

export function useHerbDetailState(slug: string) {
  const [herb, setHerb] = useState<Herb | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadHerbDetailBySlug(slug)
      .then(item => {
        if (!alive) return
        setHerb(item)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setHerb(null)
        setError(cause instanceof Error ? cause : new Error('Failed to load herb detail'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [slug])

  return { herb, isLoading, error }
}
