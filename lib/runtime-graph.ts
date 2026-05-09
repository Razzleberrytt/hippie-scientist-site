type GraphRecord = Record<string, unknown>

export type GraphNode = {
  id?: string
  slug?: string
  name?: string
  type?: string
  aliases?: string[]
  topics?: string[]
  pathways?: string[]
  mechanisms?: string[]
  effects?: string[]
  summary?: string
  retrieval_summary?: string
}

export type GraphRelationship = {
  id?: string
  source?: string
  target?: string
  type?: string
  weight?: string | number
  rationale?: string
  evidence_context?: string
  pathways?: string[]
  mechanisms?: string[]
  topics?: string[]
}

export type GraphEcosystem = {
  id?: string
  slug?: string
  name?: string
  kind?: string
  summary?: string
  retrieval_summary?: string
  anchors?: string[]
  herbs?: string[]
  compounds?: string[]
  mechanisms?: string[]
  pathways?: string[]
  topics?: string[]
}

export type GraphCandidate = {
  id?: string
  source?: string
  target?: string
  rationale?: string
  evidence_context?: string
  framing?: string
  mechanism_overlap?: string[]
  pathway_overlap?: string[]
  topic_overlap?: string[]
  mechanism_complementarity?: string[]
  pathway_complementarity?: string[]
}

export type GraphRuntime = {
  nodes?: GraphNode[]
  relationships?: GraphRelationship[]
  topics?: GraphEcosystem[]
  pathways?: GraphEcosystem[]
  comparisons?: GraphCandidate[]
  stacks?: GraphCandidate[]
  supernodes?: GraphEcosystem[]
}

function asText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : ''
}

function asLowerText(value: unknown): string {
  return asText(value).toLowerCase()
}

function slugify(value: unknown): string {
  return asLowerText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean)
  }

  return asText(value)
    .split(/[|;,]/)
    .map(asText)
    .filter(Boolean)
}

