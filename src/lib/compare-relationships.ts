import {
  getEffectOverlap,
  getGoalOverlap,
  getMechanismOverlap,
  getPrimaryEffectTokens,
  getGoalTokens,
  getMechanismTokens,
  type SemanticEntity,
} from './semantic-relationships'

export type CompareProfile = SemanticEntity & {
  leftSlug?: string
  rightSlug?: string
  left?: SemanticEntity
  right?: SemanticEntity
  safety?: unknown
  safetyNotes?: unknown
  cautions?: unknown
  stimulation?: unknown
  sedation?: unknown
  tone?: unknown
}

export type RelatedComparison<T extends CompareProfile> = {
  item: T
  slug: string
  label: string
  score: number
  sharedEffects: string[]
  sharedMechanisms: string[]
  sharedGoals: string[]
  safetyOverlap: string[]
  stimulationSedationOverlap: string[]
  reasons: string[]
}

export type CompareCluster<T extends CompareProfile> = {
  key: string
  label: string
  items: RelatedComparison<T>[]
}

const DEFAULT_LIMIT = 8

function clean(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return ''
}

function slugify(value: unknown): string {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return unique(value.flatMap(item => list(item)))
  if (value && typeof value === 'object') return []
  return unique(clean(value).split(/[;,|]/g))
}

function unique(values: unknown[]): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  values.forEach(value => {
    const token = clean(value).toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
    if (!token || seen.has(token)) return
    seen.add(token)
    output.push(token)
  })

  return output
}

function compareSlug(profile: CompareProfile): string {
  const explicit = slugify(profile.slug || profile.id)
  if (explicit) return explicit

  const left = slugify(profile.leftSlug || profile.left?.slug || profile.left?.name)
  const right = slugify(profile.rightSlug || profile.right?.slug || profile.right?.name)
  return left && right ? `${left}-vs-${right}` : slugify(profile.name || profile.title)
}

function compareLabel(profile: CompareProfile): string {
  const explicit = clean(profile.name || profile.title)
  if (explicit) return explicit

  const left = clean(profile.left?.name || profile.left?.title || profile.leftSlug)
  const right = clean(profile.right?.name || profile.right?.title || profile.rightSlug)
  return left && right ? `${left} vs ${right}` : compareSlug(profile)
}

function combinedEntity(profile: CompareProfile): SemanticEntity {
  return {
    ...profile,
    primary_effects: [
      ...getPrimaryEffectTokens(profile),
      ...getPrimaryEffectTokens(profile.left || {}),
      ...getPrimaryEffectTokens(profile.right || {}),
    ],
    mechanisms: [
      ...getMechanismTokens(profile),
      ...getMechanismTokens(profile.left || {}),
      ...getMechanismTokens(profile.right || {}),
    ],
    best_for: [
      ...getGoalTokens(profile),
      ...getGoalTokens(profile.left || {}),
      ...getGoalTokens(profile.right || {}),
    ],
  }
}

function overlap(left: unknown[], right: unknown[]): string[] {
  const rightSet = new Set(unique(right))
  return unique(left).filter(item => rightSet.has(item))
}

export function getSafetyTokens(profile: CompareProfile): string[] {
  return list(profile.safety ?? profile.safetyNotes ?? profile.cautions)
}

export function getSafetyOverlap(left: CompareProfile, right: CompareProfile): string[] {
  return overlap(getSafetyTokens(left), getSafetyTokens(right))
}

export function getStimulationSedationTokens(profile: CompareProfile): string[] {
  return list([profile.stimulation, profile.sedation, profile.tone])
    .filter(token => ['stimulating', 'stimulation', 'sedating', 'sedation', 'calming', 'neutral'].includes(token))
}

export function getStimulationSedationOverlap(left: CompareProfile, right: CompareProfile): string[] {
  return overlap(getStimulationSedationTokens(left), getStimulationSedationTokens(right))
}

