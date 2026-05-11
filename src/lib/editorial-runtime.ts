import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

export type EditorialEntityType = 'herb' | 'compound'

export type EditorialNarrative = {
  title: string
  body: string
  chips: string[]
  tone: 'strong' | 'moderate' | 'caution' | 'neutral'
}

export type DecisionSnapshotItem = {
  label: string
  value: string
}

export type EditorialProfile = {
  effects: string[]
  mechanisms: string[]
  summary: string
  decisionSnapshot: DecisionSnapshotItem[]
  whyItMatters: EditorialNarrative
  researchConfidence: EditorialNarrative
  mechanismNarrative: EditorialNarrative
  safetyNarrative: EditorialNarrative
}

const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i
const STRONG_EVIDENCE_PATTERN = /strong|high|clinical|human|meta|systematic|rct/i
const MODERATE_EVIDENCE_PATTERN = /moderate|promising|developing|limited|mixed/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i

const WHY_VARIATIONS = [
  'Interest in %NAME% largely centers around %FOCUS%.',
  '%NAME% is most commonly discussed in contexts involving %FOCUS%.',
  'Research attention around %NAME% frequently focuses on %FOCUS%.',
  '%NAME% is frequently evaluated in relation to %FOCUS%.',
]

const MECHANISM_VARIATIONS = [
  'Research attention centers around %MECHANISMS%.',
  'Mechanistic discussion commonly focuses on %MECHANISMS%.',
  'Biological interpretation often references %MECHANISMS%.',
  'Mechanistic hypotheses frequently involve %MECHANISMS%.',
]

const UNCERTAINTY_VARIATIONS = [
  'Interpretation should remain conservative because study quality and reproducibility vary.',
  'Outcome certainty still depends heavily on formulation, population, and research design.',
  'Mechanistic plausibility should not automatically be interpreted as clinical confirmation.',
]

const COMPARISON_VARIATIONS = [
  'Interpretation quality improves when this profile is compared against adjacent mechanisms and evidence tiers.',
  'Contextual comparison is important because outcome framing can vary substantially across neighboring compounds and herbs.',
  'Comparison-aware interpretation helps separate mechanistic similarity from clinically meaningful similarity.',
]

const ECOSYSTEM_VARIATIONS = [
  'This profile becomes more informative when interpreted within the broader semantic ecosystem surrounding related pathways and compounds.',
  'Ecosystem-level interpretation helps contextualize where this profile sits within adjacent research clusters.',
  'Knowledge-graph continuity improves interpretation by connecting this profile to neighboring mechanism and outcome domains.',
]

function rotateVariation(values: string[], seed: string) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return values[total % values.length]
}

function uncertaintyLine(seed: string) {
  return rotateVariation(UNCERTAINTY_VARIATIONS, seed)
}

function comparisonLine(seed: string) {
  return rotateVariation(COMPARISON_VARIATIONS, seed)
}

function ecosystemLine(seed: string) {
  return rotateVariation(ECOSYSTEM_VARIATIONS, seed)
}

export function cleanEditorialItems(value: unknown, limit = 6) {
  return unique(
    list(value)
      .map(formatDisplayLabel)
      .map((item) => item.trim())
      .filter((item) => isClean(item) && !WEAK_PATTERN.test(item)),
  ).slice(0, limit)
}

function firstText(...values: unknown[]) {
  return values.map(text).find(Boolean) || ''
}

function evidenceLabel(record: any) {
  return formatDisplayLabel(
    firstText(
      record?.evidence_tier,
      record?.evidenceTier,
      record?.evidence_grade,
      record?.evidenceLevel,
      record?.confidenceTier,
      record?.confidence,
      'Evidence context available',
    ),
  )
}

function safetyLabel(record: any) {
  return formatDisplayLabel(
    firstText(
      record?.safety_level,
      record?.safetyLevel,
      record?.safety_rating,
      record?.safetyRating,
      record?.safety,
      'Safety context available',
    ),
  )
}

function timeLabel(record: any) {
  return formatDisplayLabel(
    firstText(
      record?.time_to_effect,
      record?.timeToEffect,
      record?.onset,
      record?.typical_research_window,
      record?.research_window,
      'Varies by outcome and study context',
    ),
  )
}

