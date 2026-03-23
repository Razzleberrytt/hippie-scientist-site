import type { Herb } from '@/types'
import { computeConfidenceLevel } from '@/lib/dataTrust'
import { normalizeText } from './normalizeText'
import { searchEntries } from './searchEntries'
import type { EntryFilterState } from './filterModel'
import { asStringArray } from './asStringArray'

function getConfidenceRank(level: string) {
  if (level === 'high') return 3
  if (level === 'medium') return 2
  return 1
}

function getHerbConfidence(herb: Herb) {
  return computeConfidenceLevel({
    mechanism: herb.mechanism || herb.mechanismOfAction || herb.mechanismofaction,
    effects: asStringArray(herb.effects),
    compounds: asStringArray(herb.activeCompounds || herb.active_compounds || herb.compounds),
  }).toLowerCase()
}

export function filterHerbs(herbs: Herb[], filters: EntryFilterState): Herb[] {
  const searched = searchEntries(herbs, filters.query, herb => ({
    name: herb.common || herb.name || herb.scientific || herb.slug,
    type: String((herb as Record<string, unknown>).class || herb.category || ''),
    mechanism: herb.mechanism || herb.mechanismOfAction || herb.mechanismofaction,
    effects: asStringArray(herb.effects),
    activeCompounds: asStringArray(herb.activeCompounds || herb.active_compounds || herb.compounds),
    contraindications: asStringArray(herb.contraindications),
    safety: asStringArray(herb.safety),
  })).map(result => result.entry)

  const effectNeedles = filters.selectedEffects.map(effect => normalizeText(effect))
  const typeNeedle = normalizeText(filters.type)

  const filtered = searched.filter(herb => {
    const herbEffects = asStringArray(herb.effects).map(effect => normalizeText(effect))
    const confidence = getHerbConfidence(herb)
    const herbType = normalizeText(
      String((herb as Record<string, unknown>).class || herb.category || '')
    )

    if (effectNeedles.length > 0) {
      const hasAllEffects = effectNeedles.every(effect =>
        herbEffects.some(herbEffect => herbEffect.includes(effect))
      )
      if (!hasAllEffects) return false
    }

    if (filters.confidence !== 'all' && confidence !== filters.confidence) return false
    if (typeNeedle !== 'all' && typeNeedle && herbType !== typeNeedle) return false

    return true
  })

  return filtered.sort((a, b) => {
    if (filters.sort === 'az') {
      return String(a.common || a.name || a.scientific || '').localeCompare(
        String(b.common || b.name || b.scientific || '')
      )
    }

    if (filters.sort === 'confidence') {
      return getConfidenceRank(getHerbConfidence(b)) - getConfidenceRank(getHerbConfidence(a))
    }

    const effectCountDiff = asStringArray(b.effects).length - asStringArray(a.effects).length
    if (effectCountDiff !== 0) return effectCountDiff

    return String(a.common || a.name || a.scientific || '').localeCompare(
      String(b.common || b.name || b.scientific || '')
    )
  })
}
