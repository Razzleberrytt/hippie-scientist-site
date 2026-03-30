import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getCompoundSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'
import { hasInvalidEntityName, sanitizeCompoundRecord } from '@/utils/sanitizeData'
import { normalizeResearchEnrichment } from '@/lib/researchEnrichment'

export type SourceRef = { title: string; url: string; note?: string }

export type CompoundRecord = {
  id: string
  slug: string
  name: string
  description: string
  className: string
  category: string
  intensity: string
  mechanism: string
  activeCompounds: string[]
  effects: string[]
  therapeuticUses: string[]
  contraindications: string[]
  interactions: string[]
  dosage: string
  duration: string
  region: string
  preparation: string
  legalStatus: string
  sideEffects: string[]
  interactionTags?: string[]
  interactionNotes?: string[]
  herbs: string[]
  sources: SourceRef[]
  lastUpdated: string
  confidence: ConfidenceLevel
}

export type CompoundSummaryRecord = {
  id: string
  slug: string
  name: string
  summaryShort: string
  description: string
  className: string
  category: string
  mechanism: string
  effects: string[]
  primaryEffects: string[]
  herbs: string[]
  confidence: ConfidenceLevel
  hasInteractionData: boolean
  hasEvidenceNotes: boolean
  aliases: string[]
}

let compoundsSummaryPromise: Promise<CompoundSummaryRecord[]> | null = null
const compoundDetailPromiseBySlug = new Map<string, Promise<CompoundRecord | null>>()

function normalizeSlugCandidate(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

async function resolveCompoundDetailSlug(slug: string): Promise<string | null> {
  const needle = normalizeSlugCandidate(slug)
  if (!needle) return null

  const summaries = await loadCompoundSummaryData()
  const match = summaries.find(item => {
    const candidates = [item.slug, item.id, item.name, ...item.aliases]
    return candidates.some(candidate => normalizeSlugCandidate(candidate) === needle)
  })

  return match?.slug || null
}

function normalizeSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value
    .map(source => {
      if (typeof source === 'string') {
        const t = source.trim()
        return t ? { title: t, url: t } : null
      }
      if (!source || typeof source !== 'object') return null
      const ref = source as Record<string, unknown>
      const title = String(ref.title || ref.url || '').trim()
      const url = String(ref.url || '').trim()
      if (!title && !url) return null
      const note = String(ref.note || '').trim()
      return { title: title || url, url: url || title, note: note || undefined }
    })
    .filter((item): item is SourceRef => Boolean(item))
}

function normalizeCompound(raw: Record<string, unknown>): CompoundRecord {
  const { data } = sanitizeCompoundRecord(raw, { debug: import.meta.env.DEV })
  const name = cleanText(data.name ?? data.commonName ?? data.id) || ''
  const slug = String(data.slug || slugify(name))
  const effects = splitClean(data.effects)
  const herbs = splitClean(data.associatedHerbs ?? data.foundInHerbs ?? data.herbs ?? data.foundIn)
  const mechanism = cleanText(data.mechanism ?? data.mechanismOfAction) || ''
  const researchEnrichment = normalizeResearchEnrichment(data.researchEnrichment)
  const rawInteractionTags = splitClean(data.interactionTags)
  const rawInteractionNotes = splitClean(data.interactionNotes)
  const seededInteraction = getCompoundSeedInteractionData(data)
  const mergedInteraction = mergeInteractionData({
    rawTags: rawInteractionTags,
    rawNotes: rawInteractionNotes,
    seed: seededInteraction,
  })

  return {
    id: String(data.id || slug),
    slug,
    name,
    description: cleanText(data.description ?? data.summary) || '',
    className: cleanText(data.class ?? data.type ?? data.className) || '',
    category: cleanText(data.category ?? data.class ?? data.type ?? data.className) || '',
    intensity: cleanText(data.intensity) || '',
    mechanism,
    activeCompounds: splitClean(data.activeCompounds),
    effects,
    therapeuticUses: splitClean(data.therapeuticUses),
    contraindications: splitClean(data.contraindications),
    interactions: splitClean(data.interactions),
    interactionTags: mergedInteraction.interactionTags,
    interactionNotes: mergedInteraction.interactionNotes,
    dosage: cleanText(data.dosage) || '',
    duration: cleanText(data.duration) || '',
    region: cleanText(data.region) || '',
    preparation: cleanText(data.preparation) || '',
    legalStatus: cleanText(data.legalStatus) || '',
    sideEffects: splitClean(data.sideEffects),
    herbs,
    confidence: calculateCompoundConfidence({ mechanism, effects, compounds: herbs }),
    sources: normalizeSources(data.sources),
    researchEnrichment: researchEnrichment || undefined,
    lastUpdated: String(data.lastUpdated || data.updatedAt || '').trim(),
  }
}

