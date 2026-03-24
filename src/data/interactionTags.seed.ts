export const CANONICAL_INTERACTION_TAGS = [
  'sedative',
  'stimulant',
  'serotonergic',
  'maoi',
  'gabaergic',
  'cardioactive',
  'hepatotoxic',
  'cholinergic',
  'psychedelic',
  'cns-depressant',
] as const

export type CanonicalInteractionTag = (typeof CANONICAL_INTERACTION_TAGS)[number]

export type SeededInteractionData = {
  interactionTags: CanonicalInteractionTag[]
  interactionNotes: string[]
}

export const HERB_INTERACTION_SEED: Record<string, SeededInteractionData> = {
  'valeriana officinalis': {
    interactionTags: ['sedative', 'gabaergic', 'cns-depressant'],
    interactionNotes: ['Structured seed: known sedative/GABA-related CNS depressant profile.'],
  },
  'passiflora incarnata': {
    interactionTags: ['sedative', 'gabaergic', 'cns-depressant'],
    interactionNotes: [
      'Structured seed: commonly characterized as a calming GABA-related nervine.',
    ],
  },
  'piper methysticum': {
    interactionTags: ['sedative', 'gabaergic', 'cns-depressant', 'hepatotoxic'],
    interactionNotes: [
      'Structured seed: kava has sedative/GABAergic CNS depressant effects and liver caution context.',
    ],
  },
  'mitragyna speciosa': {
    interactionTags: ['cardioactive'],
    interactionNotes: ['Structured seed: kratom has consistent cardiovascular caution signals.'],
  },
  'peganum harmala': {
    interactionTags: ['maoi', 'serotonergic'],
    interactionNotes: [
      'Structured seed: harmala alkaloid source with MAO-inhibiting serotonergic activity.',
    ],
  },
  'banisteriopsis caapi': {
    interactionTags: ['maoi', 'serotonergic'],
    interactionNotes: ['Structured seed: ayahuasca vine with reversible MAOI beta-carbolines.'],
  },
  'nicotiana tabacum': {
    interactionTags: ['stimulant', 'cardioactive', 'cholinergic'],
    interactionNotes: [
      'Structured seed: nicotine-containing tobacco has stimulant, cardiovascular, and nicotinic cholinergic activity.',
    ],
  },
  'coffea arabica': {
    interactionTags: ['stimulant', 'cardioactive'],
    interactionNotes: [
      'Structured seed: coffee/caffeine profile includes stimulant and cardiovascular effects.',
    ],
  },
  'camellia sinensis': {
    interactionTags: ['stimulant', 'cardioactive'],
    interactionNotes: [
      'Structured seed: tea caffeine profile includes stimulant and cardiovascular effects.',
    ],
  },
  'hypericum perforatum': {
    interactionTags: ['serotonergic'],
    interactionNotes: [
      'Structured seed: St. John’s wort has consistent serotonin-related interaction concern.',
    ],
  },
  'cannabis sativa': {
    interactionTags: ['sedative', 'cns-depressant'],
    interactionNotes: [
      'Structured seed: cannabis can contribute sedative/CNS depressant overlap signals.',
    ],
  },
  'papaver somniferum': {
    interactionTags: ['sedative', 'cns-depressant'],
    interactionNotes: [
      'Structured seed: opium poppy opioid profile supports sedative CNS depressant tagging.',
    ],
  },
}

export const COMPOUND_INTERACTION_SEED: Record<string, SeededInteractionData> = {
  caffeine: {
    interactionTags: ['stimulant', 'cardioactive'],
    interactionNotes: [
      'Structured seed: canonical stimulant with cardiovascular activation signals.',
    ],
  },
  nicotine: {
    interactionTags: ['stimulant', 'cardioactive', 'cholinergic'],
    interactionNotes: [
      'Structured seed: nicotinic cholinergic agonist with stimulant and cardiovascular effects.',
    ],
  },
  harmine: {
    interactionTags: ['maoi', 'serotonergic'],
    interactionNotes: [
      'Structured seed: beta-carboline MAOI with serotonin-related interaction relevance.',
    ],
  },
  harmaline: {
    interactionTags: ['maoi', 'serotonergic'],
    interactionNotes: [
      'Structured seed: beta-carboline MAOI with serotonin-related interaction relevance.',
    ],
  },
  thc: {
    interactionTags: ['sedative', 'cns-depressant'],
    interactionNotes: [
      'Structured seed: THC can contribute sedative/CNS depressant overlap patterns.',
    ],
  },
  cbd: {
    interactionTags: ['sedative'],
    interactionNotes: [
      'Structured seed: CBD is frequently associated with calming/sedative effects.',
    ],
  },
  mitragynine: {
    interactionTags: ['cardioactive'],
    interactionNotes: ['Structured seed: kratom alkaloid with cardiovascular caution signals.'],
  },
  '7-hydroxymitragynine': {
    interactionTags: ['sedative', 'cns-depressant'],
    interactionNotes: [
      'Structured seed: opioid-like metabolite with sedative and CNS depressant overlap potential.',
    ],
  },
  dmt: {
    interactionTags: ['psychedelic', 'serotonergic'],
    interactionNotes: ['Structured seed: classic serotonergic psychedelic tryptamine.'],
  },
  mescaline: {
    interactionTags: ['psychedelic', 'serotonergic'],
    interactionNotes: ['Structured seed: classic serotonergic psychedelic phenethylamine.'],
  },
  codeine: {
    interactionTags: ['sedative', 'cns-depressant'],
    interactionNotes: ['Structured seed: opioid analgesic with sedative CNS depressant effects.'],
  },
  morphine: {
    interactionTags: ['sedative', 'cns-depressant'],
    interactionNotes: ['Structured seed: opioid agonist with strong CNS depressant effects.'],
  },
  muscimol: {
    interactionTags: ['gabaergic', 'sedative', 'cns-depressant'],
    interactionNotes: [
      'Structured seed: GABAergic psychoactive with sedative CNS depressant profile.',
    ],
  },
}
