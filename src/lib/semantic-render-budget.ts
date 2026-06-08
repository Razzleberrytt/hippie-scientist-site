export type SemanticRenderBudget = {
  maxRails: number
  maxCardsPerRail: number
  maxGraphNodes: number
  maxGraphEdges: number
  maxRecommendationItems: number
}

export const semanticRenderBudget: SemanticRenderBudget = {
  maxRails: 6,
  maxCardsPerRail: 12,
  maxGraphNodes: 18,
  maxGraphEdges: 36,
  maxRecommendationItems: 14,
}

export function clampRailItems<T>(items: T[], limit = semanticRenderBudget.maxCardsPerRail) {
  return items.slice(0, limit)
}

export function clampGraph<T>(items: T[], limit = semanticRenderBudget.maxGraphNodes) {
  return items.slice(0, limit)
}

export function shouldRenderRail(index: number) {
  return index < semanticRenderBudget.maxRails
}

export function graphComplexity(nodes: number, edges: number) {
  return {
    healthy:
      nodes <= semanticRenderBudget.maxGraphNodes &&
      edges <= semanticRenderBudget.maxGraphEdges,
    nodes,
    edges,
  }
}
