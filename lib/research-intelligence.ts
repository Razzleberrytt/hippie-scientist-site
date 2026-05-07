import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

export type ResearchMaturity = 'Better studied' | 'Moderate / emerging' | 'Preliminary' | 'Sparse profile'
export type ResearchStyle = 'Human-clinical leaning' | 'Mechanism-heavy' | 'Traditional-use dominant' | 'Mixed evidence profile' | 'Emerging profile'
export type TopicConfidence = 'Limited' | 'Preliminary' | 'Moderate' | 'Stronger'

export type ProfileRecord = Record<string, any>

export type EvidenceInputs = {
  profile?: ProfileRecord | null
  claims?: string[]
  pmids?: string[]
  mechanisms?: string[]
}

export type EvidenceFraming = {
  maturity: ResearchMaturity
  summary: string
  notes: string[]
}

export type PathwayCluster = {
  title: string
  description: string
  mechanisms: string[]
}

export type TopicConfidenceSummary = {
  topic: string
  confidence: TopicConfidence
  note: string
  rationale?: string
}

export type ComparisonCandidate = {
  slug?: string
  href?: string
  name?: string
  displayName?: string
  title?: string
  primary_effects?: unknown
  primaryActions?: unknown
  traditionalUses?: unknown
  mechanisms?: unknown
  evidence_grade?: unknown
  evidenceLevel?: unknown
  type?: string
}

export type ComparisonFraming = {
  href: string
  title: string
  overlappingFocus: string
  keyDistinction: string
  evidenceEmphasis: string
}

const TOPIC_PATTERNS: Array<{ topic: string; matcher: RegExp }> = [
  { topic: 'Stress resilience', matcher: /stress|mood|anxiety|calm|relax|cortisol|hpa|adrenal|resilien/i },
  { topic: 'Sleep quality', matcher: /sleep|insomnia|rest|night|sedat/i },
  { topic: 'Cognitive function', matcher: /cognit|focus|memory|brain|neuro|attention|clarity/i },
  { topic: 'Neuroendocrine signaling', matcher: /cortisol|hpa|adrenal|neuroendocrine/i },
  { topic: 'Inflammatory signaling', matcher: /inflamm|nf.?kb|cytokine|cox|lox|joint|pain|immune/i },
  { topic: 'Metabolic health', matcher: /metabolic|glucose|insulin|weight|ampk|lipid|cholesterol|blood sugar/i },
  { topic: 'Athletic performance', matcher: /athletic|performance|stamina|endurance|exercise|strength|recovery|fatigue|energy/i },
  { topic: 'Hormonal effects', matcher: /hormon|testosterone|estrogen|androgen|menopause|menstrual|thyroid|fertility/i },
  { topic: 'Digestive support', matcher: /digest|gut|bile|liver|stomach|bowel|microbiome/i },
]

const PATHWAY_PATTERNS: Array<{ title: string; description: string; matcher: RegExp }> = [
  { title: 'Cortisol signaling', description: 'Stress-response and neuroendocrine pathway context.', matcher: /cortisol|hpa|adrenal|stress/i },
  { title: 'GABAergic signaling', description: 'Nervous-system inhibitory signaling context.', matcher: /gaba/i },
  { title: 'Monoamine signaling', description: 'Serotonin, dopamine, or related neurotransmitter context.', matcher: /serotonin|5-ht|dopamine|monoamine|noradrenaline|norepinephrine/i },
  { title: 'Oxidative stress pathways', description: 'Cellular defense and antioxidant-response context.', matcher: /antioxidant|oxidative|nrf2|ros|radical/i },
  { title: 'Inflammatory signaling', description: 'Inflammatory mediator or immune-signaling context.', matcher: /nf.?kb|inflamm|cytokine|cox|lox|mapk|immune|tnf|interleukin|il-\d/i },
  { title: 'Metabolic signaling', description: 'Energy-balance, glucose, lipid, or AMPK-related context.', matcher: /ampk|glucose|insulin|metabolic|lipid|cholesterol|mitochond/i },
  { title: 'Vascular signaling', description: 'Endothelial, nitric-oxide, or circulatory pathway context.', matcher: /nitric|endothelial|vascular|blood pressure|circul/i },
]

const clean = (value: unknown) => formatDisplayLabel(value)
const cleanList = (value: unknown) => unique(list(value).map(formatDisplayLabel).filter(isClean))
const words = (items: string[]) => new Set(items.join(' ').toLowerCase().split(/[^a-z0-9α-ωκβ]+/i).filter(word => word.length > 3))