function mechanismConfidence(record: any, mechanisms: string[]) {
  const explicit = firstText(record?.mechanism_confidence, record?.mechanismConfidence)
  if (explicit) return formatDisplayLabel(explicit)
  if (mechanisms.length >= 5) return 'Developed mechanistic context'
  if (mechanisms.length >= 3) return 'Moderate mechanistic context'
  if (mechanisms.length > 0) return 'Preliminary mechanistic context'
  return 'Mechanism context limited'
}

function bestFor(record: any, effects: string[]) {
  return cleanEditorialItems([
    ...list(record?.best_for),
    ...list(record?.bestFor),
    ...list(record?.primary_effects),
    ...effects,
  ], 4)
}

function cautionSignals(record: any) {
  return cleanEditorialItems([
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.contraindications),
    ...list(record?.interactions),
    text(record?.safetyNotes),
  ], 4)
}

function evidenceTone(evidence: string): EditorialNarrative['tone'] {
  if (STRONG_EVIDENCE_PATTERN.test(evidence)) return 'strong'
  if (MODERATE_EVIDENCE_PATTERN.test(evidence)) return 'moderate'
  return 'neutral'
}

function safetyTone(safety: string, cautions: string[]): EditorialNarrative['tone'] {
  if (cautions.length > 0 || CAUTION_PATTERN.test(safety)) return 'caution'
  return 'neutral'
}

export function buildDecisionSnapshot(record: any, effects: string[], mechanisms: string[]): DecisionSnapshotItem[] {
  const evidence = evidenceLabel(record)
  const safety = safetyLabel(record)
  const bestForItems = bestFor(record, effects)

  return [
    { label: 'Evidence strength', value: evidence },
    { label: 'Safety profile', value: safety },
    { label: 'Research window', value: timeLabel(record) },
    { label: 'Mechanism confidence', value: mechanismConfidence(record, mechanisms) },
    {
      label: 'Best known for',
      value: bestForItems.length > 0 ? bestForItems.slice(0, 3).join(', ') : 'Outcome context still developing',
    },
    { label: 'Interpretation stance', value: 'Conservative, educational, and evidence-calibrated' },
  ]
}

export function buildWhyItMatters(record: any, entityType: EditorialEntityType, summary: string, effects: string[]): EditorialNarrative {
  const focus = bestFor(record, effects)
  const name = formatDisplayLabel(record?.name || record?.slug)
  const evidence = evidenceLabel(record)
  const tone = evidenceTone(evidence)

  if (focus.length > 0) {
    const variation = rotateVariation(WHY_VARIATIONS, name)
      .replace('%NAME%', name)
      .replace('%FOCUS%', focus.slice(0, 4).join(', '))

    return {
      title: 'Why It Matters',
      body: `${variation} ${uncertaintyLine(name)} ${comparisonLine(name)} ${ecosystemLine(name)}`,
      chips: focus,
      tone,
    }
  }

  return {
    title: 'Why It Matters',
    body: summary || `This ${entityType} profile separates practical interest, mechanism plausibility, evidence maturity, and safety context in a compact editorial layer.`,
    chips: [],
    tone,
  }
}

export function buildResearchConfidence(record: any, effects: string[]): EditorialNarrative {
  const strongest = cleanEditorialItems([
    ...list(record?.strongest_evidence_for),
    ...list(record?.human_evidence_for),
    ...list(record?.primary_effects),
    ...effects,
  ], 3)

  const mixed = cleanEditorialItems([
    ...list(record?.less_compelling_for),
    ...list(record?.mixed_evidence_for),
    ...list(record?.research_gaps),
  ], 3)

  const evidence = evidenceLabel(record)
  const tone = evidenceTone(evidence)

  const leading = strongest.length > 0
    ? tone === 'strong'
      ? `Human evidence appears relatively mature for ${strongest.join(', ')}.`
      : tone === 'moderate'
        ? `Evidence appears most relevant for ${strongest.join(', ')}, though study quality and reproducibility still vary.`
        : `Interest persists around ${strongest.join(', ')}, though outcome certainty remains limited.`
    : tone === 'strong'
      ? 'Human evidence appears more developed here than on many early-stage profiles, though outcome framing should remain specific.'
      : tone === 'moderate'
        ? 'Evidence quality varies by formulation, study context, population, and outcome target.'
        : 'Evidence should be interpreted conservatively, especially where mechanism language is stronger than direct outcome data.'

  const qualifier = mixed.length > 0
    ? ` Evidence remains less settled for ${mixed.join(', ')}.`
    : ` ${uncertaintyLine(evidence)}`

  return {
    title: 'Research Confidence',
    body: `${leading}${qualifier} ${comparisonLine(evidence)} ${ecosystemLine(evidence)}`,
    chips: [...strongest, ...mixed].slice(0, 5),
    tone,
  }
}

