import {
  classifyHealthContentPurpose,
  type HealthContentPurpose,
  type HealthContentPurposeInput,
} from '@/src/lib/health-content-purpose'

export type EditorialReadinessInput = HealthContentPurposeInput & {
  primarySourceCount?: number
  hasEvidenceLimitations?: boolean
  hasSafetySection?: boolean
  hasMedicationContext?: boolean
  hasTreatmentBoundary?: boolean
  hasEditorialReview?: boolean
  hasDirectAnswer?: boolean
}

export type EditorialRequirement =
  | 'direct-answer'
  | 'primary-sources'
  | 'evidence-limitations'
  | 'safety-section'
  | 'medication-context'
  | 'treatment-boundary'
  | 'editorial-review'

export type EditorialReadinessResult = {
  purpose: HealthContentPurpose
  ymyl: boolean
  required: EditorialRequirement[]
  missing: EditorialRequirement[]
  canPublish: boolean
}

const BASE_REQUIREMENTS: EditorialRequirement[] = ['direct-answer']
const DISEASE_EDUCATION_REQUIREMENTS: EditorialRequirement[] = [
  'direct-answer',
  'primary-sources',
  'evidence-limitations',
  'safety-section',
  'medication-context',
  'editorial-review',
]
const DISEASE_TREATMENT_REQUIREMENTS: EditorialRequirement[] = [
  ...DISEASE_EDUCATION_REQUIREMENTS,
  'treatment-boundary',
]

function requirementsFor(purpose: HealthContentPurpose): EditorialRequirement[] {
  if (purpose === 'disease-treatment') return DISEASE_TREATMENT_REQUIREMENTS
  if (purpose === 'disease-education') return DISEASE_EDUCATION_REQUIREMENTS
  return BASE_REQUIREMENTS
}

function requirementMet(
  requirement: EditorialRequirement,
  input: EditorialReadinessInput,
  purpose: HealthContentPurpose,
): boolean {
  switch (requirement) {
    case 'direct-answer':
      return input.hasDirectAnswer === true
    case 'primary-sources':
      return (input.primarySourceCount ?? 0) >= (purpose === 'disease-treatment' ? 3 : 2)
    case 'evidence-limitations':
      return input.hasEvidenceLimitations === true
    case 'safety-section':
      return input.hasSafetySection === true
    case 'medication-context':
      return input.hasMedicationContext === true
    case 'treatment-boundary':
      return input.hasTreatmentBoundary === true
    case 'editorial-review':
      return input.hasEditorialReview === true
  }
}

/**
 * Publication-readiness gate for health content.
 *
 * Disease-related pages must clear a materially higher evidence and safety bar
 * than ordinary wellness/symptom pages. This gate does not imply medical review;
 * `hasEditorialReview` means a real editorial review event occurred. Qualified
 * external review, where used, is tracked separately.
 */
export function evaluateYmylEditorialGate(
  input: EditorialReadinessInput,
): EditorialReadinessResult {
  const classification = classifyHealthContentPurpose(input)
  const required = requirementsFor(classification.purpose)
  const missing = required.filter(
    (requirement) => !requirementMet(requirement, input, classification.purpose),
  )

  return {
    purpose: classification.purpose,
    ymyl: classification.ymyl,
    required,
    missing,
    canPublish: missing.length === 0,
  }
}
