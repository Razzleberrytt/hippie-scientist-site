import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getCompoundSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'

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
  const name = cleanText(raw.name ?? raw.commonName ?? raw.id) || ''
  const slug = String(raw.slug || slugify(name))
  const effects = splitClean(raw.effects)
  const herbs = splitClean(raw.associatedHerbs ?? raw.foundInHerbs ?? raw.herbs ?? raw.foundIn)
  const mechanism = cleanText(raw.mechanism ?? raw.mechanismOfAction) || ''
  const rawInteractionTags = splitClean(raw.interactionTags)
  const rawInteractionNotes = splitClean(raw.interactionNotes)
  const seededInteraction = getCompoundSeedInteractionData(raw)
  const mergedInteraction = mergeInteractionData({
    rawTags: rawInteractionTags,
    rawNotes: rawInteractionNotes,
    seed: seededInteraction,
  })

  return {
    id: String(raw.id || slug),
    slug,
    name,
    description: cleanText(raw.description ?? raw.summary) || '',
    className: cleanText(raw.class ?? raw.type) || '',
    category: cleanText(raw.category ?? raw.class ?? raw.type) || '',
    intensity: cleanText(raw.intensity) || '',
    mechanism,
    activeCompounds: splitClean(raw.activeCompounds),
    effects,
    therapeuticUses: splitClean(raw.therapeuticUses),
    contraindications: splitClean(raw.contraindications),
    interactions: splitClean(raw.interactions),
    interactionTags: mergedInteraction.interactionTags,
    interactionNotes: mergedInteraction.interactionNotes,
    dosage: cleanText(raw.dosage) || '',
    duration: cleanText(raw.duration) || '',
    region: cleanText(raw.region) || '',
    preparation: cleanText(raw.preparation) || '',
    legalStatus: cleanText(raw.legalStatus) || '',
    sideEffects: splitClean(raw.sideEffects),
    herbs,
    confidence: calculateCompoundConfidence({ mechanism, effects, compounds: herbs }),
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
