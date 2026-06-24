import { list, text, unique } from '@/lib/display-utils'

export type SemanticGraphNode = {
  id: string
  label: string
  type: 'source' | 'mechanism' | 'pathway' | 'effect' | 'evidence' | 'ecosystem'
  weight: number
}

export type SemanticGraphEdge = {
  source: string
  target: string
  relationship: 'mechanism' | 'pathway' | 'effect' | 'evidence' | 'ecosystem'
  weight: number
}

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

function evidenceWeight(record: any) {
  const evidence = normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.profile_status)

  if (/strong|clinical|high/.test(evidence)) return 4
  if (/moderate|human/.test(evidence)) return 3
  if (/limited|traditional|early/.test(evidence)) return 2
  return 1
}

function nodeTypeForSignal(signal: string, record: any): SemanticGraphNode['type'] {
  const normalized = normalize(signal)
  const mechanismText = list(record?.mechanisms).map(normalize).join(' ')
  const pathwayText = list(record?.pathways).map(normalize).join(' ')
  const effectText = [...list(record?.primary_effects), ...list(record?.effects)].map(normalize).join(' ')

  if (mechanismText.includes(normalized)) return 'mechanism'
  if (pathwayText.includes(normalized)) return 'pathway'
  if (effectText.includes(normalized)) return 'effect'
  return 'ecosystem'
}

export function buildSemanticGraphVisual(record: any, relatedRecords: any[] = [], limit = 14) {
  if (!record?.slug) {
    return { nodes: [], edges: [] }
  }

  const sourceId = record.slug
  const sourceLabel = text(record?.displayName || record?.name || record?.slug) || sourceId
  const primarySignals = unique([
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
  ].map(normalize).filter(Boolean)).slice(0, 8)

  const nodes: SemanticGraphNode[] = [
    {
      id: sourceId,
      label: title(sourceLabel),
      type: 'source',
      weight: 5,
    },
  ]

  const edges: SemanticGraphEdge[] = []

  primarySignals.forEach((signal) => {
    const nodeId = `signal:${signal}`
    const type = nodeTypeForSignal(signal, record)

    nodes.push({
      id: nodeId,
      label: title(signal),
      type,
      weight: 3,
    })

    edges.push({
      source: sourceId,
      target: nodeId,
      relationship: type === 'mechanism' ? 'mechanism' : type === 'pathway' ? 'pathway' : type === 'effect' ? 'effect' : 'ecosystem',
      weight: 3,
    })
  })

  relatedRecords.slice(0, limit).forEach((candidate) => {
    if (!candidate?.slug || candidate.slug === sourceId) return

    const candidateSignals = unique([
      ...list(candidate?.primary_effects),
      ...list(candidate?.effects),
      ...list(candidate?.mechanisms),
      ...list(candidate?.pathways),
    ].map(normalize).filter(Boolean))

    const shared = primarySignals.filter((signal) => candidateSignals.includes(signal))

    if (shared.length === 0) return

    nodes.push({
      id: candidate.slug,
      label: title(text(candidate?.displayName || candidate?.name || candidate?.slug) || candidate.slug),
      type: evidenceWeight(candidate) >= 3 ? 'evidence' : 'ecosystem',
      weight: Math.min(4, shared.length + evidenceWeight(candidate)),
    })

    shared.slice(0, 3).forEach((signal) => {
      edges.push({
        source: `signal:${signal}`,
        target: candidate.slug,
        relationship: nodeTypeForSignal(signal, candidate) === 'mechanism' ? 'mechanism' : 'ecosystem',
        weight: shared.length,
      })
    })
  })

  return {
    nodes: uniqueNodes(nodes).slice(0, limit + 10),
    edges: edges.slice(0, limit * 3),
  }
}

function uniqueNodes(nodes: SemanticGraphNode[]) {
  const seen = new Set<string>()
  return nodes.filter((node) => {
    if (seen.has(node.id)) return false
    seen.add(node.id)
    return true
  })
}

export function graphNodeColor(type: SemanticGraphNode['type']) {
  switch (type) {
    case 'source':
      return '#2f7d4b'
    case 'mechanism':
      return '#2b5fa8'
    case 'pathway':
      return '#5f55a4'
    case 'effect':
      return '#a35f20'
    case 'evidence':
      return '#247a52'
    default:
      return '#566470'
  }
}
