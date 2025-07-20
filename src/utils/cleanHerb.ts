export function cleanHerb(herb: any): import('../types').Herb {
  return {
    name: herb?.name || 'Unnamed Herb',
    scientificName: herb?.scientificName || '',
    category: herb?.category || 'Other',
    effects: Array.isArray(herb?.effects) ? herb.effects : [],
    preparation: herb?.preparation || 'N/A',
    intensity: herb?.intensity || 'Unknown',
    onset: herb?.onset || 'Unknown',
    legalStatus: herb?.legalStatus || 'Varies',
    region: herb?.region || 'Unknown',
    tags: Array.isArray(herb?.tags) ? herb.tags : [],
    mechanismOfAction: herb?.mechanismOfAction || 'Unclear',
    therapeuticUses: herb?.therapeuticUses || '',
    sideEffects: herb?.sideEffects || '',
    contraindications: herb?.contraindications || '',
    drugInteractions: herb?.drugInteractions || '',
    pharmacokinetics: herb?.pharmacokinetics || '',
    duration: herb?.duration || '',
    toxicity: herb?.toxicity || '',
    toxicityLD50: herb?.toxicityLD50 || '',
    safetyRating: herb?.safetyRating ?? 'Unknown',
  } as import('../types').Herb
}
