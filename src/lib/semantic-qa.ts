import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildMultiHopTraversal } from './multi-hop-traversal'

export type SemanticQAReport = {
  orphanNodes: string[]
  fragmentedEcosystems: string[]
  traversalDeadEnds: string[]
  redundantClusters: string[]
  overweightedSupernodes: string[]
  semanticDriftRisks: string[]
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

export function buildSemanticQAReport(
  records: any[],
): SemanticQAReport {
  const supernodes = buildAuthoritySupernodes(records)

  const orphanNodes: string[] = []
  const fragmentedEcosystems: string[] = []
  const traversalDeadEnds: string[] = []
  const redundantClusters: string[] = []
  const overweightedSupernodes: string[] = []
  const semanticDriftRisks: string[] = []

  const ecosystemCounts = new Map<string, number>()

  for (const record of records) {
    const slug = normalizeText(record?.slug)

    const ecosystems = normalizeList(record?.ecosystem_taxonomy)
    const pathways = normalizeList(record?.pathways)
    const compareGroups = normalizeList(record?.compare_groups)

    if (
      ecosystems.length === 0 &&
      pathways.length === 0 &&
      compareGroups.length === 0
    ) {
      orphanNodes.push(slug)
    }

    if (pathways.length === 0 && ecosystems.length <= 1) {
      traversalDeadEnds.push(slug)
    }

    if (ecosystems.length >= 5) {
      semanticDriftRisks.push(slug)
    }

    for (const ecosystem of ecosystems) {
      const normalized = normalizeText(ecosystem)

      ecosystemCounts.set(
        normalized,
        (ecosystemCounts.get(normalized) || 0) + 1,
      )
    }
  }

  for (const [ecosystem, count] of ecosystemCounts.entries()) {
    if (count <= 1) {
      fragmentedEcosystems.push(ecosystem)
    }

    if (count >= 20) {
      redundantClusters.push(ecosystem)
    }
  }

  for (const node of supernodes) {
    if (node.traversalWeight >= 92) {
      overweightedSupernodes.push(node.slug)
    }
  }

  return {
    orphanNodes,
    fragmentedEcosystems,
    traversalDeadEnds,
    redundantClusters,
    overweightedSupernodes,
    semanticDriftRisks,
  }
}