function normalizeCompoundSummary(raw: Record<string, unknown>): CompoundSummaryRecord {
  const effects = splitClean(raw.effects)
  const herbs = splitClean(raw.herbs)
  const confidence = String(raw.confidence || '')
    .trim()
    .toLowerCase()

  return {
    id: String(raw.id || raw.slug || ''),
    slug: String(raw.slug || '')
      .trim()
      .toLowerCase(),
    name: cleanText(raw.name) || '',
    summaryShort: cleanText(raw.summaryShort ?? raw.description) || '',
    description: cleanText(raw.description ?? raw.summaryShort) || '',
    className: cleanText(raw.className) || '',
    category: cleanText(raw.category ?? raw.className) || '',
    mechanism: cleanText(raw.mechanism) || '',
    effects,
    primaryEffects: splitClean(raw.primaryEffects ?? effects).slice(0, 4),
    herbs,
    confidence: confidence === 'high' || confidence === 'medium' ? confidence : 'low',
    hasInteractionData: Boolean(raw.hasInteractionData),
    hasEvidenceNotes: Boolean(raw.hasEvidenceNotes),
    aliases: splitClean(raw.aliases),
  }
}

export function isRenderableCompound(raw: Record<string, unknown>): boolean {
  const { data } = sanitizeCompoundRecord(raw)
  return !hasInvalidEntityName(data)
}

export async function loadCompoundSummaryData(): Promise<CompoundSummaryRecord[]> {
  if (!compoundsSummaryPromise) {
    compoundsSummaryPromise = fetch('/data/compounds-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/compounds-summary.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeCompoundSummary(row as Record<string, unknown>))
      })
      .catch(error => {
        compoundsSummaryPromise = null
        throw error
      })
  }

  return compoundsSummaryPromise
}

export async function loadCompoundDetailBySlug(slug: string): Promise<CompoundRecord | null> {
  const slugKey = slug.trim().toLowerCase()
  if (!slugKey) return null

  const cached = compoundDetailPromiseBySlug.get(slugKey)
  if (cached) return cached

  const request = fetch(`/data/compounds-detail/${encodeURIComponent(slugKey)}.json`, {
    cache: 'no-store',
  })
    .then(async response => {
      if (response.status === 404) {
        const resolvedSlug = await resolveCompoundDetailSlug(slugKey)
        if (!resolvedSlug || resolvedSlug === slugKey) return null
        const fallbackResponse = await fetch(
          `/data/compounds-detail/${encodeURIComponent(resolvedSlug)}.json`,
          {
            cache: 'no-store',
          },
        )
        if (fallbackResponse.status === 404) return null
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to load /data/compounds-detail/${resolvedSlug}.json`)
        }
        return fallbackResponse.json()
      }
      if (!response.ok) {
        throw new Error(`Failed to load /data/compounds-detail/${slugKey}.json`)
      }
      return response.json()
    })
    .then(payload => {
      if (!payload || typeof payload !== 'object') return null
      return normalizeCompound(payload as Record<string, unknown>)
    })
    .catch(error => {
      compoundDetailPromiseBySlug.delete(slugKey)
      throw error
    })

  compoundDetailPromiseBySlug.set(slugKey, request)
  return request
}

export function useCompoundData() {
  const { compounds } = useCompoundDataState()
  return compounds
}

export function useCompoundDataState() {
  const [compounds, setCompounds] = useState<CompoundSummaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadCompoundSummaryData()
      .then(items => {
        if (!alive) return
        setCompounds(items)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setCompounds([])
        setError(cause instanceof Error ? cause : new Error('Failed to load compound summary data'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return { compounds, isLoading, error }
}

export function useCompoundDetailState(slug: string) {
  const [compound, setCompound] = useState<CompoundRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadCompoundDetailBySlug(slug)
      .then(item => {
        if (!alive) return
        setCompound(item)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setCompound(null)
        setError(cause instanceof Error ? cause : new Error('Failed to load compound detail'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [slug])

  return { compound, isLoading, error }
}
