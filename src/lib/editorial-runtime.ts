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

type SynthesisMode = 'overview' | 'confidence' | 'mechanism' | 'safety'
type EditorialIdentity = 'clinical' | 'exploratory' | 'mixed' | 'translational' | 'cautionary'

type EvidenceSignals = {
  hasStrongEvidence: boolean
  hasModerateEvidence: boolean
  hasPreclinicalSignal: boolean
  hasMixedSignal: boolean
  hasSparseSignal: boolean
  hasCautionSignal: boolean
}

type EditorialContext = {
  identity: EditorialIdentity
  usedKeys: Set<string>
}

const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i
const STRONG_EVIDENCE_PATTERN = /strong|high|clinical|human|meta|systematic|rct/i
const MODERATE_EVIDENCE_PATTERN = /moderate|promising|developing|limited|mixed/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i
const PRECLINICAL_PATTERN = /animal|rodent|mouse|mice|rat|in vitro|cell|preclinical|mechanistic/i
const MIXED_PATTERN = /mixed|conflict|inconsistent|heterogeneous|variable|uncertain|limited/i
const SPARSE_PATTERN = /sparse|limited|preliminary|early|emerging|insufficient|minimal/i

const WHY_VARIATIONS = [
  'Interest in %NAME% largely centers around %FOCUS%.',
  '%NAME% is most commonly discussed in contexts involving %FOCUS%.',
  'Research attention around %NAME% frequently focuses on %FOCUS%.',
  '%NAME% is frequently evaluated in relation to %FOCUS%.',
]

const IDENTITY_CADENCE: Record<EditorialIdentity, string[]> = {
  clinical: [
    'Interpretation still benefits from endpoint discipline and population-aware calibration despite stronger evidence maturity.',
    'Even comparatively mature evidence domains require continued restraint around generalization and real-world variability.',
  ],
  exploratory: [
    'Current interpretation remains exploratory and should not be mistaken for settled clinical consensus.',
    'Scientific interest may exceed the maturity of the underlying evidence ecosystem.',
  ],
  mixed: [
    'The surrounding evidence ecosystem appears directionally inconsistent, limiting interpretive certainty.',
    'Conflicting findings reduce confidence in broad conclusions and favor narrower interpretation.',
  ],
  translational: [
    'Mechanistic plausibility may support continued investigation, but translational certainty remains limited without stronger human replication.',
    'Preclinical coherence should not be interpreted as equivalent to established human outcome evidence.',
  ],
  cautionary: [
    'Interpretation should remain conservative when safety context, exposure variability, or interaction uncertainty remains unresolved.',
    'Population differences and real-world exposure patterns may meaningfully alter interpretation boundaries.',
  ],
}