export function buildMechanismNarrative(record: any, mechanisms: string[]): EditorialNarrative {
  const confidence = mechanismConfidence(record, mechanisms)

  if (mechanisms.length === 0) {
    return {
      title: 'Potential Mechanisms',
      body: 'Mechanism context is limited in the current runtime data, so the profile should lean more heavily on evidence maturity and safety framing.',
      chips: [],
      tone: 'neutral',
    }
  }

  const variation = rotateVariation(MECHANISM_VARIATIONS, mechanisms.join(','))
    .replace('%MECHANISMS%', mechanisms.slice(0, 4).join(', '))

  const body = mechanisms.length >= 5
    ? `${variation} These pathways provide stronger biological context than many lightweight profiles, though mechanistic interpretation still should not be treated as clinical proof.`
    : mechanisms.length >= 3
      ? `${variation} These mechanisms help explain biological plausibility, but mechanism framing alone is not the same as direct outcome evidence.`
      : `${variation} This is useful for biological interpretation, but the mechanism layer should remain secondary to outcome evidence.`

  return {
    title: 'Potential Mechanisms',
    body: `${body} ${comparisonLine(mechanisms.join(','))} ${ecosystemLine(mechanisms.join(','))}`,
    chips: mechanisms.slice(0, 6),
    tone: confidence.toLowerCase().includes('limited') ? 'neutral' : 'moderate',
  }
}

export function buildSafetyNarrative(record: any): EditorialNarrative {
  const safety = safetyLabel(record)
  const cautions = cautionSignals(record)

  if (cautions.length > 0) {
    return {
      title: 'Safety Interpretation',
      body: `Safety context highlights ${cautions.slice(0, 3).join(', ')}. Interpretation should remain conservative and account for dose, formulation, population, and interaction context.`,
      chips: cautions,
      tone: 'caution',
    }
  }

  return {
    title: 'Safety Interpretation',
    body: safety && !WEAK_PATTERN.test(safety)
      ? `${safety}. Safety framing is intentionally separated from benefit framing so the profile does not overstate certainty.`
      : 'Safety context is presented conservatively and separately from benefit framing to avoid overstating certainty.',
    chips: [],
    tone: safetyTone(safety, cautions),
  }
}

export function buildEditorialProfile({
  record,
  entityType,
  effects: providedEffects = [],
  mechanisms: providedMechanisms = [],
  summary: providedSummary = '',
}: {
  record: any
  entityType: EditorialEntityType
  effects?: string[]
  mechanisms?: string[]
  summary?: string
}): EditorialProfile {
  const effects = cleanEditorialItems([
    ...providedEffects,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.primaryActions),
  ], 6)

  const mechanisms = cleanEditorialItems([
    ...providedMechanisms,
    ...list(record?.mechanisms),
    ...list(record?.primary_mechanisms),
    ...list(record?.pathways),
    ...list(record?.mechanism_targets),
  ], 8)

  const summary = cleanSummary(
    providedSummary || record?.summary || record?.description || '',
    entityType,
  )

  return {
    effects,
    mechanisms,
    summary,
    decisionSnapshot: buildDecisionSnapshot(record, effects, mechanisms),
    whyItMatters: buildWhyItMatters(record, entityType, summary, effects),
    researchConfidence: buildResearchConfidence(record, effects),
    mechanismNarrative: buildMechanismNarrative(record, mechanisms),
    safetyNarrative: buildSafetyNarrative(record),
  }
}
