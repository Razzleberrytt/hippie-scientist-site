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

const CONTEXTUAL_INTELLIGENCE_VARIATIONS = [
  'Contextual scientific intelligence improves when semantic continuity remains aligned across neighboring evidence domains.',
  'Higher-quality interpretation systems depend on preserving calibrated narrative behavior throughout the broader knowledge ecosystem.',
  'Scientific editorial intelligence strengthens when related profiles maintain coherent evidence-aware contextual framing.',
]

const AUTHORITY_CONTINUITY_VARIATIONS = [
  'Authority continuity improves when semantic interpretation standards remain stable across adjacent scientific profiles.',
  'Higher-trust knowledge ecosystems depend on preserving calibrated evidence-aware language throughout the editorial layer.',
  'Scientific authority systems strengthen when contextual interpretation quality remains aligned across related domains.',
]

const SEMANTIC_COHERENCE_VARIATIONS = [
  'Semantic coherence improves when editorial interpretation standards remain aligned across connected scientific ecosystems.',
  'Higher-trust authority systems depend on maintaining coherent contextual interpretation across adjacent evidence domains.',
  'Scientific knowledge continuity strengthens when semantic calibration remains stable throughout related profiles.',
]

const ADAPTIVE_REALISM_VARIATIONS = [
  'Adaptive scientific realism improves when contextual interpretation adjusts appropriately to evidence maturity and uncertainty.',
  'Higher-quality authority systems depend on maintaining realistic calibration across varying levels of scientific confidence.',
  'Semantic interpretation realism strengthens when restraint language scales appropriately with evidence quality.',
]

const EVIDENCE_MATURITY_VARIATIONS = [
  'Evidence maturity improves interpretation when profile language distinguishes direct human data from indirect mechanism support.',
  'Scientific authority increases when profile narratives keep early-stage plausibility separate from stronger outcome evidence.',
  'Maturity-aware interpretation helps prevent weak evidence domains from being framed with excessive confidence.',
]

const CLINICAL_CAUTION_VARIATIONS = [
  'Clinical caution remains important because educational interpretation should not imply individualized medical guidance.',
  'Cautious framing helps preserve trust when research signals are promising but not yet clinically settled.',
  'Clinical restraint improves profile quality by separating research interpretation from personal-use recommendations.',
]

const INTERPRETIVE_RESTRAINT_VARIATIONS = [
  'Interpretive restraint helps preserve scientific credibility when evidence signals are incomplete or uneven.',
  'Restraint-aware editorial systems reduce the risk of turning plausible mechanisms into overstated conclusions.',
  'Conservative interpretation improves trust when profile evidence varies across outcomes, populations, and study designs.',
]

const OUTCOME_SPECIFICITY_VARIATIONS = [
  'Outcome-specific interpretation improves when broad effects are separated from narrower evidence-supported endpoints.',
  'Specificity helps prevent general interest signals from being overstated as broad clinical certainty.',
  'Outcome-level framing improves trust by keeping evidence conclusions tied to the actual research context.',
]

const ENDPOINT_BOUNDARY_VARIATIONS = [
  'Endpoint boundaries help separate broad wellness interest from evidence attached to specific measured outcomes.',
  'Boundary-aware framing keeps interpretation tied to what studies actually measured rather than what adjacent claims imply.',
  'Endpoint discipline improves trust by preventing narrow findings from expanding into unsupported general conclusions.',
]

const RESEARCH_SCOPE_VARIATIONS = [
  'Research-scope framing helps keep interpretation anchored to the populations, endpoints, and study types behind each claim.',
  'Scope-aware editorial language prevents preliminary or narrow findings from being generalized beyond the available evidence.',
  'Scientific scope discipline improves trust when profile interpretation remains tied to the actual evidence base rather than adjacent assumptions.',
]

const POPULATION_CONTEXT_VARIATIONS = [
  'Population context matters because evidence from one study group may not generalize cleanly to every user or condition.',
  'Population-aware interpretation helps keep research findings tied to the people and settings actually studied.',
  'Contextual population framing improves trust by avoiding overgeneralized conclusions from narrow study samples.',
]

const STUDY_DESIGN_VARIATIONS = [
  'Study-design context matters because randomized trials, observational data, and mechanistic studies carry different interpretive weight.',
  'Design-aware framing helps separate stronger clinical signals from weaker or more indirect research support.',
  'Scientific interpretation improves when narrative confidence reflects the underlying study design rather than topic popularity.',
]

