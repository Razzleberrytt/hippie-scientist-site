export type WeightedExperimentVariant<T extends string> = {
  id: T
  weight?: number
}

/**
 * Stable FNV-1a style hash used only for deterministic experiment bucketing.
 * This is deliberately not an identity hash and must never receive email,
 * account IDs, or other personal data.
 */
export function experimentBucket(experimentId: string, anonymousSubject: string): number {
  const input = `${experimentId}:${anonymousSubject}`
  let hash = 0x811c9dc5

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }

  return (hash >>> 0) / 0x100000000
}

export function assignExperimentVariant<T extends string>(
  experimentId: string,
  anonymousSubject: string,
  variants: readonly WeightedExperimentVariant<T>[],
): T {
  if (!variants.length) {
    throw new Error(`Experiment ${experimentId} must define at least one variant.`)
  }

  const weights = variants.map((variant) => Math.max(0, variant.weight ?? 1))
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  if (totalWeight <= 0) {
    throw new Error(`Experiment ${experimentId} must have positive variant weight.`)
  }

  const target = experimentBucket(experimentId, anonymousSubject) * totalWeight
  let cumulative = 0

  for (let index = 0; index < variants.length; index += 1) {
    cumulative += weights[index]
    if (target < cumulative) return variants[index].id
  }

  return variants[variants.length - 1].id
}
