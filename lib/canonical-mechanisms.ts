import { clusterMechanisms } from './mechanism-clusters'

export const CANONICAL_MECHANISMS: Record<string, string> = {
  'inflammatory signaling modulation': 'Inflammatory Signaling',
  'nf-kb modulation': 'Inflammatory Signaling',
  'nf-kb': 'Inflammatory Signaling',
  'metabolic regulation': 'Metabolic Regulation',
  'oxidative stress modulation': 'Oxidative Stress',
  'stress response modulation': 'Stress Response Modulation',
  'neurotransmitter modulation': 'Neurotransmitter Modulation',
  'neuroprotective activity': 'Cellular Protection',
  'mitochondrial support': 'Mitochondrial Support',
  'immune signaling modulation': 'Inflammatory Signaling',
  'ampk signaling': 'Metabolic Regulation',
  'hormonal signaling context': 'Metabolic Regulation',
  'lipid metabolism support': 'Metabolic Regulation',
  'glucose metabolism support': 'Metabolic Regulation',
  'nrf2 activation': 'Oxidative Stress',
  'cellular protection': 'Cellular Protection',
  'endothelial function support': 'Vascular Function',
  'mtor signaling': 'Metabolic Regulation',
}

export function normalizeMechanism(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  const lower = trimmed.toLowerCase()
  if (CANONICAL_MECHANISMS[lower]) {
    return CANONICAL_MECHANISMS[lower]
  }
  
  // Try fuzzy match ignoring symbols
  const cleanLower = lower.replace(/[^a-z0-9]/g, '')
  for (const [key, value] of Object.entries(CANONICAL_MECHANISMS)) {
    if (key.replace(/[^a-z0-9]/g, '') === cleanLower) {
      return value
    }
  }

  // Fallback to title case cleaning (replacing dashes/underscores with spaces)
  return trimmed
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function getMechanismCluster(mechanism: string): string[] {
  const normalized = normalizeMechanism(mechanism)
  const allTerms = Array.from(new Set([
    ...Object.values(CANONICAL_MECHANISMS),
    normalized,
    mechanism,
  ]))
  
  const groups = clusterMechanisms(allTerms)
  const match = groups.find((g) => 
    g.items.includes(normalized) || 
    g.items.includes(mechanism) ||
    g.items.some(item => item.toLowerCase() === mechanism.toLowerCase())
  )
  return match ? match.items : [normalized]
}
