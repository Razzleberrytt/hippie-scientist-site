import type { CompoundRecord } from '@/lib/compound-data'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'
import { normalizeText } from './normalizeText'
import { searchEntries } from './searchEntries'
import type { EntryFilterState } from './filterModel'
import { asStringArray } from './asStringArray'

function getConfidenceRank(level: string) {
  if (level === 'high') return 3
  if (level === 'medium') return 2
  return 1
}

function getCompoundConfidence(compound: CompoundRecord) {
  return calculateCompoundConfidence({
    mechanism: compound.mechanism,
    effects: asStringArray(compound.effects),
    compounds: asStringArray(compound.herbs),
  })
}

export function filterCompounds(
  compounds: CompoundRecord[],
  filters: EntryFilterState
): CompoundRecord[] {
  const searched = searchEntries(compounds, filters.query, compound => ({
    name: compound.name,
    type: compound.category || compound.className,
    mechanism: compound.mechanism,
    effects: asStringArray(compound.effects),
    activeCompounds: asStringArray(compound.activeCompounds),
    contraindications: asStringArray(compound.contraindications),
    safety: asStringArray(compound.legalStatus),
  })).map(result => result.entry)

  const effectNeedles = filters.selectedEffects.map(effect => normalizeText(effect))
  const typeNeedle = normalizeText(filters.type)

  const filtered = searched.filter(compound => {
    const effects = asStringArray(compound.effects).map(effect => normalizeText(effect))
    const confidence = getCompoundConfidence(compound)
    const category = normalizeText(compound.category || compound.className)

    if (effectNeedles.length > 0) {
      const hasAllEffects = effectNeedles.every(effect =>
        effects.some(compoundEffect => compoundEffect.includes(effect))
      )
      if (!hasAllEffects) return false
    }

    if (filters.confidence !== 'all' && confidence !== filters.confidence) return false
    if (typeNeedle !== 'all' && typeNeedle && category !== typeNeedle) return false

    return true
  })

  return filtered.sort((a, b) => {
    if (filters.sort === 'az') return a.name.localeCompare(b.name)

    if (filters.sort === 'confidence') {
      return (
        getConfidenceRank(getCompoundConfidence(b)) - getConfidenceRank(getCompoundConfidence(a))
      )
    }

    const effectCountDiff = asStringArray(b.effects).length - asStringArray(a.effects).length
    if (effectCountDiff !== 0) return effectCountDiff

    return a.name.localeCompare(b.name)
  })
}
