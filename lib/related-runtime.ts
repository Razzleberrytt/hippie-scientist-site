import { list, text, unique } from '@/lib/display-utils'
import { safeArray, safeLower, safeScore, safeSlug } from '@/lib/search-safe'
import { calculateDiscoveryScore } from '@/lib/discovery-score'
import { collectEcosystemSignals, normalizeEcosystemFields } from '@/lib/ecosystem-intelligence'

function normalize(value: unknown) {
  return safeLower(value)
}

function collectSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.primaryEffects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.targets),
    ...list(record?.biologicalTargets),
    ...list(record?.compoundClass),
    ...list(record?.class),
    ...list(record?.foundIn),
    ...list(record?.activeCompounds),
    ...list(record?.traditionalUses),
    ...collectEcosystemSignals(record),
  ])
    .map(normalize)
    .filter(Boolean)
}

export function getRelatedRuntimeRecords(record: any, records: any[], limit = 6) {
  const sourceSlug = safeSlug(record?.slug)
  const sourceSignals = collectSignals(record)
  const explicitNeighbors = new Set(normalizeEcosystemFields(record).semanticNeighbors)

  if (!sourceSignals.length && !explicitNeighbors.size) {
    return []
  }

  const seen = new Set<string>()

  return safeArray(records)
    .filter((candidate: any) => {
      const candidateSlug = safeSlug(candidate?.slug)

      if (!candidate || !candidateSlug || candidateSlug === sourceSlug) {
        return false
      }

      if (seen.has(candidateSlug)) {
        return false
      }

      const candidateSignals = collectSignals(candidate)

      const matched = explicitNeighbors.has(candidateSlug) || candidateSignals.some((signal) =>
        sourceSignals.includes(signal)
      )

      if (matched) {
        seen.add(candidateSlug)
      }

      return matched
    })
    .map((candidate: any) => {
      const candidateSignals = collectSignals(candidate)

      const overlap = candidateSignals.filter((signal) =>
        sourceSignals.includes(signal)
      )
      const explicitBoost = explicitNeighbors.has(safeSlug(candidate?.slug)) ? 4 : 0
      const ecosystemBoost = normalizeEcosystemFields(candidate).authoritySupernode ? 1 : 0

      return {
        ...candidate,
        relatedOverlap: overlap,
        relatedScore: safeScore(overlap.length) + explicitBoost + ecosystemBoost + calculateDiscoveryScore(record, candidate),
      }
    })
    .sort((a: any, b: any) => {
      const scoreDelta = safeScore(b?.relatedScore) - safeScore(a?.relatedScore)

      if (scoreDelta !== 0) {
        return scoreDelta
      }

      return safeLower(a?.name).localeCompare(safeLower(b?.name))
    })
    .slice(0, Math.max(0, safeScore(limit, 6)))
}

export function getRelatedLabel(record: any) {
  const primary = collectSignals(record)[0]

  if (!primary) {
    return 'Related Research Profiles'
  }

  return `Related to ${text(primary)}`
}
