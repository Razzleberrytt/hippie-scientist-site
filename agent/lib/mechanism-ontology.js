export const MECHANISM_ONTOLOGY = {
  gabaergic: ['gaba', 'gabaergic'],
  serotonergic: ['serotonin', '5-ht', 'serotonergic'],
  dopaminergic: ['dopamine', 'dopaminergic'],
  cholinergic: ['acetylcholine', 'cholinergic'],
  anti_inflammatory: ['anti-inflammatory', 'inflammation'],
  antioxidant: ['oxidative stress', 'antioxidant'],
}

export function classifyMechanisms(values = []) {
  const text = values.join(' ').toLowerCase()

  return Object.entries(MECHANISM_ONTOLOGY)
    .filter(([, keywords]) => {
      return keywords.some(keyword => text.includes(keyword))
    })
    .map(([label]) => label)
}