const SYNTHESIS_LINES: Record<string, string[]> = {
  depth: [
    'Editorial depth improves when contextual interpretation remains aligned across related evidence ecosystems.',
    'Higher-quality scientific narratives depend on preserving semantic realism and calibrated interpretation standards.',
    'Scientific realism improves when adjacent profiles maintain consistent evidence-calibration behavior.',
  ],
  restraint: [
    'Interpretive restraint helps preserve scientific credibility when evidence signals are incomplete or uneven.',
    'Restraint-aware editorial systems reduce the risk of turning plausible mechanisms into overstated conclusions.',
    'Conservative interpretation improves trust when profile evidence varies across outcomes, populations, and study designs.',
  ],
  maturity: [
    'Evidence maturity improves interpretation when profile language distinguishes direct human data from indirect mechanism support.',
    'Scientific authority increases when profile narratives keep early-stage plausibility separate from stronger outcome evidence.',
    'Maturity-aware interpretation helps prevent weak evidence domains from being framed with excessive confidence.',
  ],
  specificity: [
    'Outcome-level framing improves trust by keeping evidence conclusions tied to the actual research context.',
    'Endpoint discipline helps prevent narrow findings from expanding into unsupported general conclusions.',
    'Research-scope framing keeps interpretation anchored to the populations, endpoints, and study types behind each claim.',
  ],
  population: [
    'Population-aware interpretation helps keep research findings tied to the people and settings actually studied.',
    'Contextual population framing improves trust by avoiding overgeneralized conclusions from narrow study samples.',
    'Population context matters because evidence from one study group may not generalize cleanly to every user or condition.',
  ],
  studyDesign: [
    'Study-design context matters because randomized trials, observational data, and mechanistic studies carry different interpretive weight.',
    'Design-aware framing helps separate stronger clinical signals from weaker or more indirect research support.',
    'Narrative confidence should reflect the underlying study design rather than topic popularity.',
  ],
  formulation: [
    'Formulation-aware framing helps prevent one preparation from being treated as interchangeable with every related product or source.',
    'Scientific interpretation improves when profile language preserves distinctions between studied preparations and broader ingredient interest.',
    'Extract type, preparation, and standardization can meaningfully affect interpretation.',
  ],
  exposure: [
    'Dose-aware framing helps preserve safety and interpretation quality when research conditions differ from casual product use.',
    'Exposure-aware framing separates short-term research conditions from assumptions about ongoing or repeated use.',
    'Temporal context matters because acute, subacute, and longer-term findings should not be interpreted as interchangeable.',
  ],
  durability: [
    'Durability-aware framing helps separate temporary signals from evidence that persists across longer observation windows.',
    'Follow-up-aware interpretation separates early response signals from durable or repeat-observed outcomes.',
    'Early response does not always imply sustained benefit over time.',
  ],
  reproducibility: [
    'Replication-aware framing helps separate isolated signals from effects that appear consistently across research settings.',
    'Consistency-aware framing separates stable evidence patterns from signals that vary across studies or conditions.',
    'Mixed findings should be framed differently than repeated directional results.',
  ],
  heterogeneity: [
    'Heterogeneity-aware framing helps keep mixed evidence from being flattened into a single overconfident conclusion.',
    'Variable findings may reflect differences in populations, preparations, endpoints, or study design.',
    'Meaningful variation across research conditions should narrow certainty rather than be ignored.',
  ],
  convergence: [
    'Convergence-aware synthesis helps distinguish isolated findings from signals supported by mechanism, outcomes, and adjacent evidence domains.',
    'Confidence improves when independent evidence streams point in the same general direction.',
    'Mechanistic plausibility and measured outcomes can align without being treated as interchangeable.',
  ],
  divergence: [
    'Disagreement-aware synthesis helps frame mixed signals as uncertainty-sensitive evidence rather than a simple positive or negative conclusion.',
    'Conflicting findings should narrow confidence rather than disappear from the interpretation.',
    'Discordant findings are calibration signals, not editorial inconvenience.',
  ],
  translational: [
    'Translation-aware framing helps preserve realism when plausible mechanisms have not yet been confirmed in comparable human contexts.',
    'Animal, in-vitro, and mechanistic evidence should not be presented as direct human outcome proof.',
    'Preclinical support is best framed as hypothesis-generating unless supported by comparable human evidence.',
  ],
  ecologicalValidity: [
    'Ecological validity matters because controlled study conditions may not mirror real-world use, adherence, product quality, or baseline context.',
    'Real-world applicability should be interpreted cautiously when study settings differ from everyday exposure patterns.',
    'Controlled-study findings should not automatically generalize to less controlled real-world conditions.',
  ],
  signalStrength: [
    'Signal-strength context matters because weak, moderate, and strong evidence should escalate language only as confidence allows.',
    'Directional confidence improves when narrative certainty scales with evidence quality instead of topic popularity.',
    'Promising signals should remain distinct from stronger replicated or human-confirmed findings.',
  ],
  evidenceDensity: [
    'Density-aware synthesis helps separate narrow evidence bases from mature research areas with multiple independent observations.',
    'Sparse literatures require different confidence language than broad, repeatedly studied evidence ecosystems.',
    'Evidence maturity reflects both study quality and the breadth of the surrounding literature.',
  ],
  safety: [
    'Safety framing remains intentionally separated from benefit framing so the profile does not overstate certainty.',
    'Clinical restraint improves profile quality by separating research interpretation from personal-use recommendations.',
    'Cautious framing helps preserve trust when research signals are promising but not yet clinically settled.',
  ],
}

const MODE_KEYS: Record<SynthesisMode, string[]> = {
  overview: ['depth', 'restraint', 'specificity', 'convergence', 'signalStrength', 'evidenceDensity'],
  confidence: ['maturity', 'studyDesign', 'reproducibility', 'heterogeneity', 'divergence', 'evidenceDensity'],
  mechanism: ['studyDesign', 'translational', 'convergence', 'specificity', 'formulation', 'exposure'],
  safety: ['safety', 'exposure', 'population', 'ecologicalValidity', 'durability', 'restraint'],
}

function rotateVariation(values: string[], seed: string) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return values[total % values.length]
}

function deterministicOffset(seed: string, length: number) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return total % Math.max(length, 1)
}

function orderedKeys(keys: string[], seed: string) {
  const offset = deterministicOffset(seed, keys.length)
  return unique([...keys.slice(offset), ...keys.slice(0, offset)])
}

