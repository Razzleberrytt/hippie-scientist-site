import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'

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
  herbs: string[]
  sources: SourceRef[]
  lastUpdated: string
  confidence: ConfidenceLevel
}

let compoundsPromise: Promise<CompoundRecord[]> | null = null

function splitText(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[\n;,|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value
    .map(source => {
      if (typeof source === 'string') return { title: source, url: source }
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
  const name = String(raw.name || raw.commonName || raw.id || '').trim()
  const slug = String(raw.slug || slugify(name))
  const effects = splitText(raw.effects)
  const herbs = splitText(raw.associatedHerbs ?? raw.foundInHerbs ?? raw.herbs ?? raw.foundIn)

  return {
    id: String(raw.id || slug),
    slug,
    name,
    description: String(raw.description || raw.summary || '').trim(),
    className: String(raw.class || raw.type || '').trim(),
    category: String(raw.category || raw.class || raw.type || '').trim(),
    intensity: String(raw.intensity || '').trim(),
    mechanism: String(raw.mechanism || raw.mechanismOfAction || '').trim(),
    activeCompounds: splitText(raw.activeCompounds),
    effects,
    therapeuticUses: splitText(raw.therapeuticUses),
    contraindications: splitText(raw.contraindications),
    interactions: splitText(raw.interactions),
    dosage: Array.isArray(raw.dosage)
      ? (raw.dosage as string[]).join('; ')
      : String(raw.dosage || '').trim(),
    duration: String(raw.duration || '').trim(),
    region: String(raw.region || '').trim(),
    preparation: String(raw.preparation || '').trim(),
    legalStatus: String(raw.legalStatus || '').trim(),
    sideEffects: splitText(raw.sideEffects),
    herbs,
    confidence: calculateCompoundConfidence({
      mechanism: raw.mechanism || raw.mechanismOfAction,
      effects,
      compounds: herbs,
    }),
    sources: normalizeSources(raw.sources),
    lastUpdated: String(raw.lastUpdated || raw.updatedAt || '').trim(),
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
  const [compounds, setCompounds] = useState<CompoundRecord[]>([])

  useEffect(() => {
    let alive = true
    loadCompoundData()
      .then(items => {
        if (!alive) return
        setCompounds(items)
      })
      .catch(() => {
        if (!alive) return
        setCompounds([])
      })

    return () => {
      alive = false
    }
  }, [])

  return compounds
}
