import type { GraphRuntime, GraphNode } from '../src/types/graph'
import { loadRuntimeGraph, getGraphNode } from './runtime-graph'
import { getRelatedEntities } from './semantic-relationship-engine'

export type PageSuggestion = {
  label: string
  href: string
  type: string
  relevanceScore: number
}

export type LinkCandidate = {
  anchorText: string
  targetSlug: string
  href: string
}

export type HubCandidate = {
  name: string
  count: number
  members: string[]
}

export function getRelatedPageSuggestions(slug: string, graphInput?: GraphRuntime): PageSuggestion[] {
  const graph = graphInput || loadRuntimeGraph()
  const node = getGraphNode(graph, slug)
  if (!node) return []

  const suggestions: PageSuggestion[] = []
  
  // Suggest the actual page
  suggestions.push({
    label: `${node.name} Profile`,
    href: `/${node.type === 'herb' ? 'herbs' : 'compounds'}/${node.slug}`,
    type: 'profile',
    relevanceScore: 1.0,
  })

  // Suggest related profiles from relationship engine
  const related = getRelatedEntities(slug, graph).slice(0, 3)
  related.forEach((r) => {
    const other = getGraphNode(graph, r.relatedSlug)
    if (other) {
      suggestions.push({
        label: `Compare ${node.name} vs ${other.name}`,
        href: `/compare?a=${node.slug}&b=${other.slug}`,
        type: 'comparison',
        relevanceScore: parseFloat((r.score * 0.9).toFixed(2)),
      })
    }
  })

  // Suggest goal hubs
  const topics = node.topics || []
  topics.forEach((topic) => {
    suggestions.push({
      label: `${topic} Decision Guide`,
      href: `/goals/${topic.toLowerCase()}`,
      type: 'goal-hub',
      relevanceScore: 0.75,
    })
  })

  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

export function getInternalLinkCandidates(text: string, graphInput?: GraphRuntime): LinkCandidate[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodes = graph.nodes || []
  const candidates: LinkCandidate[] = []

  const lowerText = text.toLowerCase()

  nodes.forEach((node) => {
    const names = [node.name, node.slug, ...(node.aliases || [])].map((n) => n.toLowerCase())
    
    for (const name of names) {
      if (name.length > 3 && lowerText.includes(name)) {
        candidates.push({
          anchorText: node.name,
          targetSlug: node.slug,
          href: `/${node.type === 'herb' ? 'herbs' : 'compounds'}/${node.slug}`,
        })
        break
      }
    }
  })

  return candidates
}

export function getMechanismHubCandidates(graphInput?: GraphRuntime): HubCandidate[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodes = graph.nodes || []
  const counts: Record<string, string[]> = {}

  nodes.forEach((node) => {
    (node.mechanisms || []).forEach((mech) => {
      if (!counts[mech]) counts[mech] = []
      counts[mech].push(node.slug)
    })
  })

  return Object.entries(counts)
    .map(([name, members]) => ({
      name,
      count: members.length,
      members,
    }))
    .filter((hub) => hub.count >= 2)
    .sort((a, b) => b.count - a.count)
}

export function getEffectHubCandidates(graphInput?: GraphRuntime): HubCandidate[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodes = graph.nodes || []
  const counts: Record<string, string[]> = {}

  nodes.forEach((node) => {
    (node.effects || []).forEach((eff) => {
      if (!counts[eff]) counts[eff] = []
      counts[eff].push(node.slug)
    })
  })

  return Object.entries(counts)
    .map(([name, members]) => ({
      name,
      count: members.length,
      members,
    }))
    .filter((hub) => hub.count >= 2)
    .sort((a, b) => b.count - a.count)
}

export function getGoalHubCandidates(graphInput?: GraphRuntime): HubCandidate[] {
  const graph = graphInput || loadRuntimeGraph()
  const nodes = graph.nodes || []
  const counts: Record<string, string[]> = {}

  nodes.forEach((node) => {
    (node.topics || []).forEach((topic) => {
      if (!counts[topic]) counts[topic] = []
      counts[topic].push(node.slug)
    })
  })

  return Object.entries(counts)
    .map(([name, members]) => ({
      name,
      count: members.length,
      members,
    }))
    .filter((hub) => hub.count >= 2)
    .sort((a, b) => b.count - a.count)
}
