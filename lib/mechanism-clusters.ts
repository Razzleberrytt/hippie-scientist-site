const CLUSTERS: Record<string, string[]> = {
  'Inflammatory Signaling': [
    'nf-kb',
    'cox',
    'inflamm',
    'cytokine',
    'tnf',
    'il-6',
    'immune',
  ],
  'Oxidative Stress': [
    'oxidative',
    'antioxid',
    'ros',
    'glutathione',
    'free radical',
  ],
  'Mitochondrial Support': [
    'mitochond',
    'atp',
    'cellular energy',
    'electron transport',
  ],
  'Neurotransmitter Modulation': [
    'dopamine',
    'serotonin',
    'gaba',
    'acetylcholine',
    'nmda',
    'neurotransmitter',
  ],
  'Metabolic Regulation': [
    'insulin',
    'glucose',
    'ampk',
    'metabolic',
    'lipid',
  ],
  'Vascular Function': [
    'nitric oxide',
    'vascular',
    'endothelial',
    'circulation',
    'blood flow',
  ],
  'Cellular Protection': [
    'apoptosis',
    'cellular protection',
    'dna',
    'cytoprotect',
    'heat shock',
  ],
}

export function clusterMechanisms(mechanisms: string[] = []) {
  const normalized = mechanisms.filter(Boolean)

  const grouped = Object.entries(CLUSTERS)
    .map(([cluster, keywords]) => {
      const matches = normalized.filter(item => {
        const lower = item.toLowerCase()
        return keywords.some(keyword => lower.includes(keyword))
      })

      return {
        cluster,
        items: Array.from(new Set(matches)),
      }
    })
    .filter(group => group.items.length > 0)

  const assigned = new Set(grouped.flatMap(group => group.items))

  const uncategorized = normalized.filter(item => !assigned.has(item))

  if (uncategorized.length > 0) {
    grouped.push({
      cluster: 'Additional Mechanisms',
      items: uncategorized.slice(0, 6),
    })
  }

  return grouped
}
