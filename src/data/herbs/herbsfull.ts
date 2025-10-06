import type { Herb } from '../../types'
import rawHerbs from './herbs.normalized.json'

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(v => (typeof v === 'string' ? v.trim() : ''))
      .filter((v): v is string => Boolean(v))
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/)
      .map(v => v.trim())
      .filter(Boolean)
  }
  return []
}

function boolFrom(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  if (typeof value === 'number') return value !== 0
  return false
}

const normalized: Herb[] = (rawHerbs as any[]).map(raw => {
  const compounds = toStringArray(raw.compounds)
  const tags = toStringArray(raw.tags)
  const interactions = toStringArray(raw.interactions)
  const contraindications = toStringArray(raw.contraindications)
  const sources = toStringArray(raw.sources)

  const common = typeof raw.common === 'string' ? raw.common : ''
  const scientific = typeof raw.scientific === 'string' ? raw.scientific : ''
  const slug = typeof raw.slug === 'string' && raw.slug ? raw.slug : String(raw.id || '')
  const id = String(raw.id || slug)

  const mechanism =
    typeof raw.mechanism === 'string'
      ? raw.mechanism
      : typeof raw.mechanismofaction === 'string'
        ? raw.mechanismofaction
        : ''

  const legalstatus = typeof raw.legalstatus === 'string' ? raw.legalstatus : ''
  const therapeutic = typeof raw.therapeutic === 'string' ? raw.therapeutic : ''
  const sideeffects = typeof raw.sideeffects === 'string' ? raw.sideeffects : ''

  const herb: Herb = {
    id,
    slug,
    common,
    scientific,
    category: typeof raw.category === 'string' ? raw.category : '',
    category_label:
      typeof raw.category_label === 'string' && raw.category_label
        ? raw.category_label
        : typeof raw.category === 'string'
          ? raw.category
          : '',
    intensity: typeof raw.intensity === 'string' ? raw.intensity : '',
    intensity_label:
      typeof raw.intensity_label === 'string' && raw.intensity_label
        ? raw.intensity_label
        : typeof raw.intensity === 'string'
          ? raw.intensity
          : '',
    region: typeof raw.region === 'string' ? raw.region : '',
    legalstatus,
    description: typeof raw.description === 'string' ? raw.description : '',
    effects: typeof raw.effects === 'string' ? raw.effects : '',
    mechanism,
    compounds,
    interactions,
    contraindications,
    dosage: typeof raw.dosage === 'string' ? raw.dosage : '',
    therapeutic,
    safety: typeof raw.safety === 'string' ? raw.safety : '',
    sideeffects,
    toxicity: typeof raw.toxicity === 'string' ? raw.toxicity : '',
    toxicity_ld50: typeof raw.toxicity_ld50 === 'string' ? raw.toxicity_ld50 : '',
    is_controlled_substance: boolFrom(raw.is_controlled_substance),
    tags,
    sources,
    image: typeof raw.image === 'string' ? raw.image : '',
    name:
      typeof raw.name === 'string' && raw.name ? raw.name : common || scientific || id,
    nameNorm:
      typeof raw.nameNorm === 'string' && raw.nameNorm ? raw.nameNorm : common || scientific || id,
    commonnames:
      typeof raw.commonnames === 'string' && raw.commonnames ? raw.commonnames : common,
    scientificname:
      typeof raw.scientificname === 'string' && raw.scientificname
        ? raw.scientificname
        : scientific,
    mechanismofaction:
      typeof raw.mechanismofaction === 'string' ? raw.mechanismofaction : mechanism,
    mechanismOfAction:
      typeof raw.mechanismOfAction === 'string' ? raw.mechanismOfAction : mechanism,
    legalStatus: typeof raw.legalStatus === 'string' ? raw.legalStatus : legalstatus,
    therapeuticUses:
      typeof raw.therapeuticUses === 'string' ? raw.therapeuticUses : therapeutic,
    sideEffects: typeof raw.sideEffects === 'string' ? raw.sideEffects : sideeffects,
    drugInteractions:
      typeof raw.drugInteractions === 'string' && raw.drugInteractions
        ? raw.drugInteractions
        : interactions.join('; '),
    toxicityld50:
      typeof raw.toxicityld50 === 'string' ? raw.toxicityld50 : raw.toxicity_ld50 || '',
    toxicityLD50:
      typeof raw.toxicityLD50 === 'string' ? raw.toxicityLD50 : raw.toxicity_ld50 || '',
    compoundsDetailed: Array.isArray(raw.compoundsDetailed) ? raw.compoundsDetailed : compounds,
    activeconstituents: Array.isArray(raw.activeconstituents) ? raw.activeconstituents : compounds,
    activeConstituents: Array.isArray(raw.activeConstituents)
      ? raw.activeConstituents
      : compounds.map(name => ({ name })),
    contraindicationsText:
      typeof raw.contraindicationsText === 'string' && raw.contraindicationsText
        ? raw.contraindicationsText
        : contraindications.join('; '),
    interactionsText:
      typeof raw.interactionsText === 'string' && raw.interactionsText
        ? raw.interactionsText
        : interactions.join('; '),
    tagsRaw: typeof raw.tagsRaw === 'string' && raw.tagsRaw ? raw.tagsRaw : tags.join('; '),
    duration: (raw.duration ?? null) as string | null,
    onset: (raw.onset ?? null) as string | null,
    pharmacokinetics: (raw.pharmacokinetics ?? null) as string | null,
    preparation: (raw.preparation ?? null) as string | null,
    regionNotes: (raw.regionNotes ?? null) as string | null,
    safetyrating: (raw.safetyrating ?? null) as string | null,
    dosage_notes: (raw.dosage_notes ?? null) as string | null,
    legalstatusClean: (raw.legalstatusClean ?? null) as string | null,
    intensityClean: (raw.intensityClean ?? null) as string | null,
    effectsSummary: (raw.effectsSummary ?? null) as string | null,
    affiliatelink: (raw.affiliatelink ?? null) as string | null,
    imageCredit: (raw.imageCredit ?? null) as string | null
  }

  return herb
})

export const herbs: Herb[] = normalized
