import { STANDARD_SAFETY_LABELS, type StandardSafetyLabel } from './decision-primitives'

const SAFETY_SYNONYM_RULES: Array<{ pattern: RegExp; value: StandardSafetyLabel }> = [
  { pattern: /\b(interaction|interacts|warfarin|ssri|maoi|anticoagul|antiplatelet|polypharmacy|cns depressant)\b/i, value: 'Interaction risk' },
  { pattern: /\b(limited safety|limited data|low data|no safety data|insufficient safety)\b/i, value: 'Limited safety data' },
  { pattern: /\b(avoid|contraindicat|caution|consult|clinician|pregnan|breastfeeding|liver|kidney|seizure|bleed|sedat|toxic|risk|do not)\b/i, value: 'Use caution' },
  { pattern: /\b(generally|well tolerated|low concern|low risk|food use|food derived|safe|standard caution)\b/i, value: 'Generally well tolerated' },
  { pattern: /\b(needs? review|review needed|unknown|tbd|draft|placeholder|profile pending)\b/i, value: 'Needs review' },
]

export type SafetyNormalizationResult = {
  value: StandardSafetyLabel
  canonical: boolean
  source: string
}

export function normalizeSafetyEnum(raw: unknown): SafetyNormalizationResult {
  const source = String(raw ?? '').trim()
  if (!source) return { value: 'Needs review', canonical: false, source }

  const canonical = STANDARD_SAFETY_LABELS.find(label => label.toLowerCase() === source.toLowerCase())
  if (canonical) return { value: canonical, canonical: true, source }

  for (const rule of SAFETY_SYNONYM_RULES) {
    if (rule.pattern.test(source)) return { value: rule.value, canonical: false, source }
  }

  return { value: 'Needs review', canonical: false, source }
}
