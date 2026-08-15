export const STUDY_CLASSES = [
  'meta-analysis',
  'systematic-review',
  'rct',
  'controlled-trial',
  'observational',
  'preclinical',
  'narrative-review',
  'case-report',
] as const

export type StudyClass = (typeof STUDY_CLASSES)[number]

export interface StudyClassDefinition {
  label: string
  hierarchyRank: number
  plainEnglish: string
  humanEvidence: boolean
}

export const STUDY_CLASS_DEFINITIONS: Record<StudyClass, StudyClassDefinition> = {
  'meta-analysis': {
    label: 'Meta-analysis',
    hierarchyRank: 8,
    plainEnglish: 'Statistically combines results from multiple eligible studies; confidence depends on the quality and similarity of those studies.',
    humanEvidence: true,
  },
  'systematic-review': {
    label: 'Systematic review',
    hierarchyRank: 7,
    plainEnglish: 'Uses a predefined method to find and evaluate the relevant literature, but may or may not pool results statistically.',
    humanEvidence: true,
  },
  rct: {
    label: 'Randomized controlled trial',
    hierarchyRank: 6,
    plainEnglish: 'Randomly assigns participants to interventions or controls, reducing many sources of bias when conducted well.',
    humanEvidence: true,
  },
  'controlled-trial': {
    label: 'Controlled trial',
    hierarchyRank: 5,
    plainEnglish: 'Compares an intervention with a control group but may lack random assignment or other safeguards of a strong RCT.',
    humanEvidence: true,
  },
  observational: {
    label: 'Observational research',
    hierarchyRank: 4,
    plainEnglish: 'Observes real-world associations without assigning treatment, so confounding can limit causal conclusions.',
    humanEvidence: true,
  },
  preclinical: {
    label: 'Preclinical research',
    hierarchyRank: 2,
    plainEnglish: 'Laboratory, cell, animal, or mechanistic evidence that can explain plausibility but does not establish a human clinical benefit.',
    humanEvidence: false,
  },
  'narrative-review': {
    label: 'Narrative review',
    hierarchyRank: 3,
    plainEnglish: 'Summarizes literature without the full prespecified search and selection methods of a systematic review.',
    humanEvidence: true,
  },
  'case-report': {
    label: 'Case report',
    hierarchyRank: 1,
    plainEnglish: 'Describes one person or a very small series and can identify signals, but cannot establish typical effects or causality.',
    humanEvidence: true,
  },
}

export interface StudyEffectContext {
  effectSize?: string
  confidenceInterval?: string
  statisticalSignificance?: string
  absoluteDifference?: string
  clinicalMagnitude?: string
  duration?: string
  population?: string
  replication?: string
}

export interface EffectContextIssue {
  code:
    | 'p-value-without-effect-size'
    | 'p-value-without-magnitude-context'
    | 'effect-size-without-uncertainty'
    | 'missing-duration-context'
    | 'missing-population-context'
    | 'missing-replication-context'
  message: string
}

export function getStudyClassDefinition(studyClass: StudyClass): StudyClassDefinition {
  return STUDY_CLASS_DEFINITIONS[studyClass]
}

export function rankStudyClasses(classes: StudyClass[]): StudyClass[] {
  return [...classes].sort(
    (a, b) => STUDY_CLASS_DEFINITIONS[b].hierarchyRank - STUDY_CLASS_DEFINITIONS[a].hierarchyRank,
  )
}

export function filterByStudyClass<T extends { studyClass: StudyClass }>(
  studies: T[],
  allowed: StudyClass[] | Set<StudyClass>,
): T[] {
  const wanted = allowed instanceof Set ? allowed : new Set(allowed)
  return studies.filter((study) => wanted.has(study.studyClass))
}

export function validateEffectContext(context: StudyEffectContext): EffectContextIssue[] {
  const issues: EffectContextIssue[] = []

  if (context.statisticalSignificance && !context.effectSize && !context.absoluteDifference) {
    issues.push({
      code: 'p-value-without-effect-size',
      message: 'Statistical significance must not be presented without an effect size or absolute difference.',
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
      message: 'Study duration is required for interpreting whether an effect was acute, short term, or sustained.',
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

export function studyClassPlainEnglish(studyClass: StudyClass): string {
  const definition = STUDY_CLASS_DEFINITIONS[studyClass]
  return `${definition.label}: ${definition.plainEnglish}`
}
