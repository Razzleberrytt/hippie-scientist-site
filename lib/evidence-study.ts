export type EvidenceStudyClass =
  | 'meta_analysis'
  | 'systematic_review'
  | 'randomized_controlled_trial'
  | 'controlled_trial'
  | 'observational'
  | 'case_report'
  | 'animal'
  | 'in_vitro'
  | 'mechanistic'
  | 'narrative_review'
  | 'other'

export type EvidenceRelationship =
  | 'supports'
  | 'mixed'
  | 'contradicts'
  | 'no_clear_effect'
  | 'background'

export type EvidenceConfidence = 'high' | 'moderate' | 'low' | 'unknown'

export type EvidenceStudyRecord = {
  id: string
  title: string
  authors?: string
  journal?: string
  year?: number | string
  pmid?: string
  doi?: string
  url?: string
  studyType?: string
  evidenceClass: EvidenceStudyClass
  sampleSize?: number | string
  dose?: string
  duration?: string
  population?: string
  outcome?: string
  result?: string
  limitation?: string
  relationship: EvidenceRelationship
  confidence: EvidenceConfidence
  statisticalConsistency?: string
  effectSize?: string
  confidenceInterval?: string
  statisticalSignificance?: string
  absoluteDifference?: string
  clinicalMagnitude?: string
  replication?: string
  extractName?: string
  ingredients?: string[]
  conditions?: string[]
  safetyOutcome?: string
}

export type EvidenceStudyClassDefinition = {
  label: string
  hierarchyRank: number
  plainEnglish: string
  humanEvidence: boolean
}

export const EVIDENCE_STUDY_CLASS_DEFINITIONS: Record<EvidenceStudyClass, EvidenceStudyClassDefinition> = {
  meta_analysis: {
    label: 'Meta-analysis',
    hierarchyRank: 11,
    plainEnglish: 'Statistically combines results from multiple eligible studies; confidence still depends on the quality, consistency, and directness of those studies.',
    humanEvidence: true,
  },
  systematic_review: {
    label: 'Systematic review',
    hierarchyRank: 10,
    plainEnglish: 'Uses a predefined method to find and evaluate relevant studies, but may or may not pool their results statistically.',
    humanEvidence: true,
  },
  randomized_controlled_trial: {
    label: 'Randomized controlled trial',
    hierarchyRank: 9,
    plainEnglish: 'Randomly assigns participants to interventions or controls, reducing many sources of bias when the trial is conducted well.',
    humanEvidence: true,
  },
  controlled_trial: {
    label: 'Controlled trial',
    hierarchyRank: 8,
    plainEnglish: 'Compares an intervention with a control group but may lack random assignment or other safeguards of a strong randomized trial.',
    humanEvidence: true,
  },
  observational: {
    label: 'Observational research',
    hierarchyRank: 7,
    plainEnglish: 'Observes real-world associations without assigning treatment, so confounding can limit causal conclusions.',
    humanEvidence: true,
  },
  narrative_review: {
    label: 'Narrative review',
    hierarchyRank: 6,
    plainEnglish: 'Summarizes selected literature without the full prespecified search and selection methods of a systematic review.',
    humanEvidence: false,
  },
  case_report: {
    label: 'Case report',
    hierarchyRank: 5,
    plainEnglish: 'Describes one person or a very small series and can identify signals, but cannot establish typical effects or causality.',
    humanEvidence: true,
  },
  mechanistic: {
    label: 'Mechanistic research',
    hierarchyRank: 4,
    plainEnglish: 'Studies biological pathways or mechanisms. It can explain plausibility but does not by itself establish a clinical benefit.',
    humanEvidence: false,
  },
  animal: {
    label: 'Animal research',
    hierarchyRank: 3,
    plainEnglish: 'Tests effects in non-human animals. Useful for hypotheses and safety signals, but results may not translate to people.',
    humanEvidence: false,
  },
  in_vitro: {
    label: 'In-vitro research',
    hierarchyRank: 2,
    plainEnglish: 'Studies cells, tissues, or biochemical systems outside a living person. It is preclinical evidence, not proof of a human outcome.',
    humanEvidence: false,
  },
  other: {
    label: 'Other / unclear',
    hierarchyRank: 1,
    plainEnglish: 'The study design is not yet classified clearly enough to infer its place in the evidence hierarchy.',
    humanEvidence: false,
  },
}

const HUMAN_CLASSES = new Set<EvidenceStudyClass>([
  'meta_analysis',
  'systematic_review',
  'randomized_controlled_trial',
  'controlled_trial',
  'observational',
  'case_report',
])

