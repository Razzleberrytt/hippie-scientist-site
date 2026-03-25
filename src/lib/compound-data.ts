import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getCompoundSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'
import { sanitizeCompoundRecord } from '@/utils/sanitizeData'

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

let compoundsPromise: Promise<CompoundRecord[]> | null = null

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
    lastUpdated: String(data.lastUpdated || data.updatedAt || '').trim(),
  }
}

export async function loadCompoundData(): Promise<CompoundRecord[]> {
  if (!compoundsPromise) {
    compoundsPromise = fetch('/data/compounds.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/compounds.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeCompound(row as Record<string, unknown>))
      })
      .catch(error => {
        compoundsPromise = null
        throw error
      })
  }

  return compoundsPromise
}

export function useCompoundData() {
  const { compounds } = useCompoundDataState()
  return compounds
}

export function useCompoundDataState() {
  const [compounds, setCompounds] = useState<CompoundRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadCompoundData()
      .then(items => {
        if (!alive) return
        setCompounds(items)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setCompounds([])
        setError(cause instanceof Error ? cause : new Error('Failed to load compound data'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return { compounds, isLoading, error }
}
