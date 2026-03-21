import { useEffect, useState } from 'react'
import type { Herb } from '@/types'

let herbsPromise: Promise<Herb[]> | null = null

function toList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

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

function normalizeHerbRow(raw: Record<string, unknown>): Herb {
  const slug = String(raw.slug || raw.id || raw.commonName || raw.name || '')
    .trim()
    .toLowerCase()
  const compounds = splitText(raw.activeCompounds ?? raw.compounds ?? raw.active_compounds)

  return {
    ...(raw as Herb),
    id: String(raw.id || slug),
    slug,
    common: String(raw.common || raw.commonName || raw.name || '').trim(),
    scientific: String(raw.scientific || raw.latinName || raw.scientificName || '').trim(),
    description: String(raw.description || raw.summary || '').trim(),
    category: String(raw.class || raw.category || '').trim(),
    intensity: String(raw.intensity || '').trim(),
    region: String(raw.region || '').trim(),
    mechanism: String(raw.mechanism || raw.mechanismOfAction || '').trim(),
    effects: Array.isArray(raw.effects)
      ? (raw.effects as string[]).join('; ')
      : String(raw.effects || ''),
    therapeuticUses: Array.isArray(raw.therapeuticUses)
      ? (raw.therapeuticUses as string[]).join('; ')
      : String(raw.therapeuticUses || ''),
    contraindications: splitText(raw.contraindications),
    interactions: splitText(raw.interactions),
    preparations: splitText(raw.preparation ?? raw.preparations),
    sideeffects: splitText(raw.sideEffects ?? raw.sideeffects),
    compounds,
    active_compounds: compounds,
    tags: toList<string>(raw.tags),
    sources: splitText(raw.sources),
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
