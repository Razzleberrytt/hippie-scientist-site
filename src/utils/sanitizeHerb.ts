import { safeHerbField } from './safeHerbField'

function cleanStr(value: any, fallback = ''): string {
  return safeHerbField(value, fallback)
}

export function sanitizeHerb(herb: any): import('../types').Herb {
  return {
    name: cleanStr(herb?.name, 'Unnamed Herb'),
    scientificName: cleanStr(herb?.scientificName),
    category: cleanStr(herb?.category, 'Other'),
    effects: Array.isArray(herb?.effects) ? herb.effects : [],
    tags: Array.isArray(herb?.tags) ? herb.tags : [],
    description: cleanStr(herb?.description),
    mechanismOfAction: cleanStr(herb?.mechanismOfAction),
    preparation: cleanStr(herb?.preparation),
    therapeuticUses: cleanStr(herb?.therapeuticUses),
    pharmacokinetics: cleanStr(herb?.pharmacokinetics),
    sideEffects: cleanStr(herb?.sideEffects),
    contraindications: cleanStr(herb?.contraindications),
    drugInteractions: cleanStr(herb?.drugInteractions),
    intensity: cleanStr(herb?.intensity),
    onset: cleanStr(herb?.onset),
    duration: cleanStr(herb?.duration),
    legalStatus: cleanStr(herb?.legalStatus),
    region: cleanStr(herb?.region),
    toxicity: cleanStr(herb?.toxicity),
    toxicityLD50: cleanStr(herb?.toxicityLD50),
    safetyRating:
      herb?.safetyRating === 'N/A' || herb?.safetyRating === 'Unknown'
        ? null
        : (herb?.safetyRating as any) ?? null,
  } as import('../types').Herb
}
