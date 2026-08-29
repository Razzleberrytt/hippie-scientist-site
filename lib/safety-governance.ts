export const SAFETY_SEVERITIES = ['low', 'moderate', 'high', 'critical'] as const
export type SafetySeverity = (typeof SAFETY_SEVERITIES)[number]

export const SAFETY_CERTAINTIES = ['known', 'probable', 'theoretical', 'unknown'] as const
export type SafetyCertainty = (typeof SAFETY_CERTAINTIES)[number]

export type SafetyRiskClass =
  | 'general'
  | 'high-risk-compound'
  | 'addiction-risk'
  | 'pregnancy'
  | 'pediatric'
  | 'major-medication-interaction'

export interface SafetyProvenance {
  sourceIds: string[]
  reviewedAt?: string
  reviewer?: string
  note?: string
}

export interface SafetyFlag {
  id: string
  severity: SafetySeverity
  certainty: SafetyCertainty
  riskClass: SafetyRiskClass
  provenance: SafetyProvenance
  unsupervisedUseInappropriate?: boolean
}

export interface SafetyPolicy {
  reviewLevel: 'standard' | 'enhanced' | 'expert'
  suppressCommercialModules: boolean
  allowStartLowLanguage: boolean
  messageMode: 'routine-caution' | 'uncertainty-forward' | 'high-risk-harm-reduction' | 'avoid-unsupervised-use'
}

const REVIEW_LEVEL: Record<SafetyRiskClass, SafetyPolicy['reviewLevel']> = {
  general: 'standard',
  'high-risk-compound': 'enhanced',
  'addiction-risk': 'expert',
  pregnancy: 'expert',
  pediatric: 'expert',
  'major-medication-interaction': 'expert',
}

export function safetyPolicyForFlag(flag: SafetyFlag): SafetyPolicy {
  const reviewLevel = REVIEW_LEVEL[flag.riskClass]
  const severe = flag.severity === 'high' || flag.severity === 'critical'
  const established = flag.certainty === 'known' || flag.certainty === 'probable'
  const suppressCommercialModules =
    flag.unsupervisedUseInappropriate === true ||
    flag.riskClass === 'addiction-risk' ||
    flag.riskClass === 'pregnancy' ||
    flag.riskClass === 'pediatric' ||
    (severe && established)

  const allowStartLowLanguage = flag.unsupervisedUseInappropriate !== true && !suppressCommercialModules

  let messageMode: SafetyPolicy['messageMode'] = 'routine-caution'
  if (flag.unsupervisedUseInappropriate) messageMode = 'avoid-unsupervised-use'
  else if (flag.riskClass !== 'general' || severe) messageMode = 'high-risk-harm-reduction'
  else if (flag.certainty === 'theoretical' || flag.certainty === 'unknown') messageMode = 'uncertainty-forward'

  return {
    reviewLevel,
    suppressCommercialModules,
    allowStartLowLanguage,
    messageMode,
  }
}

export function hasCompleteSafetyProvenance(flag: SafetyFlag): boolean {
  return flag.provenance.sourceIds.length > 0 && Boolean(flag.provenance.reviewedAt)
}

export type PageCategory =
  | 'commercial'
  | 'comparison'
  | 'safety'
  | 'best-of'
  | 'disease-related'
  | 'mechanism-reference'
  | 'informational'

export interface PageQualityInputs {
  evidenceComplete: boolean
  safetyComplete: boolean
  sourcingComplete: boolean
  bothComparisonSidesComplete?: boolean
  interactionDataSourceBacked?: boolean
  rankingMethodologyPublished?: boolean
  diseaseEvidenceStandardMet?: boolean
  commercialFramingPresent?: boolean
}

export interface PageQualityGateResult {
  publishable: boolean
  commercialAllowed: boolean
  failures: string[]
}

export function evaluatePageQualityGate(
  category: PageCategory,
  input: PageQualityInputs,
): PageQualityGateResult {
  const failures: string[] = []

  const requireCore = () => {
    if (!input.evidenceComplete) failures.push('evidence-incomplete')
    if (!input.safetyComplete) failures.push('safety-incomplete')
    if (!input.sourcingComplete) failures.push('sourcing-incomplete')
  }

  if (category === 'commercial') {
    requireCore()
  }

  if (category === 'comparison') {
    requireCore()
    if (!input.bothComparisonSidesComplete) failures.push('comparison-side-incomplete')
  }

  if (category === 'safety') {
    if (!input.safetyComplete) failures.push('safety-incomplete')
    if (!input.sourcingComplete) failures.push('sourcing-incomplete')
    if (!input.interactionDataSourceBacked) failures.push('interaction-data-not-source-backed')
  }

  if (category === 'best-of') {
    requireCore()
    if (!input.rankingMethodologyPublished) failures.push('ranking-methodology-missing')
  }

  if (category === 'disease-related') {
    requireCore()
    if (!input.diseaseEvidenceStandardMet) failures.push('disease-evidence-standard-not-met')
  }

  if (category === 'mechanism-reference' && input.commercialFramingPresent) {
    failures.push('mechanism-reference-has-commercial-framing')
  }

  const publishable = failures.length === 0
  const commercialAllowed =
    publishable && category !== 'mechanism-reference' && category !== 'safety'

  return { publishable, commercialAllowed, failures }
}

export function safetyAxesAreIndependent(flag: SafetyFlag): boolean {
  // Deliberately tautological at runtime: this helper exists to make callers
  // consume severity and certainty as separate fields rather than deriving one
  // from the other.
  return SAFETY_SEVERITIES.includes(flag.severity) && SAFETY_CERTAINTIES.includes(flag.certainty)
}
