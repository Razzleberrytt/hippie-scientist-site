export function classifyArchetype(compound = {}) {
  const text = JSON.stringify({
    effects: compound.effects,
    mechanisms: compound.mechanisms,
  }).toLowerCase()

  if (text.includes('stress') || text.includes('adaptogen')) {
    return 'adaptogen'
  }

  if (text.includes('focus') || text.includes('cognitive')) {
    return 'nootropic'
  }

  if (text.includes('exercise') || text.includes('recovery')) {
    return 'ergogenic'
  }

  if (text.includes('anxiety') || text.includes('calm')) {
    return 'anxiolytic'
  }

  if (text.includes('inflammation')) {
    return 'anti-inflammatory'
  }

  return 'general'
}