export function normalizeEvidenceStudyClass(value: unknown): EvidenceStudyClass {
  const lower = String(value || '').trim().toLowerCase()

  if (!lower) return 'other'
  if (lower.includes('meta-analysis') || lower.includes('meta analysis') || lower.includes('meta_analysis')) return 'meta_analysis'
  if (lower.includes('systematic review') || lower.includes('systematic_review')) return 'systematic_review'
  if (
    lower.includes('randomized') ||
    lower.includes('randomised') ||
    lower.includes('rct') ||
    lower.includes('placebo-controlled') ||
    lower.includes('placebo controlled')
  ) return 'randomized_controlled_trial'
  if (lower.includes('controlled trial') || lower.includes('clinical trial') || lower.includes('intervention')) return 'controlled_trial'
  if (
    lower.includes('observational') ||
    lower.includes('cohort') ||
    lower.includes('cross-sectional') ||
    lower.includes('cross sectional') ||
    lower.includes('case-control') ||
    lower.includes('case control')
  ) return 'observational'
  if (lower.includes('case report') || lower.includes('case series')) return 'case_report'
  if (lower.includes('animal') || lower.includes('rodent') || lower.includes('murine') || lower.includes('in vivo')) return 'animal'
  if (lower.includes('in vitro') || lower.includes('cell') || lower.includes('cellular')) return 'in_vitro'
  if (lower.includes('mechanistic') || lower.includes('mechanism')) return 'mechanistic'
  if (lower.includes('review')) return 'narrative_review'

  return 'other'
}

export function formatEvidenceStudyClass(value: EvidenceStudyClass): string {
  return EVIDENCE_STUDY_CLASS_DEFINITIONS[value].label
}

export function evidenceStudyClassDefinition(value: EvidenceStudyClass): EvidenceStudyClassDefinition {
  return EVIDENCE_STUDY_CLASS_DEFINITIONS[value]
}

export function rankEvidenceStudyClasses(classes: EvidenceStudyClass[]): EvidenceStudyClass[] {
  return [...classes].sort(
    (a, b) => EVIDENCE_STUDY_CLASS_DEFINITIONS[b].hierarchyRank - EVIDENCE_STUDY_CLASS_DEFINITIONS[a].hierarchyRank,
  )
}

export function filterEvidenceStudiesByClass<T extends { evidenceClass: EvidenceStudyClass }>(
  studies: T[],
  allowed: EvidenceStudyClass[] | Set<EvidenceStudyClass>,
): T[] {
  const wanted = allowed instanceof Set ? allowed : new Set(allowed)
  return studies.filter((study) => wanted.has(study.evidenceClass))
}

export function normalizeEvidenceRelationship(value: unknown): EvidenceRelationship {
  const lower = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (lower === 'support' || lower === 'supportive' || lower === 'supports' || lower === 'positive') return 'supports'
  if (lower === 'mixed' || lower === 'partially_supports' || lower === 'partial') return 'mixed'
  if (lower === 'contradict' || lower === 'contradicting' || lower === 'contradicts' || lower === 'negative') return 'contradicts'
  if (lower === 'no_effect' || lower === 'null' || lower === 'neutral' || lower === 'no_clear_effect') return 'no_clear_effect'
  return 'background'
}

export function normalizeEvidenceConfidence(value: unknown): EvidenceConfidence {
  const lower = String(value || '').trim().toLowerCase()
  if (lower === 'high' || lower === 'strong') return 'high'
  if (lower === 'moderate' || lower === 'medium') return 'moderate'
  if (lower === 'low' || lower === 'limited') return 'low'
  return 'unknown'
}

export function isHumanEvidenceClass(value: EvidenceStudyClass): boolean {
  return HUMAN_CLASSES.has(value)
}

export function isHumanTrialClass(value: EvidenceStudyClass): boolean {
  return value === 'randomized_controlled_trial' || value === 'controlled_trial'
}

