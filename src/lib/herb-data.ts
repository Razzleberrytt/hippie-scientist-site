// UPDATED: Added safety note normalization for clean deduplicated herb safety arrays.
import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import type { Herb } from '@/types'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getHerbSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'
import { hasInvalidEntityName, sanitizeHerbRecord } from '@/utils/sanitizeData'
import { normalizeResearchEnrichment } from '@/lib/researchEnrichment'
import { getCuratedData, type CuratedData } from '@/lib/semanticCompression'
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
  primaryActions: string[]
  mechanisms: string[]
  activeCompounds: string[]
  safetyNotes?: string
  traditionalUses?: string[]
  evidenceLevel?: string
  relatedHerbs?: string[]
  interactionTags: string[]
  interactionNotes?: string[]
  interactions?: string[] | string
  contraindications?: string[] | string
  relatedCompounds?: string[]
  mechanism?: string
  effects?: string[]
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
  curatedData: CuratedData
  rawData?: Record<string, unknown>
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
let canonicalHerbSummariesPromise: Promise<HerbSummary[]> | null = null
const herbDetailPromiseBySlug = new Map<string, Promise<Herb | null>>()

function normalizeSlugCandidate(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function loadCanonicalHerbSummaryRows(): Promise<HerbSummary[]> {
  if (!canonicalHerbSummariesPromise) {
    canonicalHerbSummariesPromise = fetch('/data/herbs-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/herbs-summary.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeHerbSummaryRow(row as Record<string, unknown>))
      })
      .catch(error => {
        canonicalHerbSummariesPromise = null
        throw error
      })
  }

  return canonicalHerbSummariesPromise
}

