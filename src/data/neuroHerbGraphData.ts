export interface NeuroHerbNode {
  id: string
  label: string
  type: 'neuro' | 'herb'
  slug?: string
  effect?: string
}

export interface NeuroHerbLink {
  source: string
  target: string
}

export interface NeuroHerbGraphData {
  nodes: NeuroHerbNode[]
  links: NeuroHerbLink[]
}

export const neuroHerbGraphData: NeuroHerbGraphData = {
  nodes: [
    { id: 'serotonin', label: 'Serotonin', type: 'neuro' },
    { id: 'dopamine', label: 'Dopamine', type: 'neuro' },
    { id: 'gaba', label: 'GABA', type: 'neuro' },
    { id: 'acetylcholine', label: 'Acetylcholine', type: 'neuro' },

    { id: 'banisteriopsis-caapi', label: 'Banisteriopsis caapi', slug: 'banisteriopsis-caapi', effect: 'MAOI', type: 'herb' },
    { id: 'sceletium-tortuosum', label: 'Kanna', slug: 'sceletium-tortuosum', effect: 'SSRI-like', type: 'herb' },
    { id: 'mucuna-pruriens', label: 'Mucuna pruriens', slug: 'mucuna-pruriens', effect: 'L-DOPA', type: 'herb' },
    { id: 'nymphaea-caerulea', label: 'Blue Lotus', slug: 'nymphaea-caerulea', effect: 'Dopamine agonist', type: 'herb' },
    { id: 'passiflora-incarnata', label: 'Passionflower', slug: 'passiflora-incarnata', effect: 'GABA agonist', type: 'herb' },
    { id: 'piper-methysticum', label: 'Kava', slug: 'piper-methysticum', effect: 'GABAergic', type: 'herb' },
    { id: 'bacopa-monnieri', label: 'Bacopa monnieri', slug: 'bacopa-monnieri', effect: 'Cholinergic', type: 'herb' },
    { id: 'huperzia-serrata', label: 'Huperzia serrata', slug: 'huperzia-serrata', effect: 'AChE inhibitor', type: 'herb' }
  ],
  links: [
    { source: 'serotonin', target: 'banisteriopsis-caapi' },
    { source: 'serotonin', target: 'sceletium-tortuosum' },
    { source: 'dopamine', target: 'mucuna-pruriens' },
    { source: 'dopamine', target: 'nymphaea-caerulea' },
    { source: 'gaba', target: 'passiflora-incarnata' },
    { source: 'gaba', target: 'piper-methysticum' },
    { source: 'acetylcholine', target: 'bacopa-monnieri' },
    { source: 'acetylcholine', target: 'huperzia-serrata' }
  ]
}

export default neuroHerbGraphData
