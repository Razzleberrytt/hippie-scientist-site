export type HealthContentPurpose =
  | 'general-wellness'
  | 'symptom-education'
  | 'disease-education'
  | 'disease-treatment'

export type HealthContentPurposeInput = {
  path?: string
  title?: string
  description?: string
  headings?: string[]
  explicitPurpose?: HealthContentPurpose
}

export type HealthContentPurposeResult = {
  purpose: HealthContentPurpose
  ymyl: boolean
  diseaseTerms: string[]
  treatmentSignals: string[]
  reasons: string[]
}

const DISEASE_PATTERNS: Array<[string, RegExp]> = [
  ['adhd', /\badhd\b|attention[- ]deficit\/hyperactivity disorder/i],
  ['diabetes', /\b(?:type\s*[12]\s+)?diabetes\b/i],
  ['pcos', /\bpcos\b|polycystic ovary syndrome/i],
  ['hypertension', /\bhypertension\b|high blood pressure/i],
  ['depression', /\bdepression\b|major depressive disorder/i],
  ['anxiety-disorder', /\b(?:generalized|social|panic) anxiety disorder\b|\bgad\b/i],
  ['insomnia', /\bchronic insomnia\b|\binsomnia disorder\b/i],
  ['osteoarthritis', /\bosteoarthritis\b/i],
  ['hyperlipidemia', /\bhyperlipid(?:emia|aemia)\b|high cholesterol disease/i],
  ['liver-disease', /\b(?:fatty liver|nafld|masld|cirrhosis|liver disease)\b/i],
  ['kidney-disease', /\b(?:chronic kidney disease|ckd|kidney disease)\b/i],
]

const SYMPTOM_PATTERNS: Array<[string, RegExp]> = [
  ['brain-fog', /\bbrain fog\b/i],
  ['fatigue', /\bfatigue\b|low energy/i],
  ['stress', /\bstress\b|overstimulation/i],
  ['sleep-problem', /\btrouble sleeping\b|sleep onset|staying asleep/i],
  ['anxious-feelings', /\banxious feelings?\b|nervousness/i],
  ['focus', /\bfocus\b|attention\b/i],
  ['joint-discomfort', /\bjoint (?:pain|discomfort|stiffness)\b/i],
]

const TREATMENT_PATTERNS: Array<[string, RegExp]> = [
  ['treat', /\b(?:treat|treats|treating|treatment)\b/i],
  ['therapy', /\btherap(?:y|ies|eutic)\b/i],
  ['cure', /\b(?:cure|cures|curing)\b/i],
  ['manage-disease', /\bmanage(?:ment)?\s+(?:of\s+)?(?:diabetes|pcos|hypertension|depression|adhd|insomnia|osteoarthritis)\b/i],
  ['replace-medication', /\b(?:replace|alternative to|instead of)\b.{0,30}\b(?:medication|medicine|drug|prescription)\b/i],
]

function searchableText(input: HealthContentPurposeInput): string {
  return [input.path, input.title, input.description, ...(input.headings ?? [])]
    .filter(Boolean)
    .join(' ')
}

function matches(text: string, patterns: Array<[string, RegExp]>): string[] {
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([label]) => label)
}

/**
 * Separate wellness/symptom research from disease-treatment intent before page
 * templates, monetization, or editorial gates make downstream decisions.
 *
 * This is deliberately conservative: disease language alone creates YMYL
 * disease-education status; treatment language plus disease language escalates
 * to disease-treatment. A treatment verb without a named disease does not turn
 * ordinary wellness copy into a disease page by itself.
 */
export function classifyHealthContentPurpose(
  input: HealthContentPurposeInput,
): HealthContentPurposeResult {
  if (input.explicitPurpose) {
    return {
      purpose: input.explicitPurpose,
      ymyl: input.explicitPurpose === 'disease-education' || input.explicitPurpose === 'disease-treatment',
      diseaseTerms: [],
      treatmentSignals: [],
      reasons: ['explicit-purpose'],
    }
  }

  const text = searchableText(input)
  const diseaseTerms = matches(text, DISEASE_PATTERNS)
  const treatmentSignals = matches(text, TREATMENT_PATTERNS)
  const symptomTerms = matches(text, SYMPTOM_PATTERNS)
  const reasons: string[] = []

  if (diseaseTerms.length && treatmentSignals.length) {
    reasons.push('named-disease', 'treatment-intent')
    return { purpose: 'disease-treatment', ymyl: true, diseaseTerms, treatmentSignals, reasons }
  }

  if (diseaseTerms.length) {
    reasons.push('named-disease')
    return { purpose: 'disease-education', ymyl: true, diseaseTerms, treatmentSignals, reasons }
  }

  if (symptomTerms.length) {
    reasons.push('symptom-or-function-intent')
    return { purpose: 'symptom-education', ymyl: false, diseaseTerms, treatmentSignals, reasons }
  }

  reasons.push('wellness-or-research-intent')
  return { purpose: 'general-wellness', ymyl: false, diseaseTerms, treatmentSignals, reasons }
}

export function isDiseaseRelatedPurpose(purpose: HealthContentPurpose): boolean {
  return purpose === 'disease-education' || purpose === 'disease-treatment'
}
