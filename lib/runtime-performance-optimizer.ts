export function lazySemanticThreshold(size: number) {
  if (size >= 2000) return 'aggressive'
  if (size >= 1000) return 'moderate'
  return 'standard'
}

export function recommendPayloadShardSize(records: number) {
  if (records >= 10000) return 250
  if (records >= 5000) return 500
  if (records >= 1000) return 750
  return 1000
}

export function runtimeOptimizationSummary(metrics: {
  routes: number
  relationships: number
  payloadMB: number
}) {
  return {
    hydration: metrics.payloadMB >= 4 ? 'prefer progressive hydration' : 'standard hydration acceptable',
    lazyLoading: lazySemanticThreshold(metrics.relationships),
    shardRecommendation: recommendPayloadShardSize(metrics.routes),
  }
}
