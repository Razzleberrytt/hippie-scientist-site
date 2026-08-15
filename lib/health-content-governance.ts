import { list, text } from '@/lib/display-utils'

export type HealthContentIntent = 'general-wellness' | 'disease-treatment' | 'unclear'

export type HealthContentGovernance = {
  intent: HealthContentIntent
  source: 'explicit' | 'primary-topic' | 'default'
  diseaseTreatment: boolean
}

export type DiseaseEditorialAssessment = {
  required: boolean
  approved: boolean
  reviewApproved: boolean
  humanEvidenceAdequate: boolean
  safetyCoverageAdequate: boolean
  reasons: string[]
}

const DISEASE_TREATMENT_PATTERN = /\b(?:cancer|tumou?r|diabetes|prediabetes|hypertension|high blood pressure|hyperlipidemia|high cholesterol|cardiovascular disease|heart disease|coronary|stroke|arthritis|osteoarthritis|rheumatoid|depression|major depressive|bipolar|schizophrenia|alzheimer|dementia|parkinson|epilepsy|seizure|asthma|copd|chronic kidney|kidney disease|liver disease|hepatitis|cirrhosis|pcos|polycystic ovary|endometriosis|osteoporosis|infection|influenza|covid|migraine|glaucoma|macular degeneration)\b/i

const WELLNESS_PATTERN = /\b(?:wellness|general wellness|sleep support|stress|relaxation|focus|attention|energy|exercise|recovery|healthy aging|longevity research|cognition|memory|mood support|digestive support)\b/i

function normalizeIntent(value: unknown): HealthContentIntent | null {
  const candidate = text(value).toLowerCase().replace(/[_\s]+/g, '-')
  if (/^(disease-treatment|medical-treatment|disease|clinical-treatment|ymyl)$/.test(candidate)) {
    return 'disease-treatment'
  }
  if (/^(general-wellness|wellness|general|education|research-reference)$/.test(candidate)) {
    return 'general-wellness'
  }
  return null
}

function primaryTopic(record: Record<string, unknown>): string {
  const fields = [
    record?.primary_condition,
    record?.primary_outcome,
    record?.condition,
    record?.indication,
    record?.primary_indication,
  ]
  return fields.map(text).filter(Boolean).join(' ')
}

function hasApprovedEnhancedReview(record: Record<string, unknown>): boolean {
  const reviewStatus = [
    record?.ymyl_review_status,
    record?.enhanced_review_status,
    record?.editorial_review_status,
  ]
    .map(text)
    .find(Boolean)

  return /^(approved|reviewed|verified|passed|complete)$/i.test(reviewStatus || '')
}

function hasAdequateHumanEvidence(record: Record<string, unknown>): boolean {
  const grade = text(record?.evidence_grade || record?.evidence_level || record?.evidence_tier)
  if (/^(?:A|B)(?:\b|[+-])/i.test(grade) || /\b(?:strong|moderate)\s+human\b/i.test(grade)) return true

  const humanEvidence = text(record?.human_evidence || record?.human_evidence_summary)
  if (!humanEvidence || /\b(?:none|absent|lacking|no human|preclinical only|animal only|in[- ]vitro only)\b/i.test(humanEvidence)) {
    return false
  }

  const humanStudyCount = Number(record?.human_study_count || record?.human_trials || record?.clinical_study_count || 0)
  return humanStudyCount >= 2
}

function hasAdequateSafetyCoverage(record: Record<string, unknown>): boolean {
  const sections = [
    text(record?.safety || record?.safety_summary),
    text(record?.contraindications),
    text(record?.interactions),
    ...list(record?.safety_flags),
  ].filter((value) => value && !/^(?:unknown|none|n\/?a|not available|no data)$/i.test(value))

  return sections.length >= 2
}

/**
 * Classify the page's primary health intent without scanning every secondary
 * mention on the record. This deliberately avoids turning an ingredient page
 * into disease-treatment content merely because a safety field happens to name
 * a disease or medication-sensitive population.
 */
export function getHealthContentGovernance(record: Record<string, unknown>): HealthContentGovernance {
  const explicitFields = [record?.content_intent, record?.medical_intent, record?.health_intent]
  for (const value of explicitFields) {
    const explicit = normalizeIntent(value)
    if (explicit) {
      return {
        intent: explicit,
        source: 'explicit',
        diseaseTreatment: explicit === 'disease-treatment',
      }
    }
  }

  const topic = primaryTopic(record)
  if (topic && DISEASE_TREATMENT_PATTERN.test(topic)) {
    return { intent: 'disease-treatment', source: 'primary-topic', diseaseTreatment: true }
  }
  if (topic && WELLNESS_PATTERN.test(topic)) {
    return { intent: 'general-wellness', source: 'primary-topic', diseaseTreatment: false }
  }

  return { intent: 'unclear', source: 'default', diseaseTreatment: false }
}

/**
 * Disease-treatment pages have a higher publication bar than ordinary wellness
 * pages. A generic PUBLISH flag cannot bypass this assessment.
 */
export function getDiseaseEditorialAssessment(record: Record<string, unknown>): DiseaseEditorialAssessment {
  const governance = getHealthContentGovernance(record)
  if (!governance.diseaseTreatment) {
    return {
      required: false,
      approved: true,
      reviewApproved: true,
      humanEvidenceAdequate: true,
      safetyCoverageAdequate: true,
      reasons: [],
    }
  }

  const reviewApproved = hasApprovedEnhancedReview(record)
  const humanEvidenceAdequate = hasAdequateHumanEvidence(record)
  const safetyCoverageAdequate = hasAdequateSafetyCoverage(record)
  const reasons: string[] = []

  if (!reviewApproved) reasons.push('enhanced-editorial-review-required')
  if (!humanEvidenceAdequate) reasons.push('direct-human-evidence-below-disease-page-threshold')
  if (!safetyCoverageAdequate) reasons.push('safety-coverage-below-disease-page-threshold')

  return {
    required: true,
    approved: reasons.length === 0,
    reviewApproved,
    humanEvidenceAdequate,
    safetyCoverageAdequate,
    reasons,
  }
}
