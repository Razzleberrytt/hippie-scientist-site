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

const CADENCE_VARIATIONS = [
  'The surrounding evidence landscape remains nuanced rather than absolute.',
  'Interpretation quality improves when evidence maturity and mechanism plausibility are separated clearly.',
  'Contextual framing is important because adjacent profiles can differ substantially despite superficial similarity.',
]

const ECOSYSTEM_VARIATIONS = [
  'Knowledge-graph continuity improves interpretation by connecting related pathways, compounds, and mechanisms.',
  'Ecosystem-level interpretation helps contextualize where this profile sits among adjacent evidence clusters.',
  'Semantic continuity across neighboring profiles improves comparative interpretation quality.',
]

const COMPARISON_VARIATIONS = [
  'Comparison-aware interpretation helps distinguish mechanistic overlap from clinically meaningful overlap.',
  'Profiles with similar mechanisms can still differ substantially in evidence maturity and outcome certainty.',
  'Adjacent compounds and herbs may appear superficially similar while diverging meaningfully in evidence quality.',
]

const FLAGSHIP_VARIATIONS = [
  'Higher-quality interpretation emerges when evidence hierarchy, mechanism plausibility, and ecosystem continuity are evaluated together.',
  'Flagship profiles should prioritize calibrated interpretation over overstated certainty or simplified conclusions.',
  'Authority-style scientific interpretation depends on maintaining separation between mechanism language and direct outcome evidence.',
]

const AUTHORITY_VARIATIONS = [
  'Authority-grade profiles should reinforce contextual interpretation instead of isolated claims.',
  'Scientific editorial quality improves when semantic continuity and evidence hierarchy remain aligned.',
  'Higher-trust interpretation depends on maintaining calibrated language across neighboring scientific profiles.',
]

function rotateVariation(values: string[], seed: string) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return values[total % values.length]
}

function cadenceLine(seed: string) {
  return rotateVariation(CADENCE_VARIATIONS, seed)
}

function ecosystemLine(seed: string) {
  return rotateVariation(ECOSYSTEM_VARIATIONS, seed)
}

function comparisonLine(seed: string) {
  return rotateVariation(COMPARISON_VARIATIONS, seed)
}

function flagshipLine(seed: string) {
  return rotateVariation(FLAGSHIP_VARIATIONS, seed)
}

function authorityLine(seed: string) {
  return rotateVariation(AUTHORITY_VARIATIONS, seed)
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
  return formatDisplayLabel(firstText(record?.evidence_tier, record?.evidenceTier, record?.confidence, 'Evidence context available'))
}

function evidenceTone(evidence: string): EditorialNarrative['tone'] {
  if (STRONG_EVIDENCE_PATTERN.test(evidence)) return 'strong'
  if (MODERATE_EVIDENCE_PATTERN.test(evidence)) return 'moderate'
  return 'neutral'
}

export function buildWhyItMatters(record: any, entityType: EditorialEntityType, summary: string, effects: string[]): EditorialNarrative {
  const focus = cleanEditorialItems([...list(record?.best_for), ...effects], 4)
  const name = formatDisplayLabel(record?.name || record?.slug)
  const tone = evidenceTone(evidenceLabel(record))

  if (focus.length > 0) {
    const variation = rotateVariation(WHY_VARIATIONS, name)
      .replace('%NAME%', name)
      .replace('%FOCUS%', focus.join(', '))

    return {
      title: 'Why It Matters',
      body: `${variation} ${cadenceLine(name)} ${comparisonLine(name)} ${ecosystemLine(name)} ${flagshipLine(name)} ${authorityLine(name)}`,
      chips: focus,
      tone,
    }
  }

  return {
    title: 'Why It Matters',
    body: summary || `This ${entityType} profile emphasizes evidence maturity, mechanism plausibility, and contextual interpretation rather than simplistic claims.`,
    chips: [],
    tone,
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
  ], 6)

  const mechanisms = cleanEditorialItems([
    ...providedMechanisms,
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ], 8)

  const summary = cleanSummary(providedSummary || record?.summary || record?.description || '', entityType)

  return {
    effects,
    mechanisms,
    summary,
    decisionSnapshot: [
      { label: 'Evidence strength', value: evidenceLabel(record) },
      { label: 'Interpretation stance', value: 'Conservative and evidence-calibrated' },
      { label: 'Semantic context', value: 'Comparison and ecosystem aware' },
    ],
    whyItMatters: buildWhyItMatters(record, entityType, summary, effects),
    researchConfidence: {
      title: 'Research Confidence',
      body: `${cadenceLine(summary)} ${comparisonLine(summary)} ${flagshipLine(summary)} ${authorityLine(summary)} Human evidence quality varies substantially across domains and outcomes.`,
      chips: effects.slice(0, 4),
      tone: evidenceTone(evidenceLabel(record)),
    },
    mechanismNarrative: {
      title: 'Potential Mechanisms',
      body: `${cadenceLine(mechanisms.join(','))} ${ecosystemLine(mechanisms.join(','))} ${comparisonLine(mechanisms.join(','))} ${flagshipLine(mechanisms.join(','))} ${authorityLine(mechanisms.join(','))} Mechanistic interpretation should remain secondary to direct outcome evidence.`,
      chips: mechanisms.slice(0, 6),
      tone: mechanisms.length >= 3 ? 'moderate' : 'neutral',
    },
    safetyNarrative: {
      title: 'Safety Interpretation',
      body: `Safety framing remains intentionally separated from benefit framing so the profile does not overstate certainty. ${comparisonLine('safety')} ${flagshipLine('safety')} ${authorityLine('safety')}`,
      chips: [],
      tone: CAUTION_PATTERN.test(summary) ? 'caution' : 'neutral',
    },
  }
}
