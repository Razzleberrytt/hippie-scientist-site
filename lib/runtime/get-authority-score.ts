import type { DiscoveryContext } from '@/lib/runtime/get-discovery-items'

const CONTEXT_WEIGHTS: Record<DiscoveryContext, number> = {
  stress: 1.15,
  focus: 1.1,
  recovery: 1.2,
  adaptogen: 1.05,
  cognition: 1.1,
  psychoactive: 1.08,
  sleep: 1.12,
  default: 1,
}

export function getAuthorityScore(
  context: DiscoveryContext,
  baseScore = 1,
  relationshipStrength = 1
) {
  const contextWeight = CONTEXT_WEIGHTS[context] || 1

  const normalizedRelationship = Math.max(
    0.5,
    Math.min(relationshipStrength, 2)
  )

  return Number(
    (baseScore * contextWeight * normalizedRelationship).toFixed(3)
  )
}
