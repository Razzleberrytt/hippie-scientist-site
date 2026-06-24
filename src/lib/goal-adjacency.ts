import {
  getGoalOverlap,
  getMechanismOverlap,
  getStackOverlap,
  scoreRelatedProfile,
  type SemanticEntity,
} from './semantic-relationships'

export type GoalProfile = SemanticEntity & {
  description?: string
  summary?: string
}

export type RelatedGoal<T extends GoalProfile> = {
  item: T
  slug: string
  name: string
  score: number
  sharedGoals: string[]
  sharedMechanisms: string[]
  sharedStacks: string[]
  reasons: string[]
}

const DEFAULT_LIMIT = 6

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

export function scoreGoalAdjacency<T extends GoalProfile>(base: GoalProfile, candidate: T): RelatedGoal<T> {
  const sharedGoals = getGoalOverlap(base, candidate)
  const mechanismOverlap = getMechanismOverlap(base, candidate)
  const sharedStacks = getStackOverlap(base, candidate)
  const relationship = scoreRelatedProfile(base, candidate)

  // Conservative adjacency philosophy:
  // goal relationships are based only on explicit runtime overlap signals.
  // No opaque similarity systems or AI-generated behavioral assumptions are used.
  const score =
    sharedGoals.length +
    mechanismOverlap.count +
    sharedStacks.length +
    relationship.sharedEffects.length

  const reasons: string[] = []
  if (sharedGoals.length) reasons.push('shared goal intent')
  if (mechanismOverlap.count) reasons.push('shared mechanism context')
  if (sharedStacks.length) reasons.push('shared stack relationships')
  if (relationship.sharedEffects.length) reasons.push('shared effect framing')

  return {
    item: candidate,
    slug: slugify(candidate.slug || candidate.id || candidate.name || candidate.title),
    name: clean(candidate.name || candidate.title || candidate.slug),
    score,
    sharedGoals,
    sharedMechanisms: mechanismOverlap.sharedMechanisms,
    sharedStacks,
    reasons,
  }
}

export function getRelatedGoals<T extends GoalProfile>(base: GoalProfile, goals: T[], limit = DEFAULT_LIMIT): RelatedGoal<T>[] {
  const baseSlug = slugify(base.slug || base.id || base.name || base.title)

  return goals
    .map(goal => scoreGoalAdjacency(base, goal))
    .filter(goal => goal.slug && goal.slug !== baseSlug && goal.score > 0)
    .sort((a, b) => b.score - a.score || b.sharedMechanisms.length - a.sharedMechanisms.length || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function buildGoalAdjacencyMap<T extends GoalProfile>(goals: T[], limit = DEFAULT_LIMIT): Record<string, RelatedGoal<T>[]> {
  const map: Record<string, RelatedGoal<T>[]> = {}

  goals.forEach(goal => {
    const slug = slugify(goal.slug || goal.id || goal.name || goal.title)
    map[slug] = getRelatedGoals(goal, goals, limit)
  })

  return map
}

export function getGoalAdjacencyNarrative(goal: RelatedGoal<GoalProfile>): string {
  const fragments = [
    ...goal.sharedGoals.slice(0, 2),
    ...goal.sharedMechanisms.slice(0, 2),
    ...goal.sharedStacks.slice(0, 1),
  ]

  if (fragments.length === 0) {
    return 'Exploratory relationship based on conservative semantic adjacency.'
  }

  return `Related through ${fragments.join(', ')}.`
}
