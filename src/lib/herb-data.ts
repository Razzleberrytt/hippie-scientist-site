import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import type { Herb } from '@/types'
import { calculateHerbConfidence } from '@/utils/calculateConfidence'

let herbsPromise: Promise<Herb[]> | null = null
type SourceRef = { title: string; url?: string; note?: string }

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[\n;,|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeHerbRow(raw: Record<string, unknown>): Herb {
  const common = String(raw.common || raw.commonName || raw.name || '').trim()
  const scientific = String(
    raw.scientific || raw.latin || raw.latinName || raw.scientificName || ''
  ).trim()
  const slug = String(raw.slug || raw.id || slugify(common || scientific || ''))
    .trim()
    .toLowerCase()

  const activeCompounds = toList(raw.activeCompounds ?? raw.active_compounds ?? raw.compounds)

  const sources: SourceRef[] = Array.isArray(raw.sources)
    ? (raw.sources as unknown[])
        .map((source): SourceRef | null => {
          if (typeof source === 'string') return { title: source, url: source }
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
    : toList(raw.sources).map(item => ({ title: item, url: item }))

  return {
    ...(raw as Herb),
    id: String(raw.id || slug),
    slug,
    name: common || scientific,
    common,
    scientific,
    description: String(raw.description || raw.summary || '').trim(),
    category: String(raw.class || raw.category || '').trim(),
    class: String(raw.class || '').trim(),
    intensity: String(raw.intensity || '').trim(),
    region: String(raw.region || '').trim(),
    mechanism: String(raw.mechanism || raw.mechanismOfAction || '').trim(),
    effects: Array.isArray(raw.effects)
      ? (raw.effects as string[]).join('; ')
      : String(raw.effects || ''),
    therapeuticUses: Array.isArray(raw.therapeuticUses)
      ? (raw.therapeuticUses as string[]).join('; ')
      : String(raw.therapeuticUses || ''),
    contraindications: toList(raw.contraindications),
    interactions: toList(raw.interactions),
    dosage: Array.isArray(raw.dosage)
      ? (raw.dosage as string[]).join('; ')
      : String(raw.dosage || ''),
    duration: String(raw.duration || '').trim(),
    preparation: Array.isArray(raw.preparation)
      ? (raw.preparation as string[]).join('; ')
      : String(raw.preparation || ''),
    sideeffects: toList(raw.sideEffects ?? raw.sideeffects),
    activeCompounds,
    compounds: activeCompounds,
    active_compounds: activeCompounds,
    confidence: calculateHerbConfidence({
      mechanism: raw.mechanism || raw.mechanismOfAction,
      effects: raw.effects,
      compounds: activeCompounds,
    }),
    legalStatus: String(raw.legalStatus || raw.legalstatus || '').trim(),
    sources,
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
