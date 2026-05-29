type EditorialInput = {
  name?: string
  evidenceTier?: string
  effects?: string[]
  mechanisms?: string[]
  safety?: string[]
  density?: string
  seed?: string
}

function clean(items?: string[], limit = 4) {
  return (items || []).map(item => String(item).trim()).filter(Boolean).slice(0, limit)
}

function join(items: string[]) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function variant(input: EditorialInput, count: number) {
  const seed = `${input.seed || input.name || ''}${input.evidenceTier || ''}${input.density || ''}`
  return Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % count
}

function evidenceTone(input: EditorialInput) {
  const evidence = `${input.evidenceTier || ''} ${input.density || ''}`.toLowerCase()

  if (/\b(strong|high|clinical|human|comprehensive|grade\s*a|tier\s*a)\b/.test(evidence)) return 'strong'
  if (/\b(moderate|developing|grade\s*b|tier\s*b)\b/.test(evidence)) return 'moderate'
  return 'weak'
}

export function buildVariedSummary(input: EditorialInput) {
  const effects = clean(input.effects, 3)
  const mechanisms = clean(input.mechanisms, 3)
  const focus = mechanisms.length > 0 ? mechanisms : effects
  const tone = evidenceTone(input)

  if (focus.length === 0) {
    return tone === 'weak'
      ? 'This profile is framed conservatively because structured evidence signals remain limited.'
      : 'Evidence context is presented with restraint and separated from practical interpretation.'
  }

  const choices = [
    tone === 'strong'
      ? effects.length > 0
        ? `The strongest profile signals cluster around ${join(effects)} while mechanism notes add context around ${join(focus)}.`
        : `The strongest profile signals are organized around ${join(focus)}, with safety and context still kept visible.`
      : `This profile is best read through a cautious lens: ${join(focus)} are research-context signals, not settled clinical claims.`,
    tone === 'strong'
      ? effects.length > 0
        ? `Human-facing evidence signals give this profile more editorial weight, especially around ${join(effects)}.`
        : `Human-facing evidence signals give this profile more editorial weight without turning mechanism context into advice.`
      : `Current coverage leans exploratory, with ${join(focus)} providing biological plausibility rather than proof of effect.`,
    tone === 'strong'
      ? `Evidence maturity is comparatively higher here, though safety and applicability still require context.`
      : `The useful reading frame is mechanistic and evidence-informed, with restraint around practical conclusions.`,
  ]

  return choices[variant(input, choices.length)]
}

export function buildVariedEvidenceFraming(input: EditorialInput) {
  const tone = evidenceTone(input)

  if (tone === 'strong') {
    return variant(input, 2) === 0
      ? 'Human research signals are surfaced first, with mechanism notes treated as supporting context.'
      : 'Clinical-leaning evidence is given more weight while avoiding treatment-style conclusions.'
  }

  if (tone === 'moderate') {
    return variant(input, 2) === 0
      ? 'Evidence is mixed enough to separate practical interest from stronger efficacy language.'
      : 'Moderate signals are presented with caveats where mechanism or study depth remains incomplete.'
  }

  return variant(input, 2) === 0
    ? 'Evidence appears early or incomplete, so the profile emphasizes exploratory context over outcomes.'
    : 'Mechanistic plausibility is kept distinct from clinical confidence to avoid overstatement.'
}

export function buildVariedMechanismFraming(input: EditorialInput) {
  const mechanisms = clean(input.mechanisms, 4)
  if (mechanisms.length === 0) return ''

  return variant(input, 2) === 0
    ? `Mechanism discussion centers on ${join(mechanisms)}, framed as plausibility signals rather than standalone proof.`
    : `${join(mechanisms)} help organize the biology, but they should be read below the evidence-strength layer.`
}

export function buildVariedPracticalRelevance(input: EditorialInput) {
  const effects = clean(input.effects, 3)
  if (effects.length === 0) return ''

  return evidenceTone(input) === 'weak'
    ? `Interest around ${join(effects)} remains exploratory and should not be read as a recommendation.`
    : `Practical interest most often centers on ${join(effects)}, with safety context kept visible and non-prescriptive.`
}
