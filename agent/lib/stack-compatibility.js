export function evaluateStackCompatibility(a = {}, b = {}) {
  const aEffects = new Set([...(a.effects || []), ...(a.primary_effects || [])])
  const bEffects = [...(b.effects || []), ...(b.primary_effects || [])]

  const overlap = bEffects.filter(effect => aEffects.has(effect)).length

  if (overlap >= 4) {
    return {
      compatibility: 'redundant',
      overlap,
    }
  }

  if (overlap >= 2) {
    return {
      compatibility: 'synergistic',
      overlap,
    }
  }

  return {
    compatibility: 'neutral',
    overlap,
  }
}