function detectEvidenceSignals(record: any, evidence: string, mechanisms: string[], summary = ''): EvidenceSignals {
  const combined = [evidence, summary, text(record?.summary), text(record?.description), mechanisms.join(' ')].join(' ')

  return {
    hasStrongEvidence: STRONG_EVIDENCE_PATTERN.test(combined),
    hasModerateEvidence: MODERATE_EVIDENCE_PATTERN.test(combined),
    hasPreclinicalSignal: PRECLINICAL_PATTERN.test(combined),
    hasMixedSignal: MIXED_PATTERN.test(combined),
    hasSparseSignal: SPARSE_PATTERN.test(combined),
    hasCautionSignal: CAUTION_PATTERN.test(combined),
  }
}

function determineEditorialIdentity(signals: EvidenceSignals): EditorialIdentity {
  if (signals.hasCautionSignal) return 'cautionary'
  if (signals.hasMixedSignal) return 'mixed'
  if (signals.hasPreclinicalSignal && !signals.hasStrongEvidence) return 'translational'
  if (signals.hasSparseSignal && !signals.hasStrongEvidence) return 'exploratory'
  return 'clinical'
}

function createEditorialContext(signals: EvidenceSignals): EditorialContext {
  return {
    identity: determineEditorialIdentity(signals),
    usedKeys: new Set<string>(),
  }
}

function evidenceSensitiveKeys(mode: SynthesisMode, signals?: EvidenceSignals) {
  const base = MODE_KEYS[mode]
  const priorities: string[] = []

  if (signals?.hasMixedSignal) priorities.push('divergence', 'heterogeneity', 'reproducibility')
  if (signals?.hasSparseSignal) priorities.push('evidenceDensity', 'maturity', 'restraint')
  if (signals?.hasPreclinicalSignal) priorities.push('translational', 'studyDesign', 'specificity')
  if (signals?.hasCautionSignal) priorities.push('safety', 'population', 'exposure')
  if (signals?.hasStrongEvidence && !signals.hasMixedSignal) priorities.push('convergence', 'reproducibility', 'signalStrength')
  if (signals?.hasModerateEvidence && !signals.hasStrongEvidence) priorities.push('signalStrength', 'restraint', 'studyDesign')

  return unique([...priorities, ...base])
}

function coordinatedContextKeys(
  seed: string,
  mode: SynthesisMode,
  signals: EvidenceSignals,
  context: EditorialContext,
  limit = 4,
) {
  const ordered = orderedKeys(evidenceSensitiveKeys(mode, signals), `${seed}:${mode}`)
  const fresh = ordered.filter((key) => !context.usedKeys.has(key))
  const repeated = ordered.filter((key) => context.usedKeys.has(key))
  const selected = [...fresh, ...repeated].slice(0, limit)

  selected.forEach((key) => context.usedKeys.add(key))

  return selected
}

function synthesisContextLine(seed: string, mode: SynthesisMode, signals: EvidenceSignals, context: EditorialContext) {
  return coordinatedContextKeys(seed, mode, signals, context)
    .map((key) => rotateVariation(SYNTHESIS_LINES[key], `${seed}:${mode}:${key}`))
    .join(' ')
}

function editorialCadence(identity: EditorialIdentity, seed: string) {
  return rotateVariation(IDENTITY_CADENCE[identity], `${identity}:${seed}`)
}

