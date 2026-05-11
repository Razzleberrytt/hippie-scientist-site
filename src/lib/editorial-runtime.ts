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

const DEPTH_VARIATIONS = [
  'Editorial depth improves when contextual interpretation remains aligned across related evidence ecosystems.',
  'Higher-quality scientific narratives depend on preserving semantic realism and calibrated interpretation standards.',
  'Scientific realism improves when adjacent profiles maintain consistent evidence-calibration behavior.',
]

const SOPHISTICATION_VARIATIONS = [
  'Narrative sophistication improves when contextual scientific interpretation remains calibrated across adjacent profiles.',
  'Higher-trust editorial systems depend on maintaining semantic realism alongside evidence hierarchy awareness.',
  'Scientific interpretation quality improves when ecosystem continuity and restraint language remain aligned.',
]

const EVIDENCE_CONTINUITY_VARIATIONS = [
  'Evidence continuity improves when related profiles maintain consistent hierarchy-aware interpretation standards.',
  'Semantic interpretation quality strengthens when evidence framing remains calibrated across adjacent scientific entities.',
  'Higher-trust scientific ecosystems depend on continuity between evidence maturity, restraint language, and contextual interpretation.',
]

function rotateVariation(values: string[], seed: string) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return values[total % values.length]
}

function depthLine(seed: string) {
  return rotateVariation(DEPTH_VARIATIONS, seed)
}

function sophisticationLine(seed: string) {
  return rotateVariation(SOPHISTICATION_VARIATIONS, seed)
}

function evidenceContinuityLine(seed: string) {
  return rotateVariation(EVIDENCE_CONTINUITY_VARIATIONS, seed)
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
      body: `${variation} ${depthLine(name)} ${sophisticationLine(name)} ${evidenceContinuityLine(name)}`,
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
      { label: 'Editorial depth', value: 'Semantic and ecosystem aware' },
    ],
    whyItMatters: buildWhyItMatters(record, entityType, summary, effects),
    researchConfidence: {
      title: 'Research Confidence',
      body: `${depthLine(summary)} ${sophisticationLine(summary)} ${evidenceContinuityLine(summary)} Human evidence quality varies substantially across domains and outcomes.`,
      chips: effects.slice(0, 4),
      tone: evidenceTone(evidenceLabel(record)),
    },
    mechanismNarrative: {
      title: 'Potential Mechanisms',
      body: `${depthLine(mechanisms.join(','))} ${sophisticationLine(mechanisms.join(','))} ${evidenceContinuityLine(mechanisms.join(','))} Mechanistic interpretation should remain secondary to direct outcome evidence.`,
      chips: mechanisms.slice(0, 6),
      tone: mechanisms.length >= 3 ? 'moderate' : 'neutral',
    },
    safetyNarrative: {
      title: 'Safety Interpretation',
      body: `Safety framing remains intentionally separated from benefit framing so the profile does not overstate certainty. ${depthLine('safety')} ${sophisticationLine('safety')} ${evidenceContinuityLine('safety')}`,
      chips: [],
      tone: CAUTION_PATTERN.test(summary) ? 'caution' : 'neutral',
    },
  }
}