export function parseSampleSize(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value)
  const text = String(value || '').trim()
  if (!text) return null

  const explicitN = text.match(/\bn\s*=\s*([\d,]+)/i)
  const firstNumber = explicitN?.[1] || text.match(/([\d,]+)/)?.[1]
  if (!firstNumber) return null

  const parsed = Number(firstNumber.replace(/,/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null
}

export function evidenceStudyId(input: {
  pmid?: string
  doi?: string
  url?: string
  title?: string
}): string {
  if (input.pmid) return `pmid:${String(input.pmid).trim()}`
  if (input.doi) return `doi:${String(input.doi).trim().toLowerCase()}`
  if (input.url) return `url:${String(input.url).trim().toLowerCase()}`

  const slug = String(input.title || 'untitled')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

  return `title:${slug || 'untitled'}`
}

export function evidenceSourceUrl(input: { pmid?: string; doi?: string; url?: string }): string | undefined {
  const rawUrl = String(input.url || '').trim()
  if (rawUrl) return rawUrl
  if (input.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${String(input.pmid).trim()}/`
  if (input.doi) return `https://doi.org/${String(input.doi).trim()}`
  return undefined
}

export function evidenceRelationshipLabel(value: EvidenceRelationship): string {
  const labels: Record<EvidenceRelationship, string> = {
    supports: 'Supports',
    mixed: 'Mixed',
    contradicts: 'Contradicts',
    no_clear_effect: 'No clear effect',
    background: 'Background',
  }
  return labels[value]
}

export type EvidenceEffectContext = Pick<
  EvidenceStudyRecord,
  | 'effectSize'
  | 'confidenceInterval'
  | 'statisticalSignificance'
  | 'absoluteDifference'
  | 'clinicalMagnitude'
  | 'duration'
  | 'population'
  | 'replication'
>

export type EvidenceEffectContextIssue = {
  code:
    | 'p-value-without-effect-size'
    | 'p-value-without-magnitude-context'
    | 'effect-size-without-uncertainty'
    | 'missing-duration-context'
    | 'missing-population-context'
    | 'missing-replication-context'
  message: string
}

export function validateEvidenceEffectContext(context: EvidenceEffectContext): EvidenceEffectContextIssue[] {
  const issues: EvidenceEffectContextIssue[] = []

  if (context.statisticalSignificance && !context.effectSize && !context.absoluteDifference) {
    issues.push({
      code: 'p-value-without-effect-size',
      message: 'Statistical significance must not stand alone; include an effect size or absolute difference when the source reports one.',
    })
  }

  if (context.statisticalSignificance && !context.clinicalMagnitude) {
    issues.push({
      code: 'p-value-without-magnitude-context',
      message: 'Statistical significance should be accompanied by clinically meaningful magnitude context.',
    })
  }

  if (context.effectSize && !context.confidenceInterval) {
    issues.push({
      code: 'effect-size-without-uncertainty',
      message: 'Effect sizes should include a confidence interval when the source reports one.',
    })
  }

  if (!context.duration) {
    issues.push({
      code: 'missing-duration-context',
      message: 'Study duration is required to distinguish acute, short-term, and sustained findings.',
    })
  }

  if (!context.population) {
    issues.push({
      code: 'missing-population-context',
      message: 'Studied population is required so findings are not generalized beyond the participants actually studied.',
    })
  }

  if (!context.replication) {
    issues.push({
      code: 'missing-replication-context',
      message: 'Replication context is required to distinguish one-off findings from repeatedly observed results.',
    })
  }

  return issues
}

export type EvidenceStudyMetrics = {
  totalStudies: number
  humanStudies: number
  humanTrials: number
  approximateParticipants: number
  studiesWithParticipantCounts: number
  supportive: number
  mixed: number
  contradicting: number
  noClearEffect: number
  background: number
  consistency: 'consistent' | 'mostly_consistent' | 'mixed' | 'conflicting' | 'unclear'
}

export function summarizeEvidenceStudies(studies: EvidenceStudyRecord[]): EvidenceStudyMetrics {
  let humanStudies = 0
  let humanTrials = 0
  let approximateParticipants = 0
  let studiesWithParticipantCounts = 0
  let supportive = 0
  let mixed = 0
  let contradicting = 0
  let noClearEffect = 0
  let background = 0

  for (const study of studies) {
    if (isHumanEvidenceClass(study.evidenceClass)) humanStudies += 1
    if (isHumanTrialClass(study.evidenceClass)) humanTrials += 1

    const n = parseSampleSize(study.sampleSize)
    if (n && isHumanEvidenceClass(study.evidenceClass)) {
      approximateParticipants += n
      studiesWithParticipantCounts += 1
    }

    switch (study.relationship) {
      case 'supports': supportive += 1; break
      case 'mixed': mixed += 1; break
      case 'contradicts': contradicting += 1; break
      case 'no_clear_effect': noClearEffect += 1; break
      default: background += 1
    }
  }

  const directional = supportive + mixed + contradicting + noClearEffect
  let consistency: EvidenceStudyMetrics['consistency'] = 'unclear'
  if (directional > 0) {
    const supportShare = supportive / directional
    const contradictionShare = (contradicting + noClearEffect) / directional
    if (supportShare >= 0.8 && contradictionShare <= 0.1) consistency = 'consistent'
    else if (supportShare >= 0.6 && contradictionShare <= 0.25) consistency = 'mostly_consistent'
    else if (supportive > 0 && contradicting > 0) consistency = 'conflicting'
    else consistency = 'mixed'
  }

  return {
    totalStudies: studies.length,
    humanStudies,
    humanTrials,
    approximateParticipants,
    studiesWithParticipantCounts,
    supportive,
    mixed,
    contradicting,
    noClearEffect,
    background,
    consistency,
  }
}

export function evidenceConsistencyLabel(value: EvidenceStudyMetrics['consistency']): string {
  const labels: Record<EvidenceStudyMetrics['consistency'], string> = {
    consistent: 'Statistically directionally consistent',
    mostly_consistent: 'Mostly consistent',
    mixed: 'Mixed / heterogeneous',
    conflicting: 'Material disagreement present',
    unclear: 'Consistency not yet classifiable',
  }
  return labels[value]
}
