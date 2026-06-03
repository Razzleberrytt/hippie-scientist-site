import { buildVariedEvidenceFraming, buildVariedMechanismFraming, buildVariedPracticalRelevance, buildVariedSummary } from '@/lib/editorial-variation'

type SynthesisInput = {
  name?: string
  seed?: string
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
  const pathways = clean(input.pathways)
  const contextSignals = mechanisms.length > 0 ? mechanisms : pathways.length > 0 ? pathways : effects
  const varied = buildVariedSummary(input)
  if (varied) return varied

  const tone = getEvidenceTone(input.evidenceTier, input.density)

  if (tone === 'strong' && contextSignals.length > 0) {
    const focus = effects.length > 0 ? joinNatural(effects) : joinNatural(contextSignals)
    const mechanismFocus = contextSignals.length > 0 ? ` with additional focus on ${joinNatural(contextSignals)} pathways` : ''
    return `Research interest is strongest around ${focus}${mechanismFocus}.`
  }

  if (tone === 'moderate' && contextSignals.length > 0) {
    const focus = effects.length > 0 ? joinNatural(effects) : joinNatural(contextSignals)
    const mechanismFocus = contextSignals.length > 0 ? ` alongside mechanistic interest in ${joinNatural(contextSignals)}` : ''
    return `Current research most commonly explores ${focus}${mechanismFocus}.`
  }

  if (contextSignals.length > 0) {
    return `This profile is framed as mechanistic or exploratory context involving ${joinNatural(contextSignals)}, not as settled clinical guidance.`
  }

  return 'This profile is framed conservatively because only limited runtime context is available; interpretation should stay exploratory rather than clinical.'
}

export function buildMechanismContext(input: SynthesisInput) {
  const mechanisms = clean(input.mechanisms, 5)
  const varied = buildVariedMechanismFraming(input)

  if (varied) return varied
  if (mechanisms.length === 0) return ''

  return `Mechanistic interest centers on ${joinNatural(mechanisms)}, framed as biological plausibility rather than standalone proof.`
}

export function buildEvidenceContext(input: SynthesisInput) {
  const varied = buildVariedEvidenceFraming(input)
  if (varied) return varied

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
  const varied = buildVariedPracticalRelevance(input)

  if (varied) return varied
  if (effects.length === 0) return ''

  return `Research and public interest most commonly focus on ${joinNatural(effects)}, with interpretation calibrated to evidence strength.`
}

export function buildDiscoveryNarrative(relatedCount: number, input: SynthesisInput = {}) {
  if (relatedCount <= 0) return ''

  const tone = getEvidenceTone(input.evidenceTier, input.density)

  if (relatedCount <= 3) {
    return tone === 'emerging'
      ? 'A compact set of related profiles is shown so exploratory context stays focused rather than inflated.'
      : 'A small set of closely related profiles share overlapping mechanisms, cautions, or research themes.'
  }

  if (tone === 'strong') {
    return 'Related profiles are prioritized for comparable evidence maturity, shared mechanisms, and caution-aware context.'
  }

  return 'Related profiles below emphasize mechanism fit and careful comparison rather than implying equivalent clinical confidence.'
}
