import {
  SEMANTIC_EXPANSION_LIMITS,
  cappedExpansion,
  stableSemanticKey,
} from '@/src/lib/semantic-expansion-budget'
import { stableRelationshipRanking } from '@/src/lib/semantic-sort-runtime'
import { safeArray, safeText } from '@/lib/runtime-render-guards'

export type SemanticContinuityNode = {
  label: string
  score: number
  relationships?: string[]
}

function normalize(value: unknown) {
  return safeText(value).toLowerCase().trim()
}

export function buildSemanticContinuitySnapshot(
  nodes: unknown = [],
): SemanticContinuityNode[] {
  const normalized = cappedExpansion(
    safeArray(nodes)
      .map((node: any) => ({
        label: safeText(node?.label || node?.slug || node?.name),
        score: Number(node?.score || node?.discoveryScore || 0),
        relationships: cappedExpansion(
          safeArray(node?.relationships)
            .map((value) => normalize(value))
            .filter(Boolean),
          8,
        ),
      }))
      .filter((node) => node.label.length > 0),
    SEMANTIC_EXPANSION_LIMITS.maxContinuities,
  )

  return stableRelationshipRanking(
    normalized,
    (node) => node.score,
    (node) => stableSemanticKey(node.label),
    SEMANTIC_EXPANSION_LIMITS.maxContinuities,
  )
}

export function dedupeSemanticRelationships(values: unknown = []): string[] {
  return [...new Set(
    cappedExpansion(
      safeArray(values)
        .map((value) => normalize(value))
        .filter(Boolean),
      SEMANTIC_EXPANSION_LIMITS.maxBridgeExpansions,
    ),
  )]
}
