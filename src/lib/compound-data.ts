import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'

export type CompoundRecord = {
  id: string
  slug: string
  name: string
  description: string
  className: string
  effects: string[]
  contraindications: string[]
  herbs: string[]
  sources: string[]
  lastUpdated: string
  mechanism: string
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

function normalizeCompound(raw: Record<string, unknown>): CompoundRecord {
  const name = String(raw.name || raw.commonName || raw.id || '').trim()
  const slug = String(raw.slug || slugify(name))
  return {
    id: String(raw.id || slug),
    slug,
    name,
    description: String(raw.description || raw.summary || '').trim(),
    className: String(raw.class || raw.type || '').trim(),
    effects: splitText(raw.effects),
    contraindications: splitText(raw.contraindications),
    herbs: splitText(raw.associatedHerbs ?? raw.foundInHerbs ?? raw.herbs ?? raw.foundIn),
    sources: splitText(raw.sources),
    lastUpdated: String(raw.lastUpdated || raw.updatedAt || '').trim(),
    mechanism: String(raw.mechanism || raw.mechanismOfAction || '').trim(),
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