function composeNarrative(
  seed: string,
  mode: SynthesisMode,
  signals: EvidenceSignals,
  context: EditorialContext,
  conclusion: string,
) {
  return [
    synthesisContextLine(seed, mode, signals, context),
    editorialCadence(context.identity, seed),
    conclusion,
  ].join(' ')
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

function evidenceSignalLabel(evidence: string) {
  if (STRONG_EVIDENCE_PATTERN.test(evidence)) return 'Directionally stronger signal with continued context limits'
  if (MODERATE_EVIDENCE_PATTERN.test(evidence)) return 'Moderate or developing signal requiring calibrated interpretation'
  return 'Early, sparse, or context-dependent signal'
}

function translationalLabel(record: any, mechanisms: string[], summary = '') {
  const combined = [evidenceLabel(record), summary, text(record?.summary), text(record?.description), mechanisms.join(' ')].join(' ')
  if (PRECLINICAL_PATTERN.test(combined)) return 'Mechanistic or preclinical support requires human-outcome restraint'
  return 'Mechanistic plausibility remains secondary to direct outcome evidence'
}

function uncertaintyLabel(record: any, summary = '') {
  const combined = [evidenceLabel(record), summary, text(record?.summary), text(record?.description)].join(' ')
  if (MIXED_PATTERN.test(combined)) return 'Mixed or variable findings require uncertainty-sensitive synthesis'
  if (SPARSE_PATTERN.test(combined)) return 'Sparse evidence base requires conservative interpretation'
  return 'Evidence interpretation remains context-sensitive'
}

function evidenceDensityLabel(signals: EvidenceSignals) {
  if (signals.hasSparseSignal) return 'Sparse or narrow literature; confidence should remain conservative'
  if (signals.hasStrongEvidence && !signals.hasMixedSignal) return 'More developed evidence ecosystem with continued endpoint boundaries'
  return 'Evidence density should be interpreted alongside study quality and consistency'
}

function synthesisChips(mode: SynthesisMode, seed: string, signals: EvidenceSignals) {
  return orderedKeys(evidenceSensitiveKeys(mode, signals), seed)
    .map(formatDisplayLabel)
    .slice(0, 4)
}

function buildWhyItMattersWithContext(
  record: any,
  entityType: EditorialEntityType,
  summary: string,
  effects: string[],
  signals: EvidenceSignals,
  context: EditorialContext,
): EditorialNarrative {
  const focus = cleanEditorialItems([...list(record?.best_for), ...effects], 4)
  const name = formatDisplayLabel(record?.name || record?.slug)
  const tone = evidenceTone(evidenceLabel(record))

  if (focus.length > 0) {
    const variation = rotateVariation(WHY_VARIATIONS, name)
      .replace('%NAME%', name)
      .replace('%FOCUS%', focus.join(', '))

    return {
      title: 'Why It Matters',
      body: composeNarrative(name, 'overview', signals, context, variation),
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

export function buildWhyItMatters(record: any, entityType: EditorialEntityType, summary: string, effects: string[]): EditorialNarrative {
  const evidence = evidenceLabel(record)
  const signals = detectEvidenceSignals(record, evidence, [], summary)
  const context = createEditorialContext(signals)

  return buildWhyItMattersWithContext(record, entityType, summary, effects, signals, context)
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
  const evidence = evidenceLabel(record)
  const mechanismSeed = mechanisms.join(',') || summary || entityType
  const signals = detectEvidenceSignals(record, evidence, mechanisms, summary)
  const context = createEditorialContext(signals)

  return {
    effects,
    mechanisms,
    summary,
    decisionSnapshot: [
      { label: 'Evidence strength', value: evidence },
      { label: 'Signal interpretation', value: evidenceSignalLabel(evidence) },
      { label: 'Uncertainty posture', value: uncertaintyLabel(record, summary) },
      { label: 'Translation posture', value: translationalLabel(record, mechanisms, summary) },
      { label: 'Evidence density', value: evidenceDensityLabel(signals) },
      { label: 'Interpretation stance', value: 'Conservative and evidence-calibrated' },
      { label: 'Editorial depth', value: 'Semantic, translational, and ecosystem aware' },
    ],
    whyItMatters: buildWhyItMattersWithContext(record, entityType, summary, effects, signals, context),
    researchConfidence: {
      title: 'Research Confidence',
      body: composeNarrative(
        summary || evidence,
        'confidence',
        signals,
        context,
        'Evidence confidence should remain sensitive to convergence, disagreement, study design, translational distance, ecological validity, signal strength, and the density of the surrounding literature.',
      ),
      chips: unique([...effects.slice(0, 3), ...synthesisChips('confidence', summary || evidence, signals)]).slice(0, 5),
      tone: evidenceTone(evidence),
    },
    mechanismNarrative: {
      title: 'Potential Mechanisms',
      body: composeNarrative(
        mechanismSeed,
        'mechanism',
        signals,
        context,
        'Mechanistic interpretation should remain secondary to direct outcome evidence, even when biological plausibility appears coherent across adjacent pathways or domains.',
      ),
      chips: unique([...mechanisms.slice(0, 4), ...synthesisChips('mechanism', mechanismSeed, signals)]).slice(0, 6),
      tone: mechanisms.length >= 3 ? 'moderate' : 'neutral',
    },
    safetyNarrative: {
      title: 'Safety Interpretation',
      body: composeNarrative(
        'safety',
        'safety',
        signals,
        context,
        'Safety interpretation should account for population context, exposure assumptions, formulation differences, real-world adherence, and the separation between possible benefit and individualized use decisions.',
      ),
      chips: synthesisChips('safety', 'safety', signals),
      tone: signals.hasCautionSignal ? 'caution' : 'neutral',
    },
  }
}
