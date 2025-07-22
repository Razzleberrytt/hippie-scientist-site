export interface Compound {
  name: string
  type: string
  sourceHerbs: string[]
  effectClass: string
  mechanism: string
}

export const compounds: Compound[] = [
  {
    name: 'Psilocybin',
    type: 'Tryptamine',
    sourceHerbs: ['Psilocybe cubensis', 'Psilocybe cyanescens'],
    effectClass: 'Psychedelic',
    mechanism: '5-HT2A receptor agonist causing altered perception and cognition.',
  },
  {
    name: 'Thujone',
    type: 'Monoterpene Ketone',
    sourceHerbs: ['Wormwood', 'Sage'],
    effectClass: 'Stimulant / Deliriant',
    mechanism: 'GABA-A receptor antagonist causing CNS stimulation.',
  },
  {
    name: 'DMT',
    type: 'Tryptamine',
    sourceHerbs: ['Acacia maidenii', 'Anadenanthera peregrina'],
    effectClass: 'Psychedelic',
    mechanism: 'Powerful serotonin 5-HT2A agonist producing intense visions.',
  },
  {
    name: 'Harmine',
    type: 'Beta-carboline',
    sourceHerbs: ['Banisteriopsis caapi', 'Syrian Rue'],
    effectClass: 'MAOI',
    mechanism: 'Reversible MAO-A inhibitor that potentiates tryptamines.',
  },
  {
    name: 'Mescaline',
    type: 'Phenethylamine',
    sourceHerbs: ['Peyote', 'San Pedro'],
    effectClass: 'Psychedelic',
    mechanism: '5-HT2A receptor agonist with empathogenic qualities.',
  },
  {
    name: 'Muscimol',
    type: 'Isoxazole',
    sourceHerbs: ['Amanita muscaria'],
    effectClass: 'Sedative / Deliriant',
    mechanism: 'GABA_A receptor agonist causing dissociative, sedative effects.',
  },
  {
    name: 'Caffeine',
    type: 'Xanthine',
    sourceHerbs: ['Camellia sinensis', 'Coffee'],
    effectClass: 'Stimulant',
    mechanism: 'Adenosine receptor antagonist increasing alertness.',
  },
  {
    name: 'CBD',
    type: 'Cannabinoid',
    sourceHerbs: ['Cannabis sativa'],
    effectClass: 'Modulator',
    mechanism: 'Modulates the endocannabinoid system and serotonin 5-HT1A.',
  },
]

export default compounds
