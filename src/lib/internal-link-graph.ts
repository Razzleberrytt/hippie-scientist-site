import {
  getGoalOverlap,
  getMechanismOverlap,
  scoreRelatedProfile,
  type SemanticEntity,
} from './semantic-relationships'

export type SemanticNodeType =
  | 'goal'
  | 'compare'
  | 'stack'
  | 'compound'
  | 'herb'
  | 'mechanism'

export type SemanticLinkNode = SemanticEntity & {
  type: SemanticNodeType
  href?: string
}

export type SemanticLink = {
  source: string
  target: string
  sourceType: SemanticNodeType
  targetType: SemanticNodeType
  score: number
  relationship: string
  reasons: string[]
}

const MAX_LINKS_PER_NODE = 12

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

function nodeSlug(node: SemanticLinkNode): string {
  return slugify(node.slug || node.id || node.name || node.title)
}

function nodeHref(node: SemanticLinkNode): string {
  if (node.href) return node.href

  const slug = nodeSlug(node)

  switch (node.type) {
    case 'goal':
      return `/goals/${slug}`
    case 'compare':
      return `/compare/${slug}`
    case 'stack':
      return `/stacks/${slug}`
    case 'compound':
      return `/compounds/${slug}`
    case 'herb':
      return `/herbs/${slug}`
    case 'mechanism':
      return `/mechanisms/${slug}`
    default:
      return `/${slug}`
  }
}

function pairKey(source: SemanticLinkNode, target: SemanticLinkNode): string {
  return [source.type, nodeSlug(source), target.type, nodeSlug(target)].join(':')
}

function allowedRelationship(source: SemanticNodeType, target: SemanticNodeType): boolean {
  const valid: Array<[SemanticNodeType, SemanticNodeType]> = [
    ['goal', 'goal'],
    ['goal', 'compare'],
    ['goal', 'stack'],
    ['goal', 'compound'],
    ['goal', 'herb'],
    ['compare', 'compare'],
    ['stack', 'compare'],
    ['mechanism', 'compound'],
  ]

  return valid.some(([left, right]) => left === source && right === target)
}

export function createSemanticLink(source: SemanticLinkNode, target: SemanticLinkNode): SemanticLink | null {
  if (!allowedRelationship(source.type, target.type)) return null

  const score = scoreRelatedProfile(source, target)
  if (score.score <= 0) return null

  // Semantic graph philosophy:
  // relationships are deterministic, crawlable, SSR-safe, and explainable.
  // The graph exists to strengthen semantic clustering and discovery traversal,
  // not to create opaque recommendation systems.
  return {
    source: nodeHref(source),
    target: nodeHref(target),
    sourceType: source.type,
    targetType: target.type,
    score: score.score,
    relationship: `${source.type}-to-${target.type}`,
    reasons: score.reasons,
  }
}

export function buildSemanticLinks(source: SemanticLinkNode, targets: SemanticLinkNode[]): SemanticLink[] {
  const seen = new Set<string>()

  return targets
    .map(target => createSemanticLink(source, target))
    .filter((link): link is SemanticLink => Boolean(link))
    .filter(link => {
      const key = `${link.source}:${link.target}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.score - a.score || a.target.localeCompare(b.target))
    .slice(0, MAX_LINKS_PER_NODE)
}

export function getGoalToGoalLinks(goal: SemanticLinkNode, goals: SemanticLinkNode[]): SemanticLink[] {
  return buildSemanticLinks(goal, goals.filter(item => item.type === 'goal'))
}

export function getGoalDiscoveryLinks(goal: SemanticLinkNode, nodes: SemanticLinkNode[]): SemanticLink[] {
  return buildSemanticLinks(
    goal,
    nodes.filter(item => ['goal', 'compare', 'stack', 'compound', 'herb'].includes(item.type)),
  )
}

export function getCompareTraversalLinks(compare: SemanticLinkNode, compares: SemanticLinkNode[]): SemanticLink[] {
  return buildSemanticLinks(compare, compares.filter(item => item.type === 'compare'))
}

export function getStackCompareLinks(stack: SemanticLinkNode, compares: SemanticLinkNode[]): SemanticLink[] {
  return buildSemanticLinks(stack, compares.filter(item => item.type === 'compare'))
}

export function getMechanismCompoundLinks(mechanism: SemanticLinkNode, compounds: SemanticLinkNode[]): SemanticLink[] {
  return buildSemanticLinks(mechanism, compounds.filter(item => item.type === 'compound'))
}

export function pruneCircularTraversal(links: SemanticLink[]): SemanticLink[] {
  const seen = new Set<string>()

  // Prevent traversal explosions and duplicate semantic loops.
  return links.filter(link => {
    const reverseKey = `${link.target}:${link.source}`
    if (seen.has(reverseKey)) return false

    seen.add(`${link.source}:${link.target}`)
    return true
  })
}

export function buildSemanticTraversalMap(nodes: SemanticLinkNode[]): Record<string, SemanticLink[]> {
  const map: Record<string, SemanticLink[]> = {}

  nodes.forEach(node => {
    const slug = nodeSlug(node)

    const related = nodes.filter(candidate => {
      if (nodeSlug(candidate) === slug) return false

      const overlap = getMechanismOverlap(node, candidate).count + getGoalOverlap(node, candidate).length
      return overlap > 0
    })

    map[slug] = pruneCircularTraversal(buildSemanticLinks(node, related))
  })

  return map
}
