export type CanonicalSafetySignal =
  | 'Sedation'
  | 'Stimulation'
  | 'Serotonergic'
  | 'Cardiovascular'
  | 'Bleeding'
  | 'Liver'
  | 'Kidney'
  | 'Seizure'
  | 'Dependence / withdrawal'
  | 'Pregnancy / breastfeeding'
  | 'Drug metabolism'
  | 'Immune'
  | 'Metabolic'
  | 'Toxicity concern'

export type SafetySignalRule = {
  label: CanonicalSafetySignal
  pattern: RegExp
}

/**
 * Canonical presentation taxonomy for structured safety signals.
 *
 * This is intentionally a terminology matcher, not a clinical severity engine:
 * it converts existing safety/mechanism text into consistent labels without
 * inferring that missing text means a substance is safe.
 */
export const SAFETY_SIGNAL_RULES: readonly SafetySignalRule[] = [
  { label: 'Sedation', pattern: /sedat|drows|cns depress|sleepiness|sleep support|relax|calm/i },
  { label: 'Stimulation', pattern: /stimul|insomnia|agitat|jitter|anxiety|alert|energy/i },
  { label: 'Serotonergic', pattern: /seroton|ssri|snri|maoi|monoamine oxidase|5-ht/i },
  { label: 'Cardiovascular', pattern: /blood pressure|hypertension|hypotension|heart|arrhythm|cardio|qt|tachy|brady/i },
  { label: 'Bleeding', pattern: /bleed|anticoagul|antiplatelet/i },
  { label: 'Liver', pattern: /liver|hepato/i },
  { label: 'Kidney', pattern: /kidney|renal/i },
  { label: 'Seizure', pattern: /seizure|convuls/i },
  { label: 'Dependence / withdrawal', pattern: /depend|withdraw|addict|habit-forming|abuse/i },
  { label: 'Pregnancy / breastfeeding', pattern: /pregnan|breastfeed|lactation/i },
  { label: 'Drug metabolism', pattern: /\bcyp\w*\b|drug metabolism|enzyme inhibit|enzyme induc/i },
  { label: 'Immune', pattern: /immune|immunomod|immunosuppress/i },
  { label: 'Metabolic', pattern: /glucose|insulin|metabolic|blood sugar/i },
  { label: 'Toxicity concern', pattern: /toxic|poison|narrow therapeutic|fatal/i },
]

function clean(value: string): string {
  return value.trim().toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ')
}

export function matchSafetySignals(value: string): CanonicalSafetySignal[] {
  const normalized = clean(value)
  if (!normalized) return []
  return SAFETY_SIGNAL_RULES
    .filter(({ pattern }) => pattern.test(normalized))
    .map(({ label }) => label)
}

export function normalizeSafetySignal(value: string): string {
  return matchSafetySignals(value)[0] ?? value.trim()
}

export function normalizeSafetySignals(value: string): string[] {
  const matches = matchSafetySignals(value)
  return matches.length ? matches : (value.trim() ? [value.trim()] : [])
}
