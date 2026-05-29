import { normalizeSafetyEnum } from './safety-enum'

export const STANDARD_EVIDENCE_LABELS = [
  'Strong evidence',
  'Moderate evidence',
  'Limited evidence',
  'Mixed evidence',
  'Preliminary evidence',
  'Traditional use',
  'Insufficient evidence',
  'Needs review',
] as const

export type StandardEvidenceLabel = (typeof STANDARD_EVIDENCE_LABELS)[number]

export const STANDARD_SAFETY_LABELS = [
  'Generally well tolerated',
  'Use caution',
  'Interaction risk',
  'Needs review',
  'Limited safety data',
] as const

export type StandardSafetyLabel = (typeof STANDARD_SAFETY_LABELS)[number]
export type DecisionSafetyTone = 'ok' | 'caution' | 'interaction' | 'review' | 'limited'
export type DecisionEvidenceTone = 'strong' | 'moderate' | 'limited' | 'mixed' | 'preliminary' | 'traditional' | 'insufficient' | 'review'

export const decisionBadgeClass =
  'inline-flex min-h-7 max-w-full items-center rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold leading-snug break-words'

export const decisionStatusBadgeClass =
  `${decisionBadgeClass} text-[0.72rem] uppercase tracking-[0.08em]`

export const decisionChipClass =
  'inline-flex min-h-7 max-w-full items-center rounded-full border border-brand-900/10 bg-white/75 px-2.5 py-1 text-[0.72rem] font-semibold leading-snug text-[#5f6f66] break-words'

export const decisionMicroLabelClass =
  'text-[0.68rem] font-bold uppercase tracking-[0.1em] leading-none'

export const decisionMetricShellClass =
  'min-w-0 rounded-[0.8rem] border border-brand-900/10 bg-[#fbfaf6]/85 px-2.5 py-2'

export const decisionMetadataClusterClass =
  'flex flex-wrap items-center gap-2'

function compactText(value?: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(compactText).filter(Boolean).join(' ')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(compactText).filter(Boolean).join(' ')
  return String(value).trim()
}

function matchesCanonicalEvidence(value: string): StandardEvidenceLabel | '' {
  const match = STANDARD_EVIDENCE_LABELS.find(label => label.toLowerCase() === value.toLowerCase())
  return match || ''
}

function matchesCanonicalSafety(value: string): StandardSafetyLabel | '' {
  const match = STANDARD_SAFETY_LABELS.find(label => label.toLowerCase() === value.toLowerCase())
  return match || ''
}

export function normalizeDecisionEvidence(value?: unknown, fallback: StandardEvidenceLabel = 'Limited evidence'): StandardEvidenceLabel {
  const raw = compactText(value)
  if (!raw) return fallback

  const canonical = matchesCanonicalEvidence(raw)
  if (canonical) return canonical

  const text = raw.toLowerCase().replace(/[_-]+/g, ' ')

  if (/\b(needs? review|review needed|unknown|tbd|draft|placeholder|profile pending)\b/.test(text)) return 'Needs review'
  if (/\b(none|no evidence|insufficient|minimal|not established)\b/.test(text)) return 'Insufficient evidence'
  if (/\b(mixed|conflict|inconsistent|equivocal)\b/.test(text)) return 'Mixed evidence'
  if (/\b(traditional|ethnobotanical|historical|folk use)\b/.test(text)) return 'Traditional use'
  if (/\b(strong|high|robust|meta analysis|systematic review|grade\s*a|tier\s*a|\ba\b)\b/.test(text)) return 'Strong evidence'
  if (/\b(moderate|medium|developing|grade\s*b|tier\s*b|\bb\b)\b/.test(text)) return 'Moderate evidence'
  if (/\b(preliminary|preclinical|animal|cell|in vitro|mechanistic|theoretical|emerging|early|exploratory|grade\s*c|tier\s*c|\bc\b|grade\s*d|tier\s*d|\bd\b)\b/.test(text)) return 'Preliminary evidence'
  if (/\b(limited|low|weak|partial|human limited)\b/.test(text)) return 'Limited evidence'

  return fallback
}

export function getDecisionEvidenceTone(labelOrValue?: unknown): DecisionEvidenceTone {
  const label = normalizeDecisionEvidence(labelOrValue)
  if (label === 'Strong evidence') return 'strong'
  if (label === 'Moderate evidence') return 'moderate'
  if (label === 'Mixed evidence') return 'mixed'
  if (label === 'Preliminary evidence') return 'preliminary'
  if (label === 'Traditional use') return 'traditional'
  if (label === 'Insufficient evidence') return 'insufficient'
  if (label === 'Needs review') return 'review'
  return 'limited'
}

export function normalizeDecisionSafety(value?: unknown, options: { hasSafetyNotes?: boolean } = {}): StandardSafetyLabel {
  const raw = compactText(value)
  if (!raw) return options.hasSafetyNotes ? 'Use caution' : 'Needs review'

  const canonical = matchesCanonicalSafety(raw)
  if (canonical) return canonical

  const normalized = normalizeSafetyEnum(raw).value
  if (normalized === 'Needs review' && options.hasSafetyNotes) return 'Use caution'
  return normalized
}

export function getDecisionSafetyTone(labelOrValue?: unknown, options: { hasSafetyNotes?: boolean } = {}): DecisionSafetyTone {
  const label = normalizeDecisionSafety(labelOrValue, options)
  if (label === 'Generally well tolerated') return 'ok'
  if (label === 'Interaction risk') return 'interaction'
  if (label === 'Limited safety data') return 'limited'
  if (label === 'Needs review') return 'review'
  return 'caution'
}

export function evidenceToneClasses(tone: DecisionEvidenceTone) {
  if (tone === 'strong') return 'border-emerald-700/15 bg-emerald-50 text-emerald-800'
  if (tone === 'moderate') return 'border-blue-700/15 bg-blue-50 text-blue-800'
  if (tone === 'mixed') return 'border-violet-700/15 bg-violet-50 text-violet-800'
  if (tone === 'preliminary') return 'border-amber-700/20 bg-amber-50 text-amber-800'
  if (tone === 'traditional') return 'border-stone-700/15 bg-stone-100 text-stone-800'
  if (tone === 'insufficient' || tone === 'review') return 'border-slate-500/20 bg-slate-50 text-slate-700'
  return 'border-amber-700/20 bg-amber-50 text-amber-800'
}

export function safetyToneClasses(tone: DecisionSafetyTone) {
  if (tone === 'ok') return 'border-emerald-700/15 bg-emerald-50 text-emerald-800'
  if (tone === 'interaction') return 'border-rose-700/15 bg-rose-50 text-rose-800'
  if (tone === 'limited' || tone === 'review') return 'border-slate-500/20 bg-slate-50 text-slate-700'
  return 'border-amber-700/20 bg-amber-50 text-amber-800'
}
