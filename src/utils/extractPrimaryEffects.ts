const VAGUE_EFFECTS = new Set(['', 'psychoactive', 'effects'])

const PRIORITY_ORDER = ['euphoria', 'sedation', 'visual distortion', 'stimulation', 'anxiolytic']

function normalizeEffect(effect: string): string {
  return effect.trim().replace(/\s+/g, ' ').toLowerCase()
}

function toEffectsList(effects: string[] | undefined | null): string[] {
  if (!Array.isArray(effects)) return []
  return effects.map(effect => (typeof effect === 'string' ? effect.trim() : '')).filter(Boolean)
}

export function extractPrimaryEffects(effects: string[] | undefined | null, max = 3): string[] {
  const deduped = Array.from(
    new Map(
      toEffectsList(effects)
        .filter(effect => !VAGUE_EFFECTS.has(normalizeEffect(effect)))
        .map(effect => [normalizeEffect(effect), effect])
    ).values()
  )

  if (deduped.length <= max) return deduped

  const ranked = [...deduped].sort((a, b) => {
    const aNorm = normalizeEffect(a)
    const bNorm = normalizeEffect(b)

    const aPriority = PRIORITY_ORDER.findIndex(term => aNorm.includes(term))
    const bPriority = PRIORITY_ORDER.findIndex(term => bNorm.includes(term))

    const aRank = aPriority === -1 ? Number.POSITIVE_INFINITY : aPriority
    const bRank = bPriority === -1 ? Number.POSITIVE_INFINITY : bPriority

    if (aRank !== bRank) return aRank - bRank
    return a.localeCompare(b)
  })

  return ranked.slice(0, max)
}