const FORMULATION_CONTEXT_VARIATIONS = [
  'Formulation context matters because extract type, preparation, and standardization can meaningfully affect interpretation.',
  'Formulation-aware framing helps prevent one preparation from being treated as interchangeable with every related product or source.',
  'Scientific interpretation improves when profile language preserves distinctions between studied preparations and broader ingredient interest.',
]

const DOSAGE_CONTEXT_VARIATIONS = [
  'Dosage context matters because evidence attached to one exposure level should not be generalized across every amount or use pattern.',
  'Dose-aware framing helps preserve safety and interpretation quality when research conditions differ from casual product use.',
  'Scientific interpretation improves when profile language keeps studied exposure ranges separate from unsupported dosing assumptions.',
]

const EXPOSURE_CONTEXT_VARIATIONS = [
  'Exposure context matters because duration, frequency, and study setting can meaningfully affect interpretation.',
  'Exposure-aware framing helps separate short-term research conditions from assumptions about ongoing or repeated use.',
  'Scientific interpretation improves when profile language distinguishes studied exposure patterns from broader casual-use assumptions.',
]

const TEMPORAL_CONTEXT_VARIATIONS = [
  'Temporal context matters because acute, subacute, and longer-term findings should not be interpreted as interchangeable.',
  'Time-aware framing helps preserve trust when onset, duration, and follow-up windows differ across studies.',
  'Scientific interpretation improves when profile language keeps short-term signals separate from longer-term assumptions.',
]

const LONGITUDINAL_CONTEXT_VARIATIONS = [
  'Longitudinal context matters because single time-point findings should not be treated the same as sustained follow-up evidence.',
  'Follow-up-aware framing helps separate early response signals from durable or repeat-observed outcomes.',
  'Scientific interpretation improves when profile language distinguishes one-off observations from longitudinal evidence patterns.',
]

const DURABILITY_CONTEXT_VARIATIONS = [
  'Durability context matters because early response does not always imply sustained benefit over time.',
  'Durability-aware framing helps separate temporary signals from evidence that persists across longer observation windows.',
  'Scientific interpretation improves when profile language distinguishes immediate effects from durable outcome patterns.',
]

const REPRODUCIBILITY_CONTEXT_VARIATIONS = [
  'Reproducibility context matters because one positive study should not be treated the same as repeated findings across independent work.',
  'Replication-aware framing helps separate isolated signals from effects that appear consistently across research settings.',
  'Scientific interpretation improves when profile language distinguishes single-study interest from reproducible evidence patterns.',
]

const CONSISTENCY_CONTEXT_VARIATIONS = [
  'Consistency context matters because mixed findings should be framed differently than repeated directional results.',
  'Consistency-aware framing helps separate stable evidence patterns from signals that vary across studies or conditions.',
  'Scientific interpretation improves when profile language reflects whether findings are directionally consistent or meaningfully mixed.',
]

const HETEROGENEITY_CONTEXT_VARIATIONS = [
  'Heterogeneity context matters because variable findings may reflect differences in populations, preparations, endpoints, or study design.',
  'Heterogeneity-aware framing helps keep mixed evidence from being flattened into a single overconfident conclusion.',
  'Scientific interpretation improves when profile language acknowledges meaningful variation across research conditions.',
]

const CONVERGENCE_CONTEXT_VARIATIONS = [
  'Convergence context matters because confidence improves when independent evidence streams point in the same general direction.',
  'Convergence-aware synthesis helps distinguish isolated findings from signals supported by mechanism, outcomes, and adjacent evidence domains.',
  'Scientific interpretation strengthens when mechanistic plausibility and measured outcomes align without being treated as interchangeable.',
]

const DIVERGENCE_CONTEXT_VARIATIONS = [
  'Divergence context matters because conflicting findings should narrow confidence rather than disappear from the interpretation.',
  'Disagreement-aware synthesis helps frame mixed signals as uncertainty-sensitive evidence rather than a simple positive or negative conclusion.',
  'Scientific interpretation improves when discordant findings are treated as calibration signals instead of editorial inconvenience.',
]