const getEffects = (profile?: ProfileRecord | null) => unique([
  ...cleanList(profile?.primary_effects),
  ...cleanList(profile?.primaryActions),
  ...cleanList(profile?.traditionalUses),
])
const getEvidenceLevel = (profile?: ProfileRecord | null) => clean(profile?.evidence_grade || profile?.evidenceLevel || profile?.evidence_tier || profile?.evidence)

export function normalizeResearchInputs(inputs: EvidenceInputs) {
  const profile = inputs.profile || {}
  const claims = unique([...(inputs.claims || []), ...cleanList(profile.claims)].map(formatDisplayLabel).filter(isClean))
  const mechanisms = unique([...(inputs.mechanisms || []), ...cleanList(profile.mechanisms), clean(profile.mechanism_summary)].filter(isClean))
  const pmids = unique([...(inputs.pmids || []), ...cleanList(profile.pmid_list), ...cleanList(profile.pmids), ...cleanList(profile.references)].filter(item => /\d/.test(item)))
  const effects = getEffects(profile)
  const traditionalUses = cleanList(profile.traditionalUses || profile.traditional_uses)
  const evidence = getEvidenceLevel(profile)

  return { profile, claims, mechanisms, pmids, effects, traditionalUses, evidence }
}

export function classifyResearchMaturity(inputs: EvidenceInputs): ResearchMaturity {
  const { claims, mechanisms, pmids, effects, evidence } = normalizeResearchInputs(inputs)
  const level = evidence.toLowerCase()
  const signalCount = claims.length + mechanisms.length + effects.length + pmids.length

  if (!signalCount && !level) return 'Sparse profile'
  if (/strong|high|clinical|human|a-tier|well studied/.test(level) || pmids.length >= 8 || signalCount >= 14) return 'Better studied'
  if (/moderate|mixed/.test(level) || pmids.length >= 3 || signalCount >= 7) return 'Moderate / emerging'
  return 'Preliminary'
}

export function deriveResearchStyle(inputs: EvidenceInputs): ResearchStyle {
  const { claims, mechanisms, pmids, traditionalUses, evidence } = normalizeResearchInputs(inputs)
  const level = evidence.toLowerCase()

  if ((/human|clinical|strong|high/.test(level) || pmids.length >= 6) && mechanisms.length <= claims.length + 2) return 'Human-clinical leaning'
  if (mechanisms.length >= 3 && mechanisms.length >= claims.length + traditionalUses.length) return 'Mechanism-heavy'
  if (traditionalUses.length >= 2 && pmids.length < 3 && mechanisms.length < 4) return 'Traditional-use dominant'
  if (claims.length && mechanisms.length && (pmids.length || traditionalUses.length)) return 'Mixed evidence profile'
  return 'Emerging profile'
}

export function deriveEvidenceFraming(inputs: EvidenceInputs): EvidenceFraming {
  const maturity = classifyResearchMaturity(inputs)
  const style = deriveResearchStyle(inputs)
  const { claims, mechanisms, pmids } = normalizeResearchInputs(inputs)

  if (maturity === 'Better studied') {
    return {
      maturity,
      summary: 'This profile has several visible research signals, but confidence should still be read by outcome, preparation, and dosage context.',
      notes: ['Prioritize repeated human-facing outcomes over broad wellness language.', 'Mechanisms are useful context, not proof that every downstream outcome occurs clinically.'],
    }
  }

  if (maturity === 'Moderate / emerging') {
    return {
      maturity,
      summary: style === 'Mechanism-heavy'
        ? 'The profile is useful for pathway-level interpretation, while clinical confidence likely varies by outcome.'
        : 'The profile has enough signals for research navigation, with uncertainty that varies by outcome and preparation.',
      notes: ['Read specific recurring effects more strongly than isolated claims.', 'Compare product forms cautiously because preparations may not be equivalent.'],
    }
  }

  if (maturity === 'Sparse profile') {
    return {
      maturity,
      summary: 'Available structured data are sparse, so this profile should be treated as an orientation page rather than a settled evidence review.',
      notes: ['Avoid making clinical conclusions from limited profile fields.', 'Use safety and preparation notes, when present, as context for further review.'],
    }
  }

  return {
    maturity,
    summary: mechanisms.length > claims.length || !pmids.length
      ? 'Most visible evidence remains mechanistic, traditional, or preliminary rather than clinically settled.'
      : 'Early signals are present, but the profile should not be read as established clinical certainty.',
    notes: ['Mechanistic plausibility can guide research questions but does not establish real-world benefit.', 'Sparse or broad claims should be interpreted conservatively.'],
  }
}

