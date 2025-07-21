export interface Compound {
  name: string
  class: string
  effects: string[]
  /** Herbs that contain this compound */
  sourceHerbs: string[]
  /** Optional extra fields for detailed view */
  mechanismOfAction?: string
  psychoactiveEffects?: string[]
  foundInHerbs?: string[]
  toxicityWarning?: string
  notes?: string
}

export const compounds: Compound[] = [
  {
    name: 'Mescaline',
    class: 'phenethylamine',
    effects: ['psychedelic', 'empathogenic'],
    sourceHerbs: ['lophophora-williamsii'],
    mechanismOfAction: '5-HT2A agonist',
    psychoactiveEffects: ['visual enhancement', 'emotional openness'],
    foundInHerbs: ['lophophora-williamsii'],
    toxicityWarning: 'High doses may cause nausea and anxiety',
  },
  {
    name: 'Psilocybin',
    class: 'tryptamine',
    effects: ['psychedelic'],
    sourceHerbs: ['psilocybe-cubensis'],
    notes: 'Converted to psilocin in the body',
    mechanismOfAction: 'Converted to psilocin; 5-HT2A agonist',
    psychoactiveEffects: ['visual distortion', 'mystical states'],
    foundInHerbs: ['psilocybe-cubensis'],
  },
  {
    name: 'Mitragynine',
    class: 'indole alkaloid',
    effects: ['stimulant', 'analgesic'],
    sourceHerbs: ['kratom-hybrids'],
    mechanismOfAction: 'Partial μ-opioid agonist',
    psychoactiveEffects: ['energy boost', 'pain relief'],
    foundInHerbs: ['kratom-hybrids'],
  },
  {
    name: 'Harmine',
    class: 'beta-carboline',
    effects: ['MAOI', 'psychedelic potentiator'],
    sourceHerbs: ['banisteriopsis-caapi'],
    mechanismOfAction: 'Reversible MAO-A inhibitor',
    psychoactiveEffects: ['potentiates DMT'],
    foundInHerbs: ['banisteriopsis-caapi'],
  },
  {
    name: 'Thujone',
    class: 'monoterpene',
    effects: ['GABA antagonist'],
    sourceHerbs: ['salvia-apiana', 'achillea-millefolium'],
    mechanismOfAction: 'GABA_A receptor antagonist',
    psychoactiveEffects: ['stimulant', 'convulsant at high dose'],
    foundInHerbs: ['salvia-apiana', 'achillea-millefolium'],
    toxicityWarning: 'Convulsant at high doses',
  },
]

export default compounds
