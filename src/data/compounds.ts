export interface Compound {
  name: string
  class: string
  effects: string[]
  sourceHerbs: string[]
  toxicityWarning?: string
  notes?: string
}

export const compounds: Compound[] = [
  {
    name: 'Mescaline',
    class: 'phenethylamine',
    effects: ['psychedelic', 'empathogenic'],
    sourceHerbs: ['lophophora-williamsii'],
    toxicityWarning: 'High doses may cause nausea and anxiety',
  },
  {
    name: 'Psilocybin',
    class: 'tryptamine',
    effects: ['psychedelic'],
    sourceHerbs: ['psilocybe-cubensis'],
    notes: 'Converted to psilocin in the body',
  },
  {
    name: 'Mitragynine',
    class: 'indole alkaloid',
    effects: ['stimulant', 'analgesic'],
    sourceHerbs: ['kratom-hybrids'],
  },
  {
    name: 'Harmine',
    class: 'beta-carboline',
    effects: ['MAOI', 'psychedelic potentiator'],
    sourceHerbs: ['banisteriopsis-caapi'],
  },
  {
    name: 'Thujone',
    class: 'monoterpene',
    effects: ['GABA antagonist'],
    sourceHerbs: ['salvia-apiana', 'achillea-millefolium'],
    toxicityWarning: 'Convulsant at high doses',
  },
]

export default compounds
