export function buildEcosystemHeatmap(nodes: any[] = []) {
  return nodes.map((node, index) => ({
    id: node?.slug || `node-${index}`,
    weight: node?.weight || 1,
    density: node?.connections || 0,
  }))
}

export function buildSemanticDensityVisualization(metrics: {
  nodes: number
  relationships: number
}) {
  return {
    densityScore: metrics.nodes > 0 ? metrics.relationships / metrics.nodes : 0,
    classification:
      metrics.relationships / Math.max(metrics.nodes, 1) >= 8
        ? 'high-density'
        : metrics.relationships / Math.max(metrics.nodes, 1) >= 4
          ? 'moderate-density'
          : 'low-density',
  }
}
