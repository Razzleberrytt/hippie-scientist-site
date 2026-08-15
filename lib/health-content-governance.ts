import { text } from '@/lib/display-utils'

export type HealthContentIntent = 'general-wellness' | 'disease-treatment' | 'unclear'

export type HealthContentGovernance = {
  intent: HealthContentIntent
  source: 'explicit' | 'primary-topic' | 'default'
  diseaseTreatment: boolean
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
