export type RelatedBotanicalRecord = {
  slug: string
  name: string
  scientificName?: string
  explicitEffects?: string[]
  effects: string[]
  compounds: string[]
  compoundClasses: string[]
  evidence: string
  intensity: string
  safety: string[]
}

export type RelatedBotanicalReasonType =
  | 'explicit-effect'
  | 'compound-class'
  | 'compound'
  | 'safety'
  | 'evidence'
  | 'noticeability'

export type RelatedBotanicalReason = {
  type: RelatedBotanicalReasonType
  label: string
  values: string[]
  score: number
}

export type RelatedBotanicalMatch = {
  record: RelatedBotanicalRecord
  score: number
  reasons: RelatedBotanicalReason[]
}

const WEIGHTS = {
  explicitEffect: 8,
  compoundClass: 6,
  compound: 4,
  safety: 1.5,
  evidence: 1,
  noticeability: 0.75,
} as const

// Broad umbrella labels can be useful supporting context, but should not by
// themselves create a recommendation. Otherwise common tags such as
// "antioxidant" produce many technically-correct but low-value pairings.
const GENERIC_EFFECTS = new Set(['antioxidant', 'tonic'])
const MINIMUM_RECOMMENDATION_SCORE = 4

const normalizedText = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ')

const normalized = (values: string[] = []) =>
  new Map(values.filter(Boolean).map((value) => [normalizedText(value), value.trim()]))

function sharedValues(left: string[] = [], right: string[] = []) {
  const a = normalized(left)
  const b = normalized(right)
  return Array.from(a.entries())
    .filter(([key]) => b.has(key))
    .map(([, display]) => display)
    .sort((x, y) => x.localeCompare(y))
}

function boundedOverlap(shared: number, left: number, right: number) {
  if (!shared || !left || !right) return 0
  return shared / Math.sqrt(left * right)
}

function overlapReason(
  type: RelatedBotanicalReasonType,
  label: string,
  left: string[] | undefined,
  right: string[] | undefined,
  weight: number,
): RelatedBotanicalReason | null {
  const values = sharedValues(left, right)
  if (!values.length) return null
  const score = weight * boundedOverlap(values.length, left?.length ?? 0, right?.length ?? 0)
  return { type, label, values, score }
}

function isSameBotanical(source: RelatedBotanicalRecord, candidate: RelatedBotanicalRecord) {
  if (source.slug === candidate.slug) return true

  const sourceName = normalizedText(source.name)
  const candidateName = normalizedText(candidate.name)
  const sourceScientific = normalizedText(source.scientificName)
  const candidateScientific = normalizedText(candidate.scientificName)

  if (sourceScientific && candidateScientific && sourceScientific === candidateScientific) return true
  if (sourceScientific && sourceScientific === candidateName) return true
  if (candidateScientific && candidateScientific === sourceName) return true

  return false
}

export function scoreRelatedBotanical(
  source: RelatedBotanicalRecord,
  candidate: RelatedBotanicalRecord,
): RelatedBotanicalMatch | null {
  if (isSameBotanical(source, candidate)) return null

  const sourceExplicit = source.explicitEffects?.length ? source.explicitEffects : source.effects
  const candidateExplicit = candidate.explicitEffects?.length ? candidate.explicitEffects : candidate.effects
  const reasons = [
    overlapReason('explicit-effect', 'Shared explicit effects', sourceExplicit, candidateExplicit, WEIGHTS.explicitEffect),
    overlapReason('compound-class', 'Shared chemistry families', source.compoundClasses, candidate.compoundClasses, WEIGHTS.compoundClass),
    overlapReason('compound', 'Shared active compounds', source.compounds, candidate.compounds, WEIGHTS.compound),
    overlapReason('safety', 'Shared safety signals', source.safety, candidate.safety, WEIGHTS.safety),
  ].filter((reason): reason is RelatedBotanicalReason => Boolean(reason))

  if (source.evidence && source.evidence === candidate.evidence && source.evidence !== 'Unclassified') {
    reasons.push({ type: 'evidence', label: 'Similar evidence level', values: [source.evidence], score: WEIGHTS.evidence })
  }
  if (source.intensity && source.intensity === candidate.intensity && source.intensity !== 'Unknown') {
    reasons.push({ type: 'noticeability', label: 'Similar noticeability', values: [source.intensity], score: WEIGHTS.noticeability })
  }

  const score = reasons.reduce((sum, reason) => sum + reason.score, 0)
  const effectReason = reasons.find((reason) => reason.type === 'explicit-effect')
  const hasSpecificEffect = Boolean(effectReason?.values.some((value) => !GENERIC_EFFECTS.has(normalizedText(value))))
  const hasChemistryRelationship = reasons.some((reason) =>
    reason.type === 'compound-class' || reason.type === 'compound',
  )
  const hasSubstantiveRelationship = hasSpecificEffect || hasChemistryRelationship
  if (!hasSubstantiveRelationship || score < MINIMUM_RECOMMENDATION_SCORE) return null

  return {
    record: candidate,
    score: Number(score.toFixed(4)),
    reasons: reasons.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label)),
  }
}

export function getRelatedBotanicals(
  source: RelatedBotanicalRecord,
  records: RelatedBotanicalRecord[],
  limit = 6,
): RelatedBotanicalMatch[] {
  if (limit <= 0) return []
  return records
    .map((candidate) => scoreRelatedBotanical(source, candidate))
    .filter((match): match is RelatedBotanicalMatch => Boolean(match))
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name) || a.record.slug.localeCompare(b.record.slug))
    .slice(0, limit)
}
