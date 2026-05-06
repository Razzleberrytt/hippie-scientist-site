export function segmentCompound(compound = {}) {
  const effects = [
    ...(compound.effects || []),
    ...(compound.primary_effects || []),
  ].join(' ').toLowerCase()

  if (effects.includes('sleep')) return 'sleep'
  if (effects.includes('focus')) return 'focus'
  if (effects.includes('anxiety')) return 'anxiety'
  if (effects.includes('recovery')) return 'recovery'

  return 'general'
}