function unique(values: unknown): string[] {
  const seen = new Set<string>()

  return asList(values).filter((value) => {
    const key = asLowerText(value)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeKey(value: unknown): string {
  return slugify(value)
}

function nodeKeys(node: GraphNode): string[] {
  return unique([
    node.id,
    node.slug,
    node.name,
    ...(Array.isArray(node.aliases) ? node.aliases : []),
  ]).map(normalizeKey)
}

function recordKeys(record: GraphRecord | null | undefined): string[] {
  if (!record) return []

  return unique([
    record.id,
    record.slug,
    record.name,
    record.title,
    ...(Array.isArray(record.aliases) ? record.aliases : []),
  ]).map(normalizeKey)
}

function getNodes(graph: GraphRuntime | null | undefined): GraphNode[] {
  return Array.isArray(graph?.nodes) ? graph.nodes.filter(Boolean) : []
}

function getRelationships(
  graph: GraphRuntime | null | undefined
): GraphRelationship[] {
  return Array.isArray(graph?.relationships)
    ? graph.relationships.filter(Boolean)
    : []
}

function hasSharedItem(a: unknown, b: unknown): boolean {
  const left = new Set(asList(a).map(normalizeKey).filter(Boolean))
  if (!left.size) return false

  return asList(b)
    .map(normalizeKey)
    .some((key) => key && left.has(key))
}

function matchesProfile(node: GraphNode, profile: GraphRecord | string): boolean {
  const targetKeys =
    typeof profile === 'string' ? [normalizeKey(profile)] : recordKeys(profile)

  if (!targetKeys.length) return false

  return nodeKeys(node).some((key) => targetKeys.includes(key))
}

function matchesSlug(value: unknown, profile: GraphRecord | string): boolean {
  const key = normalizeKey(value)
  if (!key) return false

  const targetKeys =
    typeof profile === 'string' ? [normalizeKey(profile)] : recordKeys(profile)

  return targetKeys.includes(key)
}

function byNameOrSlug<T extends { id?: string; slug?: string; name?: string }>(
  rows: T[] | undefined,
  key: string
): T | null {
  if (!Array.isArray(rows)) return null
  const normalized = normalizeKey(key)

  return (
    rows.find((row) =>
      [row.id, row.slug, row.name].map(normalizeKey).includes(normalized)
    ) || null
  )
}

function candidateScore(candidate: GraphCandidate | GraphRelationship): number {
  const weight = Number(asText(candidate.weight))
  const rationale = asText(candidate.rationale)
  return (Number.isFinite(weight) ? weight : 0) + (rationale ? 1 : 0)
}

function sortCandidates<T extends GraphCandidate | GraphRelationship>(rows: T[]): T[] {
  return [...rows].sort((a, b) => candidateScore(b) - candidateScore(a))
}

export function getGraphNode(
  graph: GraphRuntime | null | undefined,
  profile: GraphRecord | string
): GraphNode | null {
  return getNodes(graph).find((node) => matchesProfile(node, profile)) || null
}

export function getRelatedProfiles(
  graph: GraphRuntime | null | undefined,
  profile: GraphRecord | string,
  limit = 8
): GraphRelationship[] {
  const node = getGraphNode(graph, profile)
  const keys = new Set([
    ...(node ? nodeKeys(node) : []),
    ...(typeof profile === 'string' ? [normalizeKey(profile)] : recordKeys(profile)),
  ].filter(Boolean))

  if (!keys.size) return []

  const direct = getRelationships(graph).filter(
    (relationship) =>
      keys.has(normalizeKey(relationship.source)) ||
      keys.has(normalizeKey(relationship.target))
  )

  const semanticFallback = node
    ? getNodes(graph)
        .filter((candidate) => candidate !== node)
        .filter(
          (candidate) =>
            hasSharedItem(node.mechanisms, candidate.mechanisms) ||
            hasSharedItem(node.pathways, candidate.pathways) ||
            hasSharedItem(node.topics, candidate.topics)
        )
        .map((candidate) => ({
          id: `${node.slug || node.id}-${candidate.slug || candidate.id}`,
          source: node.slug || node.id,
          target: candidate.slug || candidate.id,
          type: 'semantic-overlap',
          rationale: 'Related by shared mechanisms, pathways, or topic ecosystem context.',
          mechanisms: candidate.mechanisms,
          pathways: candidate.pathways,
          topics: candidate.topics,
        }))
    : []

  return sortCandidates([...direct, ...semanticFallback]).slice(0, limit)
}

export function getTopicEcosystem(
  graph: GraphRuntime | null | undefined,
  topic: string
): GraphEcosystem | null {
  return byNameOrSlug(graph?.topics, topic)
}

export function getPathwayEcosystem(
  graph: GraphRuntime | null | undefined,
  pathway: string
): GraphEcosystem | null {
  return byNameOrSlug(graph?.pathways, pathway)
}

export function getComparisonCandidates(
  graph: GraphRuntime | null | undefined,
  profile: GraphRecord | string,
  limit = 8
): GraphCandidate[] {
  if (!Array.isArray(graph?.comparisons)) return []

  return sortCandidates(
    graph.comparisons.filter(
      (candidate) =>
        matchesSlug(candidate.source, profile) || matchesSlug(candidate.target, profile)
    )
  ).slice(0, limit)
}

export function getStackCandidates(
  graph: GraphRuntime | null | undefined,
  profile: GraphRecord | string,
  limit = 8
): GraphCandidate[] {
  if (!Array.isArray(graph?.stacks)) return []

  return sortCandidates(
    graph.stacks.filter(
      (candidate) =>
        matchesSlug(candidate.source, profile) || matchesSlug(candidate.target, profile)
    )
  ).slice(0, limit)
}

export function getAuthoritySupernodes(
  graph: GraphRuntime | null | undefined,
  profile?: GraphRecord | string,
  limit = 12
): GraphEcosystem[] {
  if (!Array.isArray(graph?.supernodes)) return []

  if (!profile) return graph.supernodes.slice(0, limit)

  const profileKeys =
    typeof profile === 'string' ? [normalizeKey(profile)] : recordKeys(profile)

  return graph.supernodes
    .filter((supernode) =>
      [
        supernode.id,
        supernode.slug,
        supernode.name,
        ...(Array.isArray(supernode.anchors) ? supernode.anchors : []),
      ]
        .map(normalizeKey)
        .some((key) => profileKeys.includes(key))
    )
    .slice(0, limit)
}

export function getEcosystemsForProfile(
  graph: GraphRuntime | null | undefined,
  profile: GraphRecord | string
): { topics: GraphEcosystem[]; pathways: GraphEcosystem[] } {
  const node = getGraphNode(graph, profile)
  const profileKeys =
    typeof profile === 'string' ? [normalizeKey(profile)] : recordKeys(profile)

  const topics = Array.isArray(graph?.topics)
    ? graph.topics.filter(
        (topic) =>
          hasSharedItem(topic.topics, node?.topics) ||
          asList(topic.anchors).map(normalizeKey).some((key) => profileKeys.includes(key)) ||
          asList(topic.herbs).map(normalizeKey).some((key) => profileKeys.includes(key)) ||
          asList(topic.compounds).map(normalizeKey).some((key) => profileKeys.includes(key))
      )
    : []

  const pathways = Array.isArray(graph?.pathways)
    ? graph.pathways.filter(
        (pathway) =>
          hasSharedItem(pathway.pathways, node?.pathways) ||
          asList(pathway.anchors).map(normalizeKey).some((key) => profileKeys.includes(key)) ||
          asList(pathway.herbs).map(normalizeKey).some((key) => profileKeys.includes(key)) ||
          asList(pathway.compounds).map(normalizeKey).some((key) => profileKeys.includes(key))
      )
    : []

  return { topics, pathways }
}
