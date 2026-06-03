import type {
  GraphRuntime,
  GraphNode,
  GraphRelationship,
  GraphCandidate,
  GraphEcosystem,
} from '../src/types/graph'
import {
  loadRuntimeGraph,
  getGraphNode,
  getRelatedProfiles,
  getComparisonCandidates,
  getStackCandidates,
  getEcosystemsForProfile,
  getAuthoritySupernodes,
} from './runtime-graph'

export type EntityLinks = {
  node: GraphNode | null
  relationships: GraphRelationship[]
  comparisons: GraphCandidate[]
  stacks: GraphCandidate[]
  topics: GraphEcosystem[]
  pathways: GraphEcosystem[]
  supernodes: GraphEcosystem[]
}

export function getEntityLinks(slug: string, graphInput?: GraphRuntime): EntityLinks {
  const graph = graphInput || loadRuntimeGraph()
  const node = getGraphNode(graph, slug)
  
  if (!node) {
    return {
      node: null,
      relationships: [],
      comparisons: [],
      stacks: [],
      topics: [],
      pathways: [],
      supernodes: [],
    }
  }

  const relationships = getRelatedProfiles(graph, slug)
  const comparisons = getComparisonCandidates(graph, slug)
  const stacks = getStackCandidates(graph, slug)
  const ecosystems = getEcosystemsForProfile(graph, slug)
  const supernodes = getAuthoritySupernodes(graph, slug)

  return {
    node,
    relationships,
    comparisons,
    stacks,
    topics: ecosystems.topics,
    pathways: ecosystems.pathways,
    supernodes,
  }
}
