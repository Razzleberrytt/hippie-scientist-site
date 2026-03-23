import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import type { Herb } from '@/types'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'

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
  const common = cleanText(raw.common ?? raw.commonName ?? raw.name) || ''
  const scientific =
    cleanText(raw.scientific ?? raw.latin ?? raw.latinName ?? raw.scientificName) || ''
  const slug = String(raw.slug || raw.id || slugify(common || scientific || ''))
    .trim()
    .toLowerCase()

  const effects = splitClean(raw.effects)
  const contraindications = splitClean(raw.contraindications)
  const interactions = splitClean(raw.interactions)
  const sideeffects = splitClean(raw.sideEffects ?? raw.sideeffects)
  const therapeuticUses = splitClean(raw.therapeuticUses)
  const activeCompounds = splitClean(raw.activeCompounds ?? raw.active_compounds ?? raw.compounds)
  const sources = normalizeSources(raw.sources)

  const mechanism = cleanText(raw.mechanism ?? raw.mechanismOfAction) || ''
  const description = cleanText(raw.description ?? raw.summary) || ''
  const duration = cleanText(raw.duration) || ''
  const dosage = cleanText(raw.dosage) || ''
  const preparation = cleanText(raw.preparation) || ''
  const legalStatus = cleanText(raw.legalStatus ?? raw.legalstatus) || ''
  const region = cleanText(raw.region) || ''
  const category = cleanText(raw.class ?? raw.category) || ''
  const intensity = cleanText(raw.intensity) || ''

  return {
    ...(raw as Herb),
    id: String(raw.id || slug),
    slug,
    name: common || scientific,
    common,
    scientific,
    description,
    category,
    class: cleanText(raw.class) || '',
    intensity,
    region,
    mechanism,
    effects,
    therapeuticUses,
    contraindications,
    interactions,
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
  const [herbs, setHerbs] = useState<Herb[]>([])

  useEffect(() => {
    let alive = true
    loadHerbData()
      .then(items => {
        if (!alive) return
        setHerbs(items)
      })
      .catch(() => {
        if (!alive) return
        setHerbs([])
      })

    return () => {
      alive = false
    }
  }, [])

  return herbs
}
