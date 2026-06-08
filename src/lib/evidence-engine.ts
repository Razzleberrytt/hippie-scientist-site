export type EvidenceConfidenceTier =
  | 'strong_human'
  | 'moderate_human'
  | 'limited_human'
  | 'mixed'
  | 'mechanistic_only'
  | 'insufficient'

export type EvidenceSafetySeverity = 'low' | 'moderate' | 'high'

export type EvidenceProblemLabel = {
  title: string
  description: string
}

export type EvidenceEngineClaim = {
  claim_id: string
  ingredient_slug: string
  ingredient_name: string
  problem?: string
  claim_statement: string
  confidence_tier: EvidenceConfidenceTier | string
  evidence_summary: string
  limitations: string
  best_fit: string
  not_best_fit: string
  decision_group: string
  display_order: number
  published: boolean
}

export type EvidenceEngineConfig = {
  problemField?: string
  heroHeadline?: string
  heroCta?: string
  orientationHeading?: string
  orientationSubtext?: string
  safetyHeading?: string
  safetyBody?: string
}

export type EvidenceEngineSource = {
  source_id: string
  claim_id: string
  citation_label: string
  source_type: string
  title: string
  year: number | string
  url: string
  source_note?: string
  published: boolean
}

export type EvidenceEngineSafetyNote = {
  safety_id: string
  ingredient_slug: string
  risk_type: string
  severity: EvidenceSafetySeverity | string
  warning: string
  decision_effect: string
  published: boolean
}

export type EvidenceEnginePayload<GoalSlug extends string = string> = {
  goal: GoalSlug
  updatedAt: string
  config?: EvidenceEngineConfig
  problemLabels: Record<string, EvidenceProblemLabel>
  claims: EvidenceEngineClaim[]
  safetyNotes: EvidenceEngineSafetyNote[]
  sourcesByClaim: Record<string, EvidenceEngineSource[]>
}

export type EvidenceConfidenceDisplay = {
  label: string
  tone: string
  description: string
}

export const confidenceDisplays: Record<EvidenceConfidenceTier, EvidenceConfidenceDisplay> = {
  strong_human: {
    label: 'Strong human evidence',
    tone: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    description: 'Supported by multiple human studies or strong human-focused synthesis.',
  },
  moderate_human: {
    label: 'Moderate human evidence',
    tone: 'bg-teal-50 text-teal-800 ring-teal-100',
    description: 'Human evidence exists, but population, dose, or outcome certainty is still limited.',
  },
  limited_human: {
    label: 'Limited human evidence',
    tone: 'bg-amber-50 text-amber-800 ring-amber-100',
    description: 'Some human signal, but not enough to treat the claim as settled.',
  },
  mixed: {
    label: 'Mixed evidence',
    tone: 'bg-orange-50 text-orange-800 ring-orange-100',
    description: 'Findings vary enough that fit and limitations matter more than the headline.',
  },
  mechanistic_only: {
    label: 'Mechanistic only',
    tone: 'bg-slate-50 text-slate-700 ring-slate-200',
    description: 'Biological plausibility without enough direct human outcome evidence.',
  },
  insufficient: {
    label: 'Insufficient evidence',
    tone: 'bg-zinc-50 text-zinc-700 ring-zinc-200',
    description: 'Not enough reliable evidence to support a confident decision.',
  },
}

export const safetySeverityTones: Record<EvidenceSafetySeverity, string> = {
  low: 'border-amber-600/20 bg-amber-50/70 text-amber-950',
  moderate: 'border-orange-700/20 bg-orange-50/70 text-orange-950',
  high: 'border-rose-700/20 bg-rose-50/80 text-rose-950',
}

export function getConfidenceDisplay(tier: string): EvidenceConfidenceDisplay {
  return isEvidenceConfidenceTier(tier) ? confidenceDisplays[tier] : confidenceDisplays.insufficient
}

export function getSafetySeverityTone(severity: string): string {
  return isEvidenceSafetySeverity(severity) ? safetySeverityTones[severity] : safetySeverityTones.moderate
}

export function isEvidenceConfidenceTier(value: string): value is EvidenceConfidenceTier {
  return value in confidenceDisplays
}

export function isEvidenceSafetySeverity(value: string): value is EvidenceSafetySeverity {
  return value in safetySeverityTones
}

export function formatEvidenceLabel(value: string): string {
  return value.replace(/[_-]/g, ' ')
}

export function groupClaimsByDecisionGroup<Claim extends EvidenceEngineClaim>(claims: Claim[]): Record<string, Claim[]> {
  return claims.reduce<Record<string, Claim[]>>((groups, claim) => {
    const group = claim.decision_group || 'Other support'
    groups[group] = groups[group] || []
    groups[group].push(claim)
    return groups
  }, {})
}

export function groupSafetyNotesByIngredient<Note extends EvidenceEngineSafetyNote>(notes: Note[]): Record<string, Note[]> {
  return notes.reduce<Record<string, Note[]>>((groups, note) => {
    groups[note.ingredient_slug] = groups[note.ingredient_slug] || []
    groups[note.ingredient_slug].push(note)
    return groups
  }, {})
}

export function getClaimProblemKey(claim: EvidenceEngineClaim, problemField: string): string {
  const value = (claim as Record<string, unknown>)[problemField]
  return typeof value === 'string' ? value : (claim.problem || '')
}
