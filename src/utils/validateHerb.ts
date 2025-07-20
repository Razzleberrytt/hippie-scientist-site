import type { Herb } from '../types'
import { slugify } from './slugify'

/**
 * Validate and normalize a potential Herb object.
 * Returns a sanitized Herb or null if the entry is unusable.
 */
export function validateHerb(raw: any): Herb | null {
  if (!raw || typeof raw !== 'object') return null

  if (typeof raw.name !== 'string' || !raw.name.trim()) {
    console.warn('Skipping herb with invalid name', raw)
    return null
  }

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t: any) => typeof t === 'string' && t.trim())
    : []
  if (!Array.isArray(raw.tags)) {
    console.warn(`Herb ${raw.name} missing tags array`)
  }

  const effects = Array.isArray(raw.effects)
    ? raw.effects.filter((e: any) => typeof e === 'string' && e.trim())
    : []

  const herb: Herb = {
    id:
      typeof raw.id === 'string' && raw.id.trim()
        ? raw.id
        : slugify(raw.name),
    name: raw.name.trim(),
    category:
      typeof raw.category === 'string' && raw.category.trim()
        ? raw.category
        : 'Other',
    effects,
    preparation:
      typeof raw.preparation === 'string' ? raw.preparation : '',
    intensity:
      typeof raw.intensity === 'string' && raw.intensity.trim()
        ? raw.intensity
        : 'Unknown',
    onset: typeof raw.onset === 'string' ? raw.onset : '',
    duration: typeof raw.duration === 'string' ? raw.duration : undefined,
    legalStatus:
      typeof raw.legalStatus === 'string' ? raw.legalStatus : '',
    region: typeof raw.region === 'string' ? raw.region : '',
    tags,
    normalizedCategories: Array.isArray(raw.normalizedCategories)
      ? raw.normalizedCategories.filter((t: any) => typeof t === 'string')
      : undefined,
    scientificName:
      typeof raw.scientificName === 'string' ? raw.scientificName : undefined,
    mechanismOfAction:
      typeof raw.mechanismOfAction === 'string'
        ? raw.mechanismOfAction
        : undefined,
    pharmacokinetics:
      typeof raw.pharmacokinetics === 'string'
        ? raw.pharmacokinetics
        : undefined,
    therapeuticUses:
      typeof raw.therapeuticUses === 'string'
        ? raw.therapeuticUses
        : undefined,
    sideEffects:
      typeof raw.sideEffects === 'string' ? raw.sideEffects : undefined,
    contraindications:
      typeof raw.contraindications === 'string'
        ? raw.contraindications
        : undefined,
    drugInteractions:
      typeof raw.drugInteractions === 'string' ? raw.drugInteractions : undefined,
    toxicity: typeof raw.toxicity === 'string' ? raw.toxicity : undefined,
    toxicityLD50:
      typeof raw.toxicityLD50 === 'string' ? raw.toxicityLD50 : undefined,
    description:
      typeof raw.description === 'string' ? raw.description : undefined,
    safetyRating:
      raw.safetyRating != null && !isNaN(Number(raw.safetyRating))
        ? Number(raw.safetyRating)
        : undefined,
    sourceRefs: Array.isArray(raw.sourceRefs)
      ? raw.sourceRefs.filter((r: any) => typeof r === 'string')
      : undefined,
    image: typeof raw.image === 'string' ? raw.image : undefined,
    activeConstituents: Array.isArray(raw.activeConstituents)
      ? raw.activeConstituents.filter(
          (c: any) => c && typeof c.name === 'string'
        )
      : undefined,
    affiliateLink:
      typeof raw.affiliateLink === 'string' ? raw.affiliateLink : '',
  }

  return herb
}
