type SynthesisInput = {
  summary?: string
  evidenceTier?: string
  effects?: string[]
  mechanisms?: string[]
  pathways?: string[]
  safety?: string[]
  density?: 'comprehensive' | 'developing' | 'concise' | string
}

function clean(items?: string[], limit = 4) {
  return (items || [])
    .map(item => String(item).trim())
    .filter(Boolean)
    .slice(0, limit)
}

function joinNatural(items: string[]) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`

  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function getEvidenceTone(evidenceTier = '', density = '') {
  const evidence = `${evidenceTier} ${density}`.toLowerCase()

  if (/strong|clinical|human|comprehensive/.test(evidence)) {
    return 'strong'
  }

  if (/moderate|developing/.test(evidence)) {
    return 'moderate'
  }

  return 'emerging'
}

export function buildScientificSummary(input: SynthesisInput) {
  const effects = clean(input.effects)
  const mechanisms = clean(input.mechanisms)
  const tone = getEvidenceTone(input.evidenceTier, input.density)

  if (tone === 'strong') {
    return `Research interest is strongest around ${joinNatural(effects)} with additional focus on ${joinNatural(mechanisms)} pathways.`
  }

  if (tone === 'moderate') {
    return `Current research most commonly explores ${joinNatural(effects)} alongside mechanistic interest in ${joinNatural(mechanisms)}.`
  }

  return `This profile is primarily discussed in mechanistic and emerging research contexts involving ${joinNatural(mechanisms || effects)}.`
}

export function buildMechanismContext(input: SynthesisInput) {
  const mechanisms = clean(input.mechanisms, 5)

  if (mechanisms.length === 0) return ''

  return `Mechanistic interest frequently centers on ${joinNatural(mechanisms)} signaling pathways and related biological response systems.`
}

export function buildEvidenceContext(input: SynthesisInput) {
  const tone = getEvidenceTone(input.evidenceTier, input.density)

  if (tone === 'strong') {
    return 'Human evidence and clinically oriented research signals appear stronger than purely mechanistic findings.'
  }

  if (tone === 'moderate') {
    return 'Evidence quality appears mixed between mechanistic findings and more limited human research.'
  }

  return 'Current evidence appears largely mechanistic, preliminary, or exploratory rather than strongly clinically established.'
}

export function buildPracticalRelevance(input: SynthesisInput) {
  const effects = clean(input.effects, 3)

  if (effects.length === 0) return ''

  return `Research and public interest most commonly focus on ${joinNatural(effects)} applications.`
}

export function buildDiscoveryNarrative(relatedCount: number) {
  if (relatedCount <= 0) return ''

  if (relatedCount <= 3) {
    return 'A small set of closely related profiles share overlapping mechanisms or research themes.'
  }

  return 'Related profiles below are frequently explored alongside similar pathways, mechanisms, or evidence patterns.'
}