const TRANSLATIONAL_CONTEXT_VARIATIONS = [
  'Translational context matters because animal, in-vitro, and mechanistic evidence should not be presented as direct human outcome proof.',
  'Translation-aware framing helps preserve realism when plausible mechanisms have not yet been confirmed in comparable human contexts.',
  'Scientific interpretation improves when preclinical support is framed as hypothesis-generating rather than clinically settled.',
]

const ECOLOGICAL_VALIDITY_CONTEXT_VARIATIONS = [
  'Ecological validity matters because controlled study conditions may not mirror real-world use, adherence, product quality, or baseline context.',
  'Real-world applicability should be interpreted cautiously when study settings differ from everyday exposure patterns.',
  'Scientific interpretation improves when controlled-study findings are not automatically generalized to less controlled real-world conditions.',
]

const SIGNAL_STRENGTH_CONTEXT_VARIATIONS = [
  'Signal-strength context matters because weak, moderate, and strong evidence should escalate language only as confidence allows.',
  'Directional confidence improves when narrative certainty scales with evidence quality instead of topic popularity.',
  'Scientific interpretation improves when promising signals remain distinct from stronger replicated or human-confirmed findings.',
]

const EVIDENCE_DENSITY_CONTEXT_VARIATIONS = [
  'Evidence-density context matters because sparse literatures require different confidence language than broad, repeatedly studied evidence ecosystems.',
  'Density-aware synthesis helps separate narrow evidence bases from mature research areas with multiple independent observations.',
  'Scientific interpretation improves when evidence maturity reflects both study quality and the breadth of the surrounding literature.',
]

function rotateVariation(values: string[], seed: string) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return values[total % values.length]
}

function depthLine(seed: string) { return rotateVariation(DEPTH_VARIATIONS, seed) }
function sophisticationLine(seed: string) { return rotateVariation(SOPHISTICATION_VARIATIONS, seed) }
function evidenceContinuityLine(seed: string) { return rotateVariation(EVIDENCE_CONTINUITY_VARIATIONS, seed) }
function contextualIntelligenceLine(seed: string) { return rotateVariation(CONTEXTUAL_INTELLIGENCE_VARIATIONS, seed) }
function authorityContinuityLine(seed: string) { return rotateVariation(AUTHORITY_CONTINUITY_VARIATIONS, seed) }
function semanticCoherenceLine(seed: string) { return rotateVariation(SEMANTIC_COHERENCE_VARIATIONS, seed) }
function adaptiveRealismLine(seed: string) { return rotateVariation(ADAPTIVE_REALISM_VARIATIONS, seed) }
function evidenceMaturityLine(seed: string) { return rotateVariation(EVIDENCE_MATURITY_VARIATIONS, seed) }
function clinicalCautionLine(seed: string) { return rotateVariation(CLINICAL_CAUTION_VARIATIONS, seed) }
function interpretiveRestraintLine(seed: string) { return rotateVariation(INTERPRETIVE_RESTRAINT_VARIATIONS, seed) }
function outcomeSpecificityLine(seed: string) { return rotateVariation(OUTCOME_SPECIFICITY_VARIATIONS, seed) }
function endpointBoundaryLine(seed: string) { return rotateVariation(ENDPOINT_BOUNDARY_VARIATIONS, seed) }
function researchScopeLine(seed: string) { return rotateVariation(RESEARCH_SCOPE_VARIATIONS, seed) }
function populationContextLine(seed: string) { return rotateVariation(POPULATION_CONTEXT_VARIATIONS, seed) }
function studyDesignLine(seed: string) { return rotateVariation(STUDY_DESIGN_VARIATIONS, seed) }
function formulationContextLine(seed: string) { return rotateVariation(FORMULATION_CONTEXT_VARIATIONS, seed) }
function dosageContextLine(seed: string) { return rotateVariation(DOSAGE_CONTEXT_VARIATIONS, seed) }
function exposureContextLine(seed: string) { return rotateVariation(EXPOSURE_CONTEXT_VARIATIONS, seed) }
function temporalContextLine(seed: string) { return rotateVariation(TEMPORAL_CONTEXT_VARIATIONS, seed) }
function longitudinalContextLine(seed: string) { return rotateVariation(LONGITUDINAL_CONTEXT_VARIATIONS, seed) }
function durabilityContextLine(seed: string) { return rotateVariation(DURABILITY_CONTEXT_VARIATIONS, seed) }
function reproducibilityContextLine(seed: string) { return rotateVariation(REPRODUCIBILITY_CONTEXT_VARIATIONS, seed) }
function consistencyContextLine(seed: string) { return rotateVariation(CONSISTENCY_CONTEXT_VARIATIONS, seed) }
function heterogeneityContextLine(seed: string) { return rotateVariation(HETEROGENEITY_CONTEXT_VARIATIONS, seed) }
function convergenceContextLine(seed: string) { return rotateVariation(CONVERGENCE_CONTEXT_VARIATIONS, seed) }
function divergenceContextLine(seed: string) { return rotateVariation(DIVERGENCE_CONTEXT_VARIATIONS, seed) }
function translationalContextLine(seed: string) { return rotateVariation(TRANSLATIONAL_CONTEXT_VARIATIONS, seed) }
function ecologicalValidityContextLine(seed: string) { return rotateVariation(ECOLOGICAL_VALIDITY_CONTEXT_VARIATIONS, seed) }
function signalStrengthContextLine(seed: string) { return rotateVariation(SIGNAL_STRENGTH_CONTEXT_VARIATIONS, seed) }
function evidenceDensityContextLine(seed: string) { return rotateVariation(EVIDENCE_DENSITY_CONTEXT_VARIATIONS, seed) }

