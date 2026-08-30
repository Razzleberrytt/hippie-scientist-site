// UPDATED: Added safety note normalization for clean deduplicated herb safety arrays.
import { useEffect, useState } from 'react'
import type { Herb } from '../types'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from './sanitize'
import { getHerbSeedInteractionData, mergeInteractionData } from './interactionSeed'
import { hasInvalidEntityName, sanitizeHerbRecord } from '@/utils/sanitizeData'
import { normalizeResearchEnrichment } from './researchEnrichment'
import { getCuratedData, type CuratedData } from './semanticCompression'
import type { PublishSafeEnrichmentSummary } from '@/types/enrichmentDiscovery'
import { safeArray, safeLower, safeNumber, safeObject, safeRelatedList, safeSlug, safeTrim } from '@/lib/search-safe'

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

function uniqueValues(values: unknown[]): string[] {
  const seen = new Set<string>()

  return values
    .flatMap(value => splitClean(value))
    .map(safeTrim)
    .filter(Boolean)
    .filter(value => {
      const key = safeLower(value)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function normalizeEnrichmentSummary(value: unknown): PublishSafeEnrichmentSummary | undefined {
  const summary = safeObject(value)
  const evidenceLabel = safeTrim(summary.evidenceLabel)
  const evidenceLabelTitle = safeTrim(summary.evidenceLabelTitle)
  const lastReviewedAt = safeTrim(summary.lastReviewedAt)
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

function normalizeSlugCandidate(value: unknown): string {
  return safeSlug(value).replace(/\band\b/g, '').replace(/-/g, '')
}

function normalizeHerbSummaryRows(payload: unknown): HerbSummary[] {
  const seen = new Set<string>()

  return safeArray(payload)
    .map(row => normalizeHerbSummaryRow(safeObject(row)))
    .filter(row => Boolean(row.slug))
    .filter(row => {
      const key = safeSlug(row.slug)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => safeLower(a.name).localeCompare(safeLower(b.name)))
}

function loadCanonicalHerbSummaryRows(): Promise<HerbSummary[]> {
  if (!canonicalHerbSummariesPromise) {
    canonicalHerbSummariesPromise = fetch('/data/herbs-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/herbs-summary.json')
        return response.json()
      })
      .then(payload => normalizeHerbSummaryRows(payload))
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
      ...safeArray(item.aliases),
    ]
    return candidates.some(candidate => normalizeSlugCandidate(candidate) === needle)
  })

  return safeSlug(match?.slug) || null
}

function normalizeSources(value: unknown): SourceRef[] {
  return safeArray(value)
    .map((source): SourceRef | null => {
      if (typeof source === 'string') {
        const t = safeTrim(source)
        return t ? { title: t, url: t } : null
      }

      const entry = safeObject(source)
      const title = safeTrim(entry.title || entry.url)
      const url = safeTrim(entry.url)
      const note = safeTrim(entry.note)
      if (!title && !url) return null
      const normalized: SourceRef = { title: title || url }
      if (url) normalized.url = url
      if (note) normalized.note = note
      return normalized
    })
    .filter((entry): entry is SourceRef => entry !== null)
}

function normalizeSafetyNotes(...values: unknown[]): string[] {
  return uniqueValues(values).filter(value => value.length >= 5)
}

function normalizeMechanisms(...values: unknown[]): string[] {
  return uniqueValues(values)
}

function normalizeProductRecommendations(value: unknown): ProductRecommendation[] {
  return safeArray(value)
    .map(item => {
      const rec = safeObject(item)
      const label = safeTrim(rec.label)
      const type = safeLower(rec.type)
      const url = safeTrim(rec.url)
      if (!label || !type) return null
      return { label, type, url }
    })
    .filter((item): item is ProductRecommendation => item !== null)
    .slice(0, 2)
}

function normalizeHerbRow(raw: Record<string, unknown>): Herb | null {
  const { data } = sanitizeHerbRecord(raw, { debug: process.env.NODE_ENV !== 'production' })
  if (hasInvalidEntityName(data)) return null

  const common = cleanText(data.name) || ''
  const scientific = cleanText(data.scientificName) || ''
  const slug = safeSlug(data.slug || data.id || common || scientific)
  if (!slug) return null

  const primaryActions = uniqueValues([
    data.primaryActions,
    data.effects,
    data.actions,
    data.benefits,
  ])
  const contraindications = uniqueValues([data.contraindications])
  const interactions = uniqueValues([data.interactions])
  const sideeffects = uniqueValues([data.sideEffects])
  const safetyNotes = normalizeSafetyNotes(
    data.safetyNotes,
    data.contraindications,
    data.interactions,
    data.sideEffects,
  )
  const rawInteractionTags = uniqueValues([data.interactionTags])
  const rawInteractionNotes = uniqueValues([data.interactionNotes])
  const traditionalUses = uniqueValues([data.traditionalUses, data.traditionalUse])
  const activeCompounds = uniqueValues([data.activeCompounds])
  const sources = normalizeSources(data.sources)
  const researchEnrichment = normalizeResearchEnrichment(data.researchEnrichment)
  const productRecommendations = normalizeProductRecommendations(data.productRecommendations)
  const seededInteraction = getHerbSeedInteractionData(data)
  const mergedInteraction = mergeInteractionData({
    rawTags: rawInteractionTags,
    rawNotes: rawInteractionNotes,
    seed: seededInteraction,
  })

  const mechanisms = normalizeMechanisms(data.mechanisms, data.mechanism, data.mechanismOfAction)
  const mechanism = mechanisms.join('; ')
  const description = cleanText(data.description ?? data.summary) || ''
  const duration = cleanText(data.duration) || ''
  const dosage = cleanText(data.dosage) || ''
  const preparation = cleanText(data.preparation) || ''
  const legalStatus = cleanText(data.legalStatus) || ''
  const region = cleanText(data.region) || ''
  const category = cleanText(data.category) || ''
  const intensity = cleanText(data.intensity) || ''
  const relatedEntities = uniqueValues([data.relatedEntities])
  const relatedCompounds = safeRelatedList(data.relatedCompounds)
  const entityRelatedHerbs = relatedEntities
    .filter(entry => safeLower(entry).startsWith('herb:'))
    .map(entry => safeTrim(entry).split(':')[1] || '')
    .filter(Boolean)
  const relatedHerbs = safeRelatedList([data.relatedHerbs, entityRelatedHerbs])
  const identity = cleanText(data.identity) || ''
  const categoryUseContext = cleanText(data.categoryUseContext) || ''
  const evidenceLevel = cleanText(data.evidenceLevel) || ''
  const benefits = uniqueValues([data.benefits, data.effects])

  return {
    ...(data as Herb),
    id: safeTrim(data.id) || slug,
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
    benefits: benefits.join('; '),
    traditionalUses,
    contraindications,
    interactions,
    safetyNotes,
    interactionTags: safeArray(mergedInteraction.interactionTags).map(safeTrim).filter(Boolean),
    interactionNotes: safeArray(mergedInteraction.interactionNotes).map(safeTrim).filter(Boolean),
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
      primaryEffects: uniqueValues([data.primaryEffects, primaryActions]),
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
  const common = cleanText(raw.name) || ''
  const scientific = cleanText(raw.scientificName) || ''
  const slug = safeSlug(raw.slug || raw.id || common || scientific)
  const primaryActions = uniqueValues([raw.primaryActions, raw.effects])
  const mechanisms = normalizeMechanisms(raw.mechanisms, raw.mechanism)
  const activeCompounds = uniqueValues([raw.activeCompounds])
  const confidence = safeLower(raw.confidence)
  const confidenceLevel: Herb['confidence'] =
    confidence === 'high' || confidence === 'medium' ? confidence : 'low'

  return {
    id: safeTrim(raw.id) || slug,
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
    traditionalUses: uniqueValues([raw.traditionalUses]),
    evidenceLevel: cleanText(raw.evidenceLevel ?? raw.confidence) || '',
    relatedHerbs: safeRelatedList(raw.relatedHerbs),
    interactionTags: uniqueValues([raw.interactionTags]),
    interactionNotes: uniqueValues([raw.interactionNotes]),
    interactions: uniqueValues([raw.interactions]),
    contraindications: uniqueValues([raw.contraindications]),
    safety: cleanText(raw.safety) || '',
    sideEffects: cleanText(raw.sideEffects) || '',
    toxicity: cleanText(raw.toxicity) || '',
    tags: uniqueValues([raw.tags]),
    region: cleanText(raw.region) || '',
    sourceCount: Number.isFinite(safeNumber(raw.sourceCount, Number.NaN)) ? safeNumber(raw.sourceCount) : undefined,
    hasInteractionData: Boolean(raw.hasInteractionData),
    hasEvidenceNotes: Boolean(raw.hasEvidenceNotes),
    image: cleanText(raw.image) || '',
    aliases: uniqueValues([raw.aliases]),
    researchEnrichmentSummary: normalizeEnrichmentSummary(raw.researchEnrichmentSummary),
    curatedData: getCuratedData(raw),
    rawData: raw,
  }
}

export function isRenderableHerbRow(raw: Record<string, unknown>): boolean {
  const { data } = sanitizeHerbRecord(raw)
  return !hasInvalidEntityName(data) && Boolean(safeSlug(data.slug || data.id || data.name || data.scientificName))
}

export async function loadHerbSummaryData(): Promise<HerbSummary[]> {
  if (!herbSummariesPromise) {
    herbSummariesPromise = fetch('/data/herbs-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/herbs-summary.json')
        return response.json()
      })
      .then(payload => normalizeHerbSummaryRows(payload))
      .catch(error => {
        herbSummariesPromise = null
        throw error
      })
  }

  return herbSummariesPromise
}

export async function loadHerbDetailBySlug(slug: string): Promise<Herb | null> {
  const slugKey = safeSlug(slug)
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
