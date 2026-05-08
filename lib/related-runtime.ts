import { list, text, unique } from '@/lib/display-utils'

function normalize(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

function collectSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.primaryEffects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ])
    .map(normalize)
    .filter(Boolean)
}

export function getRelatedRuntimeRecords(record: any, records: any[], limit = 6) {
  const sourceSignals = collectSignals(record)

  if (!sourceSignals.length) {
    return []
  }

  return records
    .filter((candidate) => {
      if (!candidate || candidate.slug === record.slug) {
        return false
      }

      const candidateSignals = collectSignals(candidate)

      return candidateSignals.some((signal) =>
        sourceSignals.includes(signal)
      )
    })
    .map((candidate) => {
      const candidateSignals = collectSignals(candidate)

      const overlap = candidateSignals.filter((signal) =>
        sourceSignals.includes(signal)
      )

      return {
        ...candidate,
        relatedOverlap: overlap,
        relatedScore: overlap.length,
      }
    })
    .sort((a, b) => b.relatedScore - a.relatedScore)
    .slice(0, limit)
}

export function getRelatedLabel(record: any) {
  const primary = collectSignals(record)[0]

  if (!primary) {
    return 'Related Research Profiles'
  }

  return `Related to ${text(primary)}`
}
