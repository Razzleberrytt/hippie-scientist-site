export function classifyBuyerIntent(query = '') {
  const value = String(query).toLowerCase()

  if (value.includes('best')) return 'high'
  if (value.includes('vs')) return 'high'
  if (value.includes('review')) return 'high'
  if (value.includes('benefits')) return 'medium'
  if (value.includes('side effects')) return 'medium'

  return 'low'
}

export function buildBuyerIntentKeywords(compound = {}) {
  const name = compound.name || compound.slug || 'compound'

  return [
    `best ${name} supplement`,
    `${name} review`,
    `${name} benefits`,
    `${name} side effects`,
    `${name} vs magnesium`,
  ]
}
