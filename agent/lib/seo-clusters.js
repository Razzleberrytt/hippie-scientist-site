export function buildSeoClusters(compounds = []) {
  const clusters = {
    sleep: [],
    focus: [],
    anxiety: [],
    recovery: [],
    longevity: [],
  }

  for (const compound of compounds) {
    const effects = [
      ...(compound.effects || []),
      ...(compound.primary_effects || []),
    ].join(' ').toLowerCase()

    if (effects.includes('sleep')) clusters.sleep.push(compound.slug)
    if (effects.includes('focus')) clusters.focus.push(compound.slug)
    if (effects.includes('anxiety')) clusters.anxiety.push(compound.slug)
    if (effects.includes('recovery')) clusters.recovery.push(compound.slug)
    if (effects.includes('longevity')) clusters.longevity.push(compound.slug)
  }

  return clusters
}