export function deriveEvidenceLimitations(inputs: EvidenceInputs): string[] {
  const { claims, mechanisms, pmids, evidence, profile, effects } = normalizeResearchInputs(inputs)
  const hasPreparationContext = Boolean(clean(profile.dosage_range || profile.dosage || profile.oral_form || profile.preparation))
  const broadClaimCount = [...claims, ...effects].filter(item => /wellness|support|balance|health|vitality|resilience|performance|stress|mood/i.test(item)).length
  const limitations = [
    pmids.length < 3 ? 'Long-term human evidence may be limited.' : '',
    mechanisms.length > claims.length + effects.length ? 'Mechanistic evidence should not be read as proof of clinical effect.' : '',
    hasPreparationContext ? 'Outcomes may vary by preparation and extract type.' : '',
    hasPreparationContext ? 'Product standardization can vary substantially.' : '',
    broadClaimCount >= 2 || /limited|prelim|emerging|mixed/i.test(evidence) ? 'Evidence should be interpreted by preparation, dosage, and outcome.' : '',
  ]

  return unique(limitations.filter(item => item && isClean(item))).slice(0, 5)
}

export const inferEvidenceLimitations = deriveEvidenceLimitations

export function inferResearchGaps(inputs: EvidenceInputs): string[] {
  const { claims, mechanisms, pmids, effects } = normalizeResearchInputs(inputs)
  const gaps = [
    pmids.length < 5 ? 'More well-controlled human studies would clarify effect size and consistency.' : '',
    mechanisms.length > 0 ? 'Pathway findings need careful translation into outcome-specific human evidence.' : '',
    claims.length + effects.length > 2 ? 'Recurring outcomes should be compared by population, preparation, and dose.' : '',
    'Long-term safety, interaction, and standardization questions remain important for interpretation.',
  ]

  return unique(gaps.filter(Boolean)).slice(0, 4)
}

export function deriveConsensusSummary(inputs: EvidenceInputs): string | null {
  const { claims, mechanisms, effects, pmids } = normalizeResearchInputs(inputs)
  const focus = deriveResearchFocusAreas(inputs)
  const style = deriveResearchStyle(inputs)

  if (!focus.length && !claims.length && !mechanisms.length && !effects.length) return null
  if (style === 'Mechanism-heavy') return 'This profile is mostly useful for mechanism and discovery context.'
  if (focus.some(item => /stress|sleep|cognitive|inflammatory|metabolic/i.test(item))) return `Current profile signals are strongest around ${focus[0].toLowerCase()}.`
  if (!pmids.length) return 'This profile should be interpreted as preliminary discovery context.'
  return 'Evidence should be interpreted by preparation, dosage, and outcome.'
}

export const generateScientificConsensusSummary = deriveConsensusSummary

export function deriveResearchFocusAreas(inputs: EvidenceInputs): string[] {
  const { claims, mechanisms, effects, traditionalUses } = normalizeResearchInputs(inputs)
  const haystacks = [...effects, ...claims, ...traditionalUses, ...mechanisms]
  const focus = TOPIC_PATTERNS.filter(item => haystacks.some(value => item.matcher.test(value))).map(item => item.topic)
  const fallback = haystacks.map(formatDisplayLabel).filter(isClean)

  return unique(focus.length ? focus : fallback).slice(0, 6)
}

export function derivePathwayClusters(inputs: EvidenceInputs): PathwayCluster[] {
  const { mechanisms } = normalizeResearchInputs(inputs)
  if (!mechanisms.length) return []

  const clusters = PATHWAY_PATTERNS.map(pattern => ({
    title: pattern.title,
    description: pattern.description,
    mechanisms: mechanisms.filter(item => pattern.matcher.test(item)).slice(0, 4),
  })).filter(cluster => cluster.mechanisms.length > 0)

  const matched = new Set(clusters.flatMap(cluster => cluster.mechanisms))
  const other = mechanisms.filter(item => !matched.has(item)).slice(0, 4)
  if (other.length) {
    clusters.push({ title: 'Other mechanistic signals', description: 'Additional mechanisms listed in the profile data.', mechanisms: other })
  }

  return clusters.slice(0, 5)
}


export function deriveRelatedPathways(mechanisms: unknown): string[] {
  const cleanMechanisms = cleanList(mechanisms)
  if (!cleanMechanisms.length) return []

  const supported = [
    { title: 'Cortisol signaling', matcher: /cortisol|hpa|adrenal|stress/i },
    { title: 'GABAergic signaling', matcher: /gaba/i },
    { title: 'Oxidative stress pathways', matcher: /antioxidant|oxidative|nrf2|ros|radical/i },
    { title: 'Inflammatory signaling', matcher: /nf.?kb|inflamm|cytokine|cox|lox|mapk|immune|tnf|interleukin|il-\d/i },
    { title: 'Metabolic signaling', matcher: /ampk|glucose|insulin|metabolic|lipid|cholesterol|mitochond/i },
    { title: 'Immune signaling', matcher: /immune|cytokine|interleukin|tnf/i },
  ]

  return unique(
    supported
      .filter(pathway => cleanMechanisms.some(mechanism => pathway.matcher.test(mechanism)))
      .map(pathway => pathway.title)
  ).slice(0, 6)
}

