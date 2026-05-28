import type { GraphRuntime, GraphNode, GraphRelationship } from '../src/types/graph'
import { loadRuntimeGraph } from './runtime-graph'

export type CompareGroup = {
  nodes: GraphNode[]
  sharedPathways: string[]
  sharedMechanisms: string[]
  sharedTopics: string[]
}

function normalize(str: string): string {
  return (str || '').toLowerCase().trim()
}

export function getNodesByPathway(pathway: string, graphInput?: GraphRuntime): GraphNode[] {
  const graph = graphInput || loadRuntimeGraph()
  const norm = normalize(pathway)
  return (graph.nodes || []).filter((node) => 
    (node.pathways || []).some((p) => normalize(p) === norm)
  )
}

export function getNodesByMechanism(mechanism: string, graphInput?: GraphRuntime): GraphNode[] {
  const graph = graphInput || loadRuntimeGraph()
  const norm = normalize(mechanism)
  return (graph.nodes || []).filter((node) => 
    (node.mechanisms || []).some((m) => normalize(m) === norm)
  )
}

export function getNodesByTopic(topic: string, graphInput?: GraphRuntime): GraphNode[] {
  const graph = graphInput || loadRuntimeGraph()
  const norm = normalize(topic)
  return (graph.nodes || []).filter((node) => 
    (node.topics || []).some((t) => normalize(t) === norm)
  )
}

export function getCompareGroup(slugs: string[], graphInput?: GraphRuntime): CompareGroup {
  const graph = graphInput || loadRuntimeGraph()
  const nodes = (graph.nodes || []).filter((n) => slugs.includes(n.slug))
  
  if (nodes.length === 0) {
    return { nodes: [], sharedPathways: [], sharedMechanisms: [], sharedTopics: [] }
  }

  // Find shared pathways
  const firstPathways = nodes[0].pathways || []
  const sharedPathways = firstPathways.filter((pathway) =>
    nodes.every((node) => (node.pathways || []).some((p) => normalize(p) === normalize(pathway)))
  )

  // Find shared mechanisms
  const firstMechanisms = nodes[0].mechanisms || []
  const sharedMechanisms = firstMechanisms.filter((mechanism) =>
    nodes.every((node) => (node.mechanisms || []).some((m) => normalize(m) === normalize(mechanism)))
  )

  // Find shared topics
  const firstTopics = nodes[0].topics || []
  const sharedTopics = firstTopics.filter((topic) =>
    nodes.every((node) => (node.topics || []).some((t) => normalize(t) === normalize(topic)))
  )

  return {
    nodes,
    sharedPathways,
    sharedMechanisms,
    sharedTopics,
  }
}

export function getNHopNeighbors(slug: string, hops: number = 1, graphInput?: GraphRuntime): GraphNode[] {
  const graph = graphInput || loadRuntimeGraph()
  const startNode = (graph.nodes || []).find((n) => n.slug === slug)
  if (!startNode) return []

  let currentLevel = new Set<string>([slug])
  const visited = new Set<string>([slug])

  for (let i = 0; i < hops; i++) {
    const nextLevel = new Set<string>()
    const relationships = (graph.relationships || []) as GraphRelationship[]

    relationships.forEach((rel) => {
      const source = rel.source
      const target = rel.target
      if (currentLevel.has(source) && !visited.has(target)) {
        nextLevel.add(target)
        visited.add(target)
      }
      if (currentLevel.has(target) && !visited.has(source)) {
        nextLevel.add(source)
        visited.add(source)
      }
    })

    if (nextLevel.size === 0) break
    currentLevel = nextLevel
  }

  // Exclude the starting node itself
  visited.delete(slug)

  return (graph.nodes || []).filter((n) => visited.has(n.slug))
}
