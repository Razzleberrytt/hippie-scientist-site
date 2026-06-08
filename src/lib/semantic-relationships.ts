export type SemanticEntity = {
  slug?: string
  id?: string
  name?: string
  title?: string
  primary_effects?: unknown
  primaryEffects?: unknown
  effects?: unknown
  mechanisms?: unknown
  mechanism?: unknown
  best_for?: unknown
  bestFor?: unknown
  goals?: unknown
  categories?: unknown
  category?: unknown
  stacks?: unknown
  stackReferences?: unknown
  related_stacks?: unknown
  relatedStacks?: unknown
}

export type RelationshipScore = {
  slug: string
  name: string
  score: number
  sharedEffects: string[]
  sharedMechanisms: string[]
  sharedGoals: string[]
  sharedCategories: string[]
  sharedStacks: string[]
  reasons: string[]
}

export type ScoredRelationship<T extends SemanticEntity> = RelationshipScore & {
  item: T
}

export type MechanismOverlap = {
  count: number
  sharedMechanisms: string[]
}

const DEFAULT_LIMIT = 6

function readString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return ''
}

function readList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return normalizeList(value.flatMap(item => readList(item)))
  }

  if (value && typeof value === 'object') return []

  const text = readString(value)
  if (!text) return []

  return normalizeList(text.split(/[;,|]/g))
}

function normalizeToken(value: unknown): string {
  return readString(value)
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeList(values: unknown[]): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  values.forEach(value => {
    const token = normalizeToken(value)
    if (!token || seen.has(token)) return
    seen.add(token)
    output.push(token)
  })

  return output
}

function labelFor(entity: SemanticEntity): string {
  return readString(entity.name || entity.title || entity.slug || entity.id)
}

function slugFor(entity: SemanticEntity): string {
  const raw = readString(entity.slug || entity.id || entity.name || entity.title)
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getPrimaryEffectTokens(entity: SemanticEntity): string[] {
  return readList(entity.primary_effects ?? entity.primaryEffects ?? entity.effects)
}

export function getMechanismTokens(entity: SemanticEntity): string[] {
  return readList(entity.mechanisms ?? entity.mechanism)
}

export function getGoalTokens(entity: SemanticEntity): string[] {
  return readList(entity.best_for ?? entity.bestFor ?? entity.goals)
}

export function getCategoryTokens(entity: SemanticEntity): string[] {
  return readList(entity.categories ?? entity.category)
}

export function getStackTokens(entity: SemanticEntity): string[] {
  return readList(entity.stacks ?? entity.stackReferences ?? entity.related_stacks ?? entity.relatedStacks)
}

export function getOverlap(left: unknown[], right: unknown[]): string[] {
  const leftTokens = normalizeList(left)
  const rightSet = new Set(normalizeList(right))
  return leftTokens.filter(token => rightSet.has(token))
}

export function getEffectOverlap(left: SemanticEntity, right: SemanticEntity): string[] {
  return getOverlap(getPrimaryEffectTokens(left), getPrimaryEffectTokens(right))
}

export function getMechanismOverlap(left: SemanticEntity, right: SemanticEntity): MechanismOverlap {
  const sharedMechanisms = getOverlap(getMechanismTokens(left), getMechanismTokens(right))
  return {
    count: sharedMechanisms.length,
    sharedMechanisms,
  }
}

export function getGoalOverlap(left: SemanticEntity, right: SemanticEntity): string[] {
  return getOverlap(getGoalTokens(left), getGoalTokens(right))
}

export function getStackOverlap(left: SemanticEntity, right: SemanticEntity): string[] {
  return getOverlap(getStackTokens(left), getStackTokens(right))
}

function buildReasons(score: RelationshipScore): string[] {
  const reasons: string[] = []
  if (score.sharedEffects.length) reasons.push(`${score.sharedEffects.length} shared effect${score.sharedEffects.length === 1 ? '' : 's'}`)
  if (score.sharedMechanisms.length) reasons.push(`${score.sharedMechanisms.length} shared mechanism${score.sharedMechanisms.length === 1 ? '' : 's'}`)
  if (score.sharedGoals.length) reasons.push(`${score.sharedGoals.length} shared goal${score.sharedGoals.length === 1 ? '' : 's'}`)
  if (score.sharedCategories.length) reasons.push(`${score.sharedCategories.length} shared categor${score.sharedCategories.length === 1 ? 'y' : 'ies'}`)
  if (score.sharedStacks.length) reasons.push(`${score.sharedStacks.length} shared stack reference${score.sharedStacks.length === 1 ? '' : 's'}`)
  return reasons
}

export function scoreRelatedProfile(left: SemanticEntity, right: SemanticEntity): RelationshipScore {
  const sharedEffects = getEffectOverlap(left, right)
  const mechanism = getMechanismOverlap(left, right)
  const sharedGoals = getGoalOverlap(left, right)
  const sharedCategories = getOverlap(getCategoryTokens(left), getCategoryTokens(right))
  const sharedStacks = getStackOverlap(left, right)

  // Deterministic by design: transparent overlap counts preserve trust because every point can be explained.
  // No embeddings, AI ranking, hidden priors, or opaque authority boosts are used here.
  const baseScore =
    sharedEffects.length +
    mechanism.count +
    sharedGoals.length +
    sharedCategories.length +
    sharedStacks.length

  const score: RelationshipScore = {
    slug: slugFor(right),
    name: labelFor(right),
    score: baseScore,
    sharedEffects,
    sharedMechanisms: mechanism.sharedMechanisms,
    sharedGoals,
    sharedCategories,
    sharedStacks,
    reasons: [],
  }

  return {
    ...score,
    reasons: buildReasons(score),
  }
}

function getRelatedItems<T extends SemanticEntity>(base: SemanticEntity, candidates: T[], limit = DEFAULT_LIMIT): ScoredRelationship<T>[] {
  const baseSlug = slugFor(base)

  return candidates
    .map(item => ({
      ...scoreRelatedProfile(base, item),
      item,
    }))
    .filter(result => result.slug && result.slug !== baseSlug && result.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug))
    .slice(0, limit)
}

export function getRelatedCompounds<T extends SemanticEntity>(compound: SemanticEntity, compounds: T[], limit = DEFAULT_LIMIT): ScoredRelationship<T>[] {
  return getRelatedItems(compound, compounds, limit)
}

export function getRelatedHerbs<T extends SemanticEntity>(herb: SemanticEntity, herbs: T[], limit = DEFAULT_LIMIT): ScoredRelationship<T>[] {
  return getRelatedItems(herb, herbs, limit)
}

export function getRelatedGoals<T extends SemanticEntity>(goal: SemanticEntity, goals: T[], limit = DEFAULT_LIMIT): ScoredRelationship<T>[] {
  return getRelatedItems(goal, goals, limit)
}

export function getRelatedStacks<T extends SemanticEntity>(stack: SemanticEntity, stacks: T[], limit = DEFAULT_LIMIT): ScoredRelationship<T>[] {
  return getRelatedItems(stack, stacks, limit)
}
