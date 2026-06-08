import { getSafetyClassifications } from '@/lib/safety-classification'

export type SafetyNarrative = {
  label: string
  narrative: string
}

const NARRATIVES: Record<string, string> = {
  'Interaction-Aware': 'Interaction language is present, so this profile keeps medication-adjacent context visible without turning it into individualized guidance.',
  'Stimulant-Like Profile': 'Activating or stimulant-sensitive language is treated as a caution context, especially where sleep, anxiety, or cardiovascular sensitivity may matter.',
  'Liver-Sensitive': 'Liver-related language is framed conservatively because organ-specific cautions depend on dose, duration, health status, and concurrent exposures.',
  'Anticoagulant Caution': 'Bleeding or anticoagulant-adjacent language is surfaced as a caution signal rather than a prediction of individual risk.',
  'Pregnancy/Breastfeeding Caution': 'Pregnancy and breastfeeding references are handled with extra restraint because suitability depends on individualized clinical context.',
  'Hormonal Activity Context': 'Hormone-adjacent wording is presented as context only, not as evidence of predictable endocrine effects in a given person.',
}

export function buildSafetyNarratives(record: Record<string, unknown>, limit = 3): SafetyNarrative[] {
  return getSafetyClassifications(record, limit)
    .map(classification => ({
      label: classification.label,
      narrative: NARRATIVES[classification.label] || classification.description,
    }))
    .filter(item => item.narrative)
}

export function buildSafetyNarrativeSummary(record: Record<string, unknown>) {
  const narratives = buildSafetyNarratives(record, 2)
  if (narratives.length === 0) return ''

  return narratives.map(item => item.narrative).join(' ')
}