export function deriveConfidenceByTopic(inputs: EvidenceInputs): TopicConfidenceSummary[] {
  const normalized = normalizeResearchInputs(inputs)
  const haystacks = [...normalized.effects, ...normalized.claims, ...normalized.mechanisms, ...normalized.traditionalUses]
  if (!haystacks.length) return []

  return TOPIC_PATTERNS.map(({ topic, matcher }) => {
    const matches = haystacks.filter(value => matcher.test(value))
    if (!matches.length) return null

    const mechanismMatches = normalized.mechanisms.filter(value => matcher.test(value)).length
    const outcomeMatches = normalized.effects.concat(normalized.claims).filter(value => matcher.test(value)).length
    const hasSources = normalized.pmids.length >= 3
    const isStrongerEvidence = /strong|high|well studied/i.test(normalized.evidence) && normalized.pmids.length >= 6
    const isModerateEvidence = /moderate|human|clinical/i.test(normalized.evidence) || hasSources
    const confidence: TopicConfidence = outcomeMatches >= 2 && isStrongerEvidence
      ? 'Stronger'
      : outcomeMatches >= 2 && isModerateEvidence
        ? 'Moderate'
        : mechanismMatches > outcomeMatches || outcomeMatches >= 1
          ? 'Preliminary'
          : 'Limited'
    const note = confidence === 'Stronger'
      ? 'Multiple visible signals exist, but certainty still depends on outcome and preparation.'
      : confidence === 'Moderate'
        ? 'Repeated outcome signals are visible, but certainty remains outcome- and preparation-specific.'
        : confidence === 'Preliminary'
          ? 'The signal appears in the profile, though support may be mechanistic or not yet consistent.'
          : 'The topic is visible mainly as a limited or indirect profile signal.'

    return {
      topic,
      confidence,
      note,
      rationale: note,
    }
  }).filter(Boolean).slice(0, 5) as TopicConfidenceSummary[]
}

export function deriveComparisonFraming(current: ProfileRecord, candidates: ComparisonCandidate[] = []): ComparisonFraming[] {
  const currentSignals = unique([...getEffects(current), ...cleanList(current.mechanisms), ...cleanList(current.traditionalUses)])
  const currentWords = words(currentSignals)
  if (!currentWords.size || !candidates.length) return []

  return candidates
    .filter(candidate => candidate?.slug && candidate.slug !== current.slug)
    .map(candidate => {
      const candidateName = clean(candidate.displayName || candidate.name || candidate.title)
      const candidateSignals = unique([...getEffects(candidate as ProfileRecord), ...cleanList(candidate.mechanisms), ...cleanList(candidate.traditionalUses)])
      const candidateWords = words(candidateSignals)
      const overlapTerms = [...candidateWords].filter(term => currentWords.has(term))
      const overlapSignals = candidateSignals.filter(signal => [...currentWords].some(term => signal.toLowerCase().includes(term))).slice(0, 2)
      const score = overlapTerms.length + overlapSignals.length
      const currentMechanisms = cleanList(current.mechanisms)
      const candidateMechanisms = cleanList(candidate.mechanisms)
      const distinctive = candidateMechanisms.find(item => !currentMechanisms.includes(item)) || candidateSignals.find(item => !currentSignals.includes(item))
      const href = candidate.href || `/${candidate.type === 'compound' ? 'compounds' : 'herbs'}/${candidate.slug}`

      return {
        score,
        item: candidateName && score > 0 ? {
          href,
          title: candidateName,
          overlappingFocus: overlapSignals.length ? overlapSignals.join(', ') : 'Shared effect or mechanism language appears in the available data.',
          keyDistinction: distinctive ? `${candidateName} has distinct profile emphasis around ${distinctive.toLowerCase()}.` : 'The main distinction is not clear from the available structured fields.',
          evidenceEmphasis: getEvidenceLevel(candidate as ProfileRecord) ? `Evidence emphasis: ${getEvidenceLevel(candidate as ProfileRecord)}.` : 'Evidence emphasis should be interpreted from the full profile rather than assumed.',
        } : null,
      }
    })
    .filter(entry => entry.item)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.item as ComparisonFraming)
    .slice(0, 4)
}
