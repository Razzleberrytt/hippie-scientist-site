import { text, unique } from '@/lib/display-utils'

export type SafetyClassification = {
  label: string
  description: string
  tone: 'caution' | 'context' | 'neutral'
}

function safetyText(record: any): string {
  return [
    record?.safety,
    record?.safetyNotes,
    record?.safety_notes,
    record?.contraindications,
    record?.interactions,
    record?.avoid,
    record?.cautions,
    record?.warnings,
    record?.summary,
    record?.description,
  ]
    .map(text)
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function item(label: string, description: string, tone: SafetyClassification['tone'] = 'caution'): SafetyClassification {
  return { label, description, tone }
}

export function getSafetyClassifications(record: any, limit = 6): SafetyClassification[] {
  const source = safetyText(record)
  const classifications: SafetyClassification[] = []

  if (/\b(interaction|interacts|medication|drug|cyp\d|ssri|snri|maoi|sedative|antidepressant)\b/.test(source)) {
    classifications.push(item('Interaction-Aware', 'Medication or interaction context is explicitly noted.'))
  }

  if (/\b(liver|hepatic|hepatotoxic|transaminase|alt|ast)\b/.test(source)) {
    classifications.push(item('Liver-Sensitive', 'Liver-related caution language appears in the profile.'))
  }

  if (/\b(hormone|hormonal|estrogen|androgen|testosterone|thyroid|endocrine)\b/.test(source)) {
    classifications.push(item('Hormonal Activity Context', 'Hormone-adjacent wording is present and should be interpreted carefully.', 'context'))
  }

  if (/\b(stimulant|stimulating|caffeine|adrenergic|jitters|insomnia|tachycardia)\b/.test(source)) {
    classifications.push(item('Stimulant-Like Profile', 'Stimulant-like or activating caution language is present.', 'context'))
  }

  if (/\b(anticoagul|antiplatelet|warfarin|bleed|bleeding|blood thinner|clotting)\b/.test(source)) {
    classifications.push(item('Anticoagulant Caution', 'Bleeding or anticoagulant-adjacent caution language is present.'))
  }

  if (/\b(pregnan|breastfeeding|lactation|nursing)\b/.test(source)) {
    classifications.push(item('Pregnancy/Breastfeeding Caution', 'Pregnancy or breastfeeding caution language is present.'))
  }

  const seen = new Set<string>()
  return classifications
    .filter(classification => {
      if (seen.has(classification.label)) return false
      seen.add(classification.label)
      return true
    })
    .slice(0, Math.max(0, limit))
}

export function getSafetyLabels(record: any, limit = 6): string[] {
  return unique(getSafetyClassifications(record, limit).map(classification => classification.label))
}

export function getSafetySensitivity(record: any): 'high' | 'moderate' | 'low' {
  const labels = getSafetyLabels(record, 6)
  const source = safetyText(record)

  if (labels.length >= 2 || /\b(avoid|contraindicat|warning|do not use|serious)\b/.test(source)) {
    return 'high'
  }

  if (labels.length === 1 || /\b(caution|consult|monitor|sensitive)\b/.test(source)) {
    return 'moderate'
  }

  return 'low'
}