async function resolveCanonicalHerbDetailSlug(slug: string): Promise<string | null> {
  const needle = normalizeSlugCandidate(slug)
  if (!needle) return null

  const summaries = await loadCanonicalHerbSummaryRows()
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


function normalizeSafetyNotes(...values: unknown[]): string[] {
  const seen = new Set<string>()
  const notes: string[] = []

  values
    .flatMap(value => splitClean(value))
    .map(value => value.replace(/\s+/g, ' ').trim())
    .filter(value => value.length >= 5)
    .forEach(value => {
      const key = value.toLowerCase()
      if (!key || seen.has(key)) return
      seen.add(key)
      notes.push(value)
    })

  return notes
}

function normalizeMechanisms(...values: unknown[]): string[] {
  const mechanisms = values.flatMap(value => splitClean(value))
  if (mechanisms.length > 0) return mechanisms
  return []
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
  const common = cleanText(data.name) || ''
  const scientific = cleanText(data.scientificName) || ''
  const slug = String(data.slug || data.id || slugify(common || scientific || ''))
    .trim()
    .toLowerCase()

  const primaryActions = splitClean(data.primaryActions ?? data.effects)
  const contraindications = splitClean(data.contraindications)
  const interactions = splitClean(data.interactions)
  const sideeffects = splitClean(data.sideEffects)
  const safetyNotes = normalizeSafetyNotes(
    data.safetyNotes,
    data.contraindications,
    data.interactions,
    data.sideEffects,
  )
  const rawInteractionTags = splitClean(data.interactionTags)
  const rawInteractionNotes = splitClean(data.interactionNotes)
  const traditionalUses = splitClean(data.traditionalUses)
  const activeCompounds = splitClean(data.activeCompounds)
  const sources = normalizeSources(data.sources)
  const researchEnrichment = normalizeResearchEnrichment(data.researchEnrichment)
  const productRecommendations = normalizeProductRecommendations(data.productRecommendations)
  const seededInteraction = getHerbSeedInteractionData(data)
  const mergedInteraction = mergeInteractionData({
    rawTags: rawInteractionTags,
    rawNotes: rawInteractionNotes,
    seed: seededInteraction,
  })

  const mechanisms = normalizeMechanisms(
    data.mechanisms,
    data.mechanism,
  )
  const mechanism = mechanisms.join('; ')
  const description = cleanText(data.description ?? data.summary) || ''
  const duration = cleanText(data.duration) || ''
  const dosage = cleanText(data.dosage) || ''
  const preparation = cleanText(data.preparation) || ''
  const legalStatus = cleanText(data.legalStatus) || ''
  const region = cleanText(data.region) || ''
  const category = cleanText(data.category) || ''
  const intensity = cleanText(data.intensity) || ''
  const relatedEntities = splitClean(data.relatedEntities)
  const relatedCompounds = splitClean(data.relatedCompounds)
  const relatedHerbs = splitClean(data.relatedHerbs).concat(
    relatedEntities
      .filter(entry => entry.toLowerCase().startsWith('herb:'))
      .map(entry => entry.split(':')[1] || '')
      .filter(Boolean),
  )
  const identity = cleanText(data.identity) || ''
  const categoryUseContext = cleanText(data.categoryUseContext) || ''
  const evidenceLevel = cleanText(data.evidenceLevel) || ''
  const benefits = splitClean(data.benefits ?? data.effects)

  return {
    ...(data as Herb),
    id: String(data.id || slug),
    slug,
    name: common || scientific,
    common,
    scientific,
    description,
    category,
    class: '',
    intensity,
    region,
    primaryActions,
    mechanisms,
    mechanism,
    effects: primaryActions,
    benefits,
    traditionalUses,
    contraindications,
    interactions,
    safetyNotes,
    interactionTags: mergedInteraction.interactionTags,
    interactionNotes: mergedInteraction.interactionNotes,
    dosage,
    duration,
    preparation,
    sideeffects,
    activeCompounds,
    legalStatus,
    identity,
    categoryUseContext,
    evidenceLevel,
    relatedEntities,
    relatedHerbs,
    relatedCompounds,
    sources,
    researchEnrichment: researchEnrichment || undefined,
    productRecommendations,
    confidence: calculateHerbConfidence({ mechanism, effects: primaryActions, compounds: activeCompounds }),
    curatedData: getCuratedData({
      name: common || scientific || slug,
      summary: description,
      description,
      whyItMatters: cleanText(data.whyItMatters) || description,
      primaryEffects: splitClean(data.primaryEffects ?? primaryActions),
      effects: primaryActions,
      contraindications,
      interactions,
      sideEffects: sideeffects,
      safetyNotes,
      mechanism,
    }),
    rawData: data as Record<string, unknown>,
  }
}

function normalizeHerbSummaryRow(raw: Record<string, unknown>): HerbSummary {
  const slug = String(raw.slug || '')
    .trim()
    .toLowerCase()
  const common = cleanText(raw.name) || ''
  const scientific = cleanText(raw.scientificName) || ''
  const primaryActions = splitClean(raw.primaryActions ?? raw.effects)
  const mechanisms = normalizeMechanisms(raw.mechanisms, raw.mechanism)
  const activeCompounds = splitClean(raw.activeCompounds)
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
    class: '',
    confidence: confidenceLevel,
    summaryShort: cleanText(raw.summaryShort ?? raw.description ?? raw.summary) || '',
    description: cleanText(raw.description ?? raw.summaryShort ?? raw.summary) || '',
    primaryActions,
    mechanisms,
    mechanism: cleanText(raw.mechanism ?? mechanisms.join('; ')) || '',
    effects: primaryActions,
    activeCompounds,
    safetyNotes: cleanText(raw.safetyNotes) || '',
    traditionalUses: splitClean(raw.traditionalUses),
    evidenceLevel: cleanText(raw.evidenceLevel ?? raw.confidence) || '',
    relatedHerbs: splitClean(raw.relatedHerbs),
    interactionTags: splitClean(raw.interactionTags),
    interactionNotes: splitClean(raw.interactionNotes),
    interactions: splitClean(raw.interactions),
    contraindications: splitClean(raw.contraindications),
    safety: cleanText(raw.safety) || '',
    sideEffects: cleanText(raw.sideEffects) || '',
    toxicity: cleanText(raw.toxicity) || '',
    tags: splitClean(raw.tags),
    region: cleanText(raw.region) || '',
    sourceCount: Number.isFinite(Number(raw.sourceCount)) ? Number(raw.sourceCount) : undefined,
    hasInteractionData: Boolean(raw.hasInteractionData),
    hasEvidenceNotes: Boolean(raw.hasEvidenceNotes),
    image: cleanText(raw.image) || '',
    aliases: splitClean(raw.aliases),
    researchEnrichmentSummary: normalizeEnrichmentSummary(raw.researchEnrichmentSummary),
    curatedData: getCuratedData(raw),
    rawData: raw,
  }
}

export function isRenderableHerbRow(raw: Record<string, unknown>): boolean {
  const { data } = sanitizeHerbRecord(raw)
  return !hasInvalidEntityName(data)
}

export async function loadHerbSummaryData(): Promise<HerbSummary[]> {
  if (!herbSummariesPromise) {
    herbSummariesPromise = fetch('/data/herbs-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/herbs-summary.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeHerbSummaryRow(row as Record<string, unknown>)).filter(row => Boolean(row.slug))
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

  const request = resolveCanonicalHerbDetailSlug(slugKey)
    .then(async resolvedCanonicalSlug => {
      if (!resolvedCanonicalSlug) return null
      const canonicalResponse = await fetch(
        `/data/herbs-detail/${encodeURIComponent(resolvedCanonicalSlug)}.json`,
        { cache: 'no-store' },
      )
      if (canonicalResponse.ok) {
        return canonicalResponse.json()
      }
      if (canonicalResponse.status === 404) return null
      throw new Error(`Failed to load /data/herbs-detail/${resolvedCanonicalSlug}.json`)
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