function synthesisContextLine(seed: string) {
  return [
    depthLine(seed),
    sophisticationLine(seed),
    evidenceContinuityLine(seed),
    contextualIntelligenceLine(seed),
    authorityContinuityLine(seed),
    semanticCoherenceLine(seed),
    adaptiveRealismLine(seed),
    evidenceMaturityLine(seed),
    clinicalCautionLine(seed),
    interpretiveRestraintLine(seed),
    outcomeSpecificityLine(seed),
    endpointBoundaryLine(seed),
    researchScopeLine(seed),
    populationContextLine(seed),
    studyDesignLine(seed),
    formulationContextLine(seed),
    dosageContextLine(seed),
    exposureContextLine(seed),
    temporalContextLine(seed),
    longitudinalContextLine(seed),
    durabilityContextLine(seed),
    reproducibilityContextLine(seed),
    consistencyContextLine(seed),
    heterogeneityContextLine(seed),
    convergenceContextLine(seed),
    divergenceContextLine(seed),
    translationalContextLine(seed),
    ecologicalValidityContextLine(seed),
    signalStrengthContextLine(seed),
    evidenceDensityContextLine(seed),
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
      body: `${variation} ${synthesisContextLine(name)}`,
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
  const evidence = evidenceLabel(record)
  const mechanismSeed = mechanisms.join(',') || summary || entityType

  return {
    effects,
    mechanisms,
    summary,
    decisionSnapshot: [
      { label: 'Evidence strength', value: evidence },
      { label: 'Signal interpretation', value: evidenceSignalLabel(evidence) },
      { label: 'Interpretation stance', value: 'Conservative and evidence-calibrated' },
      { label: 'Editorial depth', value: 'Semantic, translational, and ecosystem aware' },
    ],
    whyItMatters: buildWhyItMatters(record, entityType, summary, effects),
    researchConfidence: {
      title: 'Research Confidence',
      body: `${synthesisContextLine(summary || evidence)} Human evidence quality varies substantially across domains and outcomes. Evidence confidence should remain sensitive to convergence, disagreement, study design, translational distance, ecological validity, signal strength, and the density of the surrounding literature.`,
      chips: effects.slice(0, 4),
      tone: evidenceTone(evidence),
    },
    mechanismNarrative: {
      title: 'Potential Mechanisms',
      body: `${synthesisContextLine(mechanismSeed)} Mechanistic interpretation should remain secondary to direct outcome evidence. Plausible pathways can support biological realism, but mechanism-to-human translation should remain cautious unless aligned with controlled human outcomes and repeated evidence patterns.`,
      chips: mechanisms.slice(0, 6),
      tone: mechanisms.length >= 3 ? 'moderate' : 'neutral',
    },
    safetyNarrative: {
      title: 'Safety Interpretation',
      body: `Safety framing remains intentionally separated from benefit framing so the profile does not overstate certainty. ${synthesisContextLine('safety')}`,
      chips: [],
      tone: CAUTION_PATTERN.test(summary) ? 'caution' : 'neutral',
    },
  }
}
