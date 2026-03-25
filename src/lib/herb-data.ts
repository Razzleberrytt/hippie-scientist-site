import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import type { Herb } from '@/types'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getHerbSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'
import { sanitizeHerbRecord } from '@/utils/sanitizeData'

let herbsPromise: Promise<Herb[]> | null = null
type SourceRef = { title: string; url?: string; note?: string }

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
    data.activeCompounds ?? data.active_compounds ?? data.compounds
  )
  const sources = normalizeSources(data.sources)
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
    sources,
    confidence: calculateHerbConfidence({ mechanism, effects, compounds: activeCompounds }),
  }
}

export async function loadHerbData(): Promise<Herb[]> {
  if (!herbsPromise) {
    herbsPromise = fetch('/data/herbs.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/herbs.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeHerbRow(row as Record<string, unknown>))
      })
      .catch(error => {
        herbsPromise = null
        throw error
      })
  }

  return herbsPromise
}

export function useHerbData() {
  const { herbs } = useHerbDataState()
  return herbs
}

export function useHerbDataState() {
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadHerbData()
      .then(items => {
        if (!alive) return
        setHerbs(items)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setHerbs([])
        setError(cause instanceof Error ? cause : new Error('Failed to load herb data'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return { herbs, isLoading, error }
}
