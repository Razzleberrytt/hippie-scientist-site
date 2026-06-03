import type { GraphRuntime, GraphNode } from '../src/types/graph'
import { loadRuntimeGraph, getGraphNode } from './runtime-graph'

export type RelatedEntity = {
  targetSlug: string
  relatedSlug: string
  relationshipType: 'mechanism_overlap' | 'effect_overlap' | 'category_overlap' | 'unknown'
  score: number
  reasons: string[]
}

function normalize(str: string): string {
  return (str || '').toLowerCase().trim()
}

function getOverlap<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set((arr2 || []).map((x) => typeof x === 'string' ? normalize(x) : x))
  return (arr1 || []).filter((x) => set2.has(typeof x === 'string' ? normalize(x as any) : x))
}

export function getMechanismOverlap(slugA: string, slugB: string, graphInput?: GraphRuntime): string[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodeA = getGraphNode(graph, slugA) as GraphNode | null
  const nodeB = getGraphNode(graph, slugB) as GraphNode | null
  if (!nodeA || !nodeB) return []
  return getOverlap(nodeA.mechanisms || [], nodeB.mechanisms || [])
}

export function getEffectOverlap(slugA: string, slugB: string, graphInput?: GraphRuntime): string[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodeA = getGraphNode(graph, slugA)
  const nodeB = getGraphNode(graph, slugB)
  if (!nodeA || !nodeB) return []
  return getOverlap(nodeA.effects || [], nodeB.effects || [])
}

export function getSafetyConflicts(slugA: string, slugB: string, graphInput?: GraphRuntime): string[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodeA = getGraphNode(graph, slugA)
  const nodeB = getGraphNode(graph, slugB)
  if (!nodeA || !nodeB) return []
  return getOverlap(nodeA.safety_flags || [], nodeB.safety_flags || [])
}

export function scoreRelationshipStrength(slugA: string, slugB: string, graphInput?: GraphRuntime): { score: number; reasons: string[] } {
  const graph = graphInput || loadRuntimeGraph()
  const nodeA = getGraphNode(graph, slugA)
  const nodeB = getGraphNode(graph, slugB)
  
  if (!nodeA || !nodeB || slugA === slugB) {
    return { score: 0, reasons: ['Entities not found or identical'] }
  }

  const reasons: string[] = []
  let score = 0

  // Category match
  if (nodeA.type === nodeB.type) {
    score += 0.2
    reasons.push(`Shared type category: ${nodeA.type}`)
  }

  // Mechanism overlap
  const mechOverlap = getMechanismOverlap(slugA, slugB, graph)
  if (mechOverlap.length > 0) {
    const contribution = Math.min(0.4, mechOverlap.length * 0.15)
    score += contribution
    reasons.push(`Overlapping mechanisms: ${mechOverlap.slice(0, 3).join(', ')}`)
  }

  // Effect overlap
  const effOverlap = getEffectOverlap(slugA, slugB, graph)
  if (effOverlap.length > 0) {
    const contribution = Math.min(0.4, effOverlap.length * 0.15)
    score += contribution
    reasons.push(`Overlapping effects: ${effOverlap.slice(0, 3).join(', ')}`)
  }

  // Safety conflicts
  const conflicts = getSafetyConflicts(slugA, slugB, graph)
  if (conflicts.length > 0) {
    score -= 0.1
    reasons.push(`Shared safety/caution notes: ${conflicts.slice(0, 3).join(', ')}`)
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    reasons,
  }
}

const relatedEntitiesCache = new Map<string, RelatedEntity[]>()

export function getRelatedEntities(slug: string, graphInput?: GraphRuntime): RelatedEntity[] {
  const cacheKey = slug
  if (!graphInput && relatedEntitiesCache.has(cacheKey)) {
    return relatedEntitiesCache.get(cacheKey)!
  }

  const graph = graphInput || loadRuntimeGraph()
  const node = getGraphNode(graph, slug)
  if (!node) return []

  const results: RelatedEntity[] = []
  const nodes = graph.nodes || []

  nodes.forEach((other) => {
    if (other.slug === slug) return
    const { score, reasons } = scoreRelationshipStrength(slug, other.slug, graph)
    if (score > 0.1) {
      let relationshipType: 'mechanism_overlap' | 'effect_overlap' | 'category_overlap' | 'unknown' = 'unknown'
      const mechOverlap = getMechanismOverlap(slug, other.slug, graph)
      const effOverlap = getEffectOverlap(slug, other.slug, graph)
      
      if (mechOverlap.length > 0) relationshipType = 'mechanism_overlap'
      else if (effOverlap.length > 0) relationshipType = 'effect_overlap'
      else if (node.type === other.type) relationshipType = 'category_overlap'

      results.push({
        targetSlug: slug,
        relatedSlug: other.slug,
        relationshipType,
        score,
        reasons,
      })
    }
  })

  const sorted = results.sort((a, b) => b.score - a.score)
  if (!graphInput) {
    relatedEntitiesCache.set(cacheKey, sorted)
  }
  return sorted
}

export function getAlternatives(slug: string, graphInput?: GraphRuntime): RelatedEntity[] {
  // Alternatives are mechanistically overlapping entities of the same type
  const graph = graphInput || loadRuntimeGraph()
  const node = getGraphNode(graph, slug)
  if (!node) return []

  const related = getRelatedEntities(slug, graph)
  return related
    .filter((r) => {
      const other = getGraphNode(graph, r.relatedSlug)
      return other && other.type === node.type && r.relationshipType === 'mechanism_overlap'
    })
}
