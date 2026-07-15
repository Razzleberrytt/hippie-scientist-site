import { text, unique } from '@/lib/display-utils'

export type CompoundTrustGuidance = {
  evidenceLabel: string
  safetyDetail: string
  avoidSummary: string
  providerGuidance: string
}

function cleanItems(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value]
  return unique(
    values
      .flatMap(item => text(item).split(/[|;]+/))
      .map(item => item.trim())
      .filter(Boolean),
  )
}

function splitSafetyEvidence(value: unknown) {
  const safety = typeof value === 'string' ? value.trim() : text(value).trim()
  const match = safety.match(/^Safety evidence:\s*([^.!?]+)[.!?]?\s*(.*)$/i)
  if (!match) return { evidenceLabel: '', safetyDetail: safety }

  return {
    evidenceLabel: match[1].trim().replace(/[.;:]+$/, ''),
    safetyDetail: match[2].trim(),
  }
}

function providerTopics(source: string) {
  const topics: string[] = []
  if (/\b(medication|interaction|anticoagul|antiplatelet|warfarin|antihypertensive|pde-?5)\b/i.test(source)) {
    topics.push('you use relevant medications')
  }
  if (/\b(pregnan\w*|breastfeed\w*|lactation)\b/i.test(source)) {
    topics.push('you are pregnant or breastfeeding')
  }
  if (/\b(surgery|postoperative|operation)\b/i.test(source)) {
    topics.push('surgery is planned or recent')
  }
  if (/\b(liver|kidney|seizure|blood pressure|critical illness|immunocomprom|medical fragility)\b/i.test(source)) {
    topics.push('you have a condition named in this safety summary')
  }
  return unique(topics)
}

export function buildCompoundTrustGuidance(
  record: Record<string, unknown>,
  explicitAvoidItems: string[],
): CompoundTrustGuidance {
  const safety = record.safety || record.runtime_safety || record.safetyNotes || record.safety_notes
  const { evidenceLabel, safetyDetail } = splitSafetyEvidence(safety)
  const interactions = cleanItems(record.interactions)
  const avoidSummary = explicitAvoidItems.length
    ? explicitAvoidItems.join('; ')
    : 'No specific evidence-backed contraindication is documented for this profile. This is not the same as established safety.'

  const source = [safetyDetail, avoidSummary, interactions.join(' ')].filter(Boolean).join(' ')
  const topics = providerTopics(source)
  const providerGuidance = interactions.length
    ? `you take: ${interactions.join(', ')}.`
    : topics.length
      ? `${topics.join(', ')}.`
      : evidenceLabel
        ? 'your formulation, dose, or health context differs from the evidence summarized here.'
        : ''

  return { evidenceLabel, safetyDetail, avoidSummary, providerGuidance }
}