export function getMechanismSimilarity(left: CompareProfile, right: CompareProfile): number {
  const leftMechanisms = getMechanismTokens(combinedEntity(left))
  const rightMechanisms = getMechanismTokens(combinedEntity(right))
  if (leftMechanisms.length === 0 || rightMechanisms.length === 0) return 0

  const shared = overlap(leftMechanisms, rightMechanisms).length
  const total = new Set([...leftMechanisms, ...rightMechanisms]).size
  return total === 0 ? 0 : Number((shared / total).toFixed(3))
}

export function scoreRelatedComparison<T extends CompareProfile>(base: CompareProfile, candidate: T): RelatedComparison<T> {
  const baseEntity = combinedEntity(base)
  const candidateEntity = combinedEntity(candidate)
  const sharedEffects = getEffectOverlap(baseEntity, candidateEntity)
  const mechanismOverlap = getMechanismOverlap(baseEntity, candidateEntity)
  const sharedGoals = getGoalOverlap(baseEntity, candidateEntity)
  const safetyOverlap = getSafetyOverlap(base, candidate)
  const stimulationSedationOverlap = getStimulationSedationOverlap(base, candidate)

  // Trust-first comparison architecture: every score comes from visible overlap counts.
  // This avoids hidden efficacy claims, opaque recommendation ranking, or medicalized winner/loser framing.
  const score =
    sharedEffects.length +
    mechanismOverlap.count +
    sharedGoals.length +
    safetyOverlap.length +
    stimulationSedationOverlap.length

  const reasons: string[] = []
  if (sharedEffects.length) reasons.push('shared effects')
  if (mechanismOverlap.count) reasons.push('shared mechanisms')
  if (sharedGoals.length) reasons.push('shared goals')
  if (safetyOverlap.length) reasons.push('shared safety context')
  if (stimulationSedationOverlap.length) reasons.push('similar stimulation/sedation framing')

  return {
    item: candidate,
    slug: compareSlug(candidate),
    label: compareLabel(candidate),
    score,
    sharedEffects,
    sharedMechanisms: mechanismOverlap.sharedMechanisms,
    sharedGoals,
    safetyOverlap,
    stimulationSedationOverlap,
    reasons,
  }
}

export function getRelatedComparisons<T extends CompareProfile>(base: CompareProfile, candidates: T[], limit = DEFAULT_LIMIT): RelatedComparison<T>[] {
  const baseSlug = compareSlug(base)

  return candidates
    .map(candidate => scoreRelatedComparison(base, candidate))
    .filter(result => result.slug && result.slug !== baseSlug && result.score > 0)
    .sort((a, b) => b.score - a.score || b.sharedMechanisms.length - a.sharedMechanisms.length || a.label.localeCompare(b.label))
    .slice(0, limit)
}

export function buildCompareClusters<T extends CompareProfile>(base: CompareProfile, candidates: T[], limit = DEFAULT_LIMIT): CompareCluster<T>[] {
  const related = getRelatedComparisons(base, candidates, limit)
  const clusters: CompareCluster<T>[] = [
    {
      key: 'mechanism-overlap',
      label: 'Mechanism overlap',
      items: related.filter(item => item.sharedMechanisms.length > 0),
    },
    {
      key: 'effect-overlap',
      label: 'Effect overlap',
      items: related.filter(item => item.sharedEffects.length > 0),
    },
    {
      key: 'goal-overlap',
      label: 'Goal overlap',
      items: related.filter(item => item.sharedGoals.length > 0),
    },
    {
      key: 'safety-context',
      label: 'Safety context overlap',
      items: related.filter(item => item.safetyOverlap.length > 0),
    },
  ]

  // Conservative graph expansion: remove empty clusters and cap each cluster to avoid crawl-noise explosions.
  return clusters
    .map(cluster => ({ ...cluster, items: cluster.items.slice(0, limit) }))
    .filter(cluster => cluster.items.length > 0)
}
