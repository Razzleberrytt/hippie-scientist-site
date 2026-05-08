type DiscoveryGroup = {
  title: string
  description: string
  items: any[]
}

function normalize(value: any): string[] {
  if (!value) return []

  const array = Array.isArray(value) ? value : [value]

  return array
    .map(item => String(item).trim().toLowerCase())
    .filter(Boolean)
}

function overlap(a: string[], b: string[]) {
  return a.filter(item => b.includes(item)).length
}

export function classifyDiscoveryGroups(base: any, relatedRecords: any[] = []): DiscoveryGroup[] {
  const baseEffects = normalize(base?.primary_effects || base?.effects)
  const baseMechanisms = normalize(base?.mechanisms)
  const basePathways = normalize(base?.pathways)

  const mechanismMatches: any[] = []
  const pathwayMatches: any[] = []
  const evidenceMatches: any[] = []
  const contextualMatches: any[] = []

  relatedRecords.forEach(record => {
    const effects = normalize(record?.primary_effects || record?.effects)
    const mechanisms = normalize(record?.mechanisms)
    const pathways = normalize(record?.pathways)

    const mechanismOverlap = overlap(baseMechanisms, mechanisms)
    const pathwayOverlap = overlap(basePathways, pathways)
    const effectOverlap = overlap(baseEffects, effects)

    if (mechanismOverlap >= 2) {
      mechanismMatches.push(record)
    }

    if (pathwayOverlap >= 1) {
      pathwayMatches.push(record)
    }

    if (/strong|moderate|clinical|human/i.test(String(record?.evidence_tier || ''))) {
      evidenceMatches.push(record)
    }

    if (effectOverlap >= 1 || mechanismOverlap >= 1 || pathwayOverlap >= 1) {
      contextualMatches.push(record)
    }
  })

  const dedupe = (items: any[]) => {
    const seen = new Set()

    return items.filter(item => {
      if (!item?.slug || seen.has(item.slug)) return false
      seen.add(item.slug)
      return true
    })
  }

  return [
    {
      title: 'Mechanistically Adjacent',
      description: 'These profiles share overlapping signaling pathways or biological-response mechanisms.',
      items: dedupe(mechanismMatches).slice(0, 4),
    },
    {
      title: 'Pathway Companions',
      description: 'Frequently explored in overlapping pathway-oriented research contexts.',
      items: dedupe(pathwayMatches).slice(0, 4),
    },
    {
      title: 'Similar Evidence Profiles',
      description: 'Profiles with comparable evidence maturity or human-research depth.',
      items: dedupe(evidenceMatches).slice(0, 4),
    },
    {
      title: 'Research Context Profiles',
      description: 'Related profiles commonly discussed alongside overlapping mechanisms or effects.',
      items: dedupe(contextualMatches).slice(0, 6),
    },
  ].filter(group => group.items.length > 0)
}
