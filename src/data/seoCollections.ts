export type CollectionItemType = 'herb' | 'compound' | 'combo'

export type CollectionCtaTarget = 'interaction-checker' | 'stack-builder'

export type SeoCollectionFilters = {
  effectsAny?: string[]
  interactionTagsAny?: string[]
  mechanismAny?: string[]
  comboGoalsAny?: Array<'relaxation' | 'focus' | 'sleep' | 'mood' | 'energy'>
  comboNameAny?: string[]
  comboDescriptionAny?: string[]
}

export type SeoCollection = {
  slug: string
  title: string
  description: string
  intro: string
  itemType: CollectionItemType
  filters: SeoCollectionFilters
  cta?: CollectionCtaTarget
  secondaryCta?: CollectionCtaTarget
  relatedSlugs: string[]
}

export const SEO_COLLECTIONS: SeoCollection[] = [
  {
    slug: 'herbs-for-relaxation',
    title: 'Herbs for Relaxation',
    description:
      'Explore herbs associated with calming effects, relaxation support, and sedative-related interaction signals.',
    intro:
      'These herbs are pulled from entries that include relaxation-oriented effects, sedative language, or calming interaction tags.',
    itemType: 'herb',
    filters: {
      effectsAny: ['relaxation', 'calming', 'calm', 'anxiolytic', 'sedative', 'sedation'],
      interactionTagsAny: ['sedative', 'gabaergic', 'cns-depressant'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['compounds-for-relaxation', 'calming-herb-combinations', 'gabaergic-herbs'],
  },
  {
    slug: 'herbs-for-focus',
    title: 'Herbs for Focus',
    description:
      'Browse herbs associated with focus, attention, and cognitive clarity signals from the structured dataset.',
    intro:
      'This page includes herbs with focus-like effects or stimulation-oriented interaction tags that are often explored for daytime mental performance.',
    itemType: 'herb',
    filters: {
      effectsAny: ['focus', 'attention', 'clarity', 'cognitive', 'nootropic'],
      interactionTagsAny: ['stimulant'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: [
      'compounds-for-focus',
      'stimulant-herb-combinations',
      'herbs-for-energy',
      'serotonergic-compounds',
    ],
  },
  {
    slug: 'herbs-for-sleep',
    title: 'Herbs for Sleep',
    description:
      'Discover herbs commonly associated with sleep support, nighttime calming, and sedative overlap signals.',
    intro:
      'Included herbs contain sleep-oriented effect terms or central depressant interaction tags that are relevant when evaluating nighttime stacks.',
    itemType: 'herb',
    filters: {
      effectsAny: ['sleep', 'insomnia', 'rest', 'sedative', 'sedation', 'hypnotic'],
      interactionTagsAny: ['sedative', 'cns-depressant', 'gabaergic'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['calming-herb-combinations', 'herbs-for-relaxation', 'gabaergic-herbs'],
  },
  {
    slug: 'herbs-for-energy',
    title: 'Herbs for Energy',
    description:
      'Find herbs associated with stimulation, alertness, and endurance-oriented effect language.',
    intro:
      'This collection surfaces herbs whose entries include stimulation or energy terms, then links directly into tools for interaction checks and stack planning.',
    itemType: 'herb',
    filters: {
      effectsAny: ['energy', 'stimulation', 'alert', 'wakefulness', 'endurance'],
      interactionTagsAny: ['stimulant', 'cardioactive'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['compounds-for-focus', 'stimulant-herb-combinations', 'herbs-for-focus'],
  },
  {
    slug: 'compounds-for-relaxation',
    title: 'Compounds for Relaxation',
    description:
      'Explore compounds associated with relaxation, anxiolytic-style effects, and sedative interaction tags.',
    intro:
      'Compounds are included when their effect, mechanism, or interaction tag data contains relaxation and calming-related markers.',
    itemType: 'compound',
    filters: {
      effectsAny: ['relaxation', 'calming', 'anxiolytic', 'sedation', 'sedative'],
      interactionTagsAny: ['sedative', 'gabaergic', 'cns-depressant'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-relaxation', 'gabaergic-herbs', 'calming-herb-combinations'],
  },
  {
    slug: 'compounds-for-focus',
    title: 'Compounds for Focus',
    description:
      'Compare compounds tied to focus, alertness, and cognition-oriented language from canonical compound data.',
    intro:
      'This index is generated from compound mechanisms, effects, and interaction tags that point toward stimulation or attention-related use cases.',
    itemType: 'compound',
    filters: {
      effectsAny: ['focus', 'attention', 'clarity', 'cognition', 'stimulation'],
      interactionTagsAny: ['stimulant'],
      mechanismAny: ['dopamin', 'cholinergic'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-focus', 'stimulant-herb-combinations', 'herbs-for-energy'],
  },
  {
    slug: 'calming-herb-combinations',
    title: 'Calming Herb Combinations',
    description:
      'Prebuilt combinations centered on calming, wind-down, and sleep-adjacent goals from the interaction checker dataset.',
    intro:
      'These combinations are pulled directly from the prebuilt combo list and filtered to calming-oriented goals and language.',
    itemType: 'combo',
    filters: {
      comboGoalsAny: ['relaxation', 'sleep'],
      comboNameAny: ['calm', 'relax', 'wind', 'quiet', 'sleep', 'stress'],
      comboDescriptionAny: ['calm', 'relax', 'sleep', 'stress', 'wind-down'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-relaxation', 'herbs-for-sleep', 'compounds-for-relaxation'],
  },
  {
    slug: 'stimulant-herb-combinations',
    title: 'Stimulant Herb Combinations',
    description:
      'Prebuilt combinations focused on alertness, focus, and daytime energy from real combo records.',
    intro:
      'Built from preconfigured combos tagged for focus or energy and further matched on stimulation-oriented language.',
    itemType: 'combo',
    filters: {
      comboGoalsAny: ['focus', 'energy'],
      comboNameAny: ['focus', 'spark', 'performance', 'study', 'stimulant', 'energy'],
      comboDescriptionAny: ['stimulation', 'focus', 'alert', 'energy'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-focus', 'herbs-for-energy', 'compounds-for-focus'],
  },
  {
    slug: 'serotonergic-compounds',
    title: 'Serotonergic Compounds',
    description:
      'Review compounds with serotonergic interaction tags or mechanism language referencing serotonin pathways.',
    intro:
      'Entries are included only when the underlying compound record has direct serotonergic tags or serotonin-related mechanism text.',
    itemType: 'compound',
    filters: {
      interactionTagsAny: ['serotonergic', 'maoi'],
      mechanismAny: ['seroton', '5-ht', 'mao'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-relaxation', 'gabaergic-herbs', 'compounds-for-relaxation'],
  },
  {
    slug: 'gabaergic-herbs',
    title: 'GABAergic Herbs',
    description:
      'See herbs carrying GABAergic or related CNS depressant interaction signals in canonical herb records.',
    intro:
      'This collection narrows to herbs with direct GABAergic-style tags or calming mechanism/effect language for safety-first exploration.',
    itemType: 'herb',
    filters: {
      interactionTagsAny: ['gabaergic', 'cns-depressant', 'sedative'],
      mechanismAny: ['gaba', 'gabaa', 'gaba-a'],
      effectsAny: ['sedative', 'calming', 'sleep', 'anxiolytic'],
    },
    cta: 'interaction-checker',
    secondaryCta: 'stack-builder',
    relatedSlugs: ['herbs-for-relaxation', 'herbs-for-sleep', 'compounds-for-relaxation'],
  },
]

export const FEATURED_COLLECTION_SLUGS = [
  'herbs-for-relaxation',
  'herbs-for-focus',
  'herbs-for-sleep',
  'compounds-for-relaxation',
  'calming-herb-combinations',
  'stimulant-herb-combinations',
  'serotonergic-compounds',
  'gabaergic-herbs',
]

export function getCollectionBySlug(slug: string) {
  return SEO_COLLECTIONS.find(collection => collection.slug === slug)
}
