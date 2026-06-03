export const topAuthorityProfiles = [
  'ashwagandha',
  'creatine',
  'magnesium',
  'rhodiola',
  'lion-s-mane',
  'theanine',
  'nac',
  'apigenin',
  'berberine',
  'curcumin',
  'cordyceps',
  'tongkat-ali',
  'omega-3',
  'bacopa',
  'taurine',
  'glycine',
  'phosphatidylserine',
  'alpha-gpc',
  'saffron',
  'shilajit',
]

export function buildAuthorityPriorityScore(slug: string) {
  const normalized = slug.toLowerCase()
  const index = topAuthorityProfiles.indexOf(normalized)

  if (index === -1) return 25

  return 100 - index * 3
}

export function shouldPrioritizeAuthorityExpansion(slug: string) {
  return topAuthorityProfiles.includes(slug.toLowerCase())
}
