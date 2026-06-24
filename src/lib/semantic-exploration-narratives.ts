import { list, text, unique } from '@/lib/display-utils'

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function title(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function collectSignals(record: any) {
  return unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

export function buildSemanticNarrative(record: any, relatedRecords: any[] = []) {
  const signals = collectSignals(record)
  const relatedSignals = relatedRecords.flatMap((candidate) => collectSignals(candidate))

  const overlapCounts = new Map<string, number>()

  relatedSignals.forEach((signal) => {
    overlapCounts.set(signal, (overlapCounts.get(signal) || 0) + 1)
  })

  const strongestSignals = [...overlapCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([signal]) => title(signal))

  const coreSignals = signals.slice(0, 4).map(title)

  return {
    overview:
      strongestSignals.length > 0
        ? `This profile clusters around ${strongestSignals.join(', ')} ecosystems and frequently overlaps with adjacent semantic pathways.`
        : 'This profile participates in broader semantic ecosystem continuity across related evidence and pathway systems.',

    pathways:
      coreSignals.length > 0
        ? `Research traversal commonly continues through ${coreSignals.join(', ')} pathway relationships.`
        : 'Pathway continuity relationships are still expanding as the semantic graph matures.',

    exploration:
      relatedRecords.length > 0
        ? `Adjacent exploration often branches into evidence-forward alternatives, mechanism-overlap profiles, and pathway-adjacent ecosystems.`
        : 'Additional ecosystem continuity relationships will expand as more graph connections are enriched.',
  }
}

export function buildContinuationPrompts(record: any, relatedRecords: any[] = []) {
  const signals = collectSignals(record)

  return unique([
    signals[0] ? `Continue researching ${title(signals[0])} pathways` : '',
    signals[1] ? `Explore adjacent ${title(signals[1])} ecosystems` : '',
    'Compare evidence-forward alternatives',
    'Explore mechanism-overlap profiles',
    relatedRecords[0]
      ? `Continue into ${title(text(relatedRecords[0]?.displayName || relatedRecords[0]?.name || relatedRecords[0]?.slug))}`
      : '',
  ].filter(Boolean)).slice(0, 5)
}
