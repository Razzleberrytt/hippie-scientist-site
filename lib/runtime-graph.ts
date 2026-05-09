import { readFileSync } from 'node:fs'
import { join } from 'node:path'

type GraphRecord = Record<string, unknown>
type GraphInput = GraphRuntime | null | undefined

type ProfileInput = GraphRecord | string

type ResolvedProfileArgs = {
  graph: GraphRuntime
  profile: ProfileInput
  limit?: number
}

function resolveProfileArgs(
  graphOrProfile: GraphInput | ProfileInput,
  profileOrLimit?: ProfileInput | number,
  maybeLimit?: number
): ResolvedProfileArgs {
  if (typeof profileOrLimit === 'string' || asRecord(profileOrLimit)) {
    return {
      graph: normalizeGraphRuntime(graphOrProfile as GraphInput),
      profile: profileOrLimit as ProfileInput,
      limit: maybeLimit,
    }
  }

  return {
    graph: loadRuntimeGraph(),
    profile: graphOrProfile as ProfileInput,
    limit: typeof profileOrLimit === 'number' ? profileOrLimit : maybeLimit,
  }
}

function resolveEcosystemArgs(
  graphOrKey: GraphInput | string,
  maybeKey?: string
): { graph: GraphRuntime; key: string } {
  if (typeof maybeKey === 'string') {
    return { graph: normalizeGraphRuntime(graphOrKey as GraphInput), key: maybeKey }
  }

  return { graph: loadRuntimeGraph(), key: asText(graphOrKey) }
}

function isGraphLike(value: unknown): boolean {
  const record = asRecord(value)
  if (!record) return false

  return ['nodes', 'relationships', 'topics', 'pathways', 'comparisons', 'stacks', 'supernodes']
    .some((key) => Array.isArray(record[key]))
}

export type GraphNode = GraphRecord & {
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

export type GraphRelationship = GraphRecord & {
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

export type GraphEcosystem = GraphRecord & {
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

export type GraphCandidate = GraphRecord & {
  id?: string
  source?: string
  target?: string
  type?: string
  rationale?: string
  evidence_context?: string
  framing?: string
  weight?: string | number
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

const GRAPH_DIR = join(process.cwd(), 'public', 'data', 'graph')
const GRAPH_FILES = {
  nodes: 'nodes.json',
  relationships: 'relationships.json',
  topics: 'topics.json',
  pathways: 'pathways.json',
  comparisons: 'comparisons.json',
  stacks: 'stacks.json',
  supernodes: 'supernodes.json',
} as const

let graphCache: GraphRuntime | null = null

function asRecord(value: unknown): GraphRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as GraphRecord)
    : null
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

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function safeJsonArray(fileName: string): GraphRecord[] {
  try {
    const parsed = JSON.parse(readFileSync(join(GRAPH_DIR, fileName), 'utf8'))
    return Array.isArray(parsed) ? parsed.map(asRecord).filter(isPresent) : []
  } catch {
    return []
  }
}

function normalizeNode(value: unknown): GraphNode | null {
  const record = asRecord(value)
  if (!record) return null

  return {
    ...record,
    id: asText(record.id),
    slug: slugify(record.slug || record.id || record.name),
    name: asText(record.name),
    type: asText(record.type),
    aliases: unique(record.aliases),
    topics: unique(record.topics),
    pathways: unique(record.pathways),
    mechanisms: unique(record.mechanisms),
    effects: unique(record.effects),
    summary: asText(record.summary),
    retrieval_summary: asText(record.retrieval_summary),
  }
}

function normalizeRelationship(value: unknown): GraphRelationship | null {
  const record = asRecord(value)
  if (!record) return null

  return {
    ...record,
    id: asText(record.id),
    source: slugify(record.source),
    target: slugify(record.target),
    type: asText(record.type),
    weight: asText(record.weight) || 0,
    rationale: asText(record.rationale),
    evidence_context: asText(record.evidence_context),
    pathways: unique(record.pathways),
    mechanisms: unique(record.mechanisms),
    topics: unique(record.topics),
  }
}

function normalizeEcosystem(value: unknown): GraphEcosystem | null {
  const record = asRecord(value)
  if (!record) return null

  return {
    ...record,
    id: asText(record.id),
    slug: slugify(record.slug || record.id || record.name),
    name: asText(record.name),
    kind: asText(record.kind || record.type),
    summary: asText(record.summary),
    retrieval_summary: asText(record.retrieval_summary),
    anchors: unique(record.anchors),
    herbs: unique(record.herbs),
    compounds: unique(record.compounds),
    mechanisms: unique(record.mechanisms),
    pathways: unique(record.pathways),
    topics: unique(record.topics),
  }
}

function normalizeCandidate(value: unknown): GraphCandidate | null {
  const record = asRecord(value)
  if (!record) return null

  return {
    ...record,
    id: asText(record.id),
    source: slugify(record.source),
    target: slugify(record.target),
    type: asText(record.type),
    weight: asText(record.weight) || 0,
    rationale: asText(record.rationale),
    evidence_context: asText(record.evidence_context),
    framing: asText(record.framing),
    mechanism_overlap: unique(record.mechanism_overlap),
    pathway_overlap: unique(record.pathway_overlap),
    topic_overlap: unique(record.topic_overlap),
    mechanism_complementarity: unique(record.mechanism_complementarity),
    pathway_complementarity: unique(record.pathway_complementarity),
  }
}

function normalizeRows<T>(value: unknown, normalize: (row: unknown) => T | null): T[] {
  return Array.isArray(value) ? value.map(normalize).filter(isPresent) : []
}

export function normalizeGraphRuntime(graph: GraphInput): GraphRuntime {
  const source = asRecord(graph) || {}

  return {
    nodes: normalizeRows(source.nodes, normalizeNode),
    relationships: normalizeRows(source.relationships, normalizeRelationship),
    topics: normalizeRows(source.topics, normalizeEcosystem),
    pathways: normalizeRows(source.pathways, normalizeEcosystem),
    comparisons: normalizeRows(source.comparisons, normalizeCandidate),
    stacks: normalizeRows(source.stacks, normalizeCandidate),
    supernodes: normalizeRows(source.supernodes, normalizeEcosystem),
  }
}

export function loadRuntimeGraph(): GraphRuntime {
  if (graphCache) return graphCache

  graphCache = normalizeGraphRuntime({
    nodes: safeJsonArray(GRAPH_FILES.nodes),
    relationships: safeJsonArray(GRAPH_FILES.relationships),
    topics: safeJsonArray(GRAPH_FILES.topics),
    pathways: safeJsonArray(GRAPH_FILES.pathways),
    comparisons: safeJsonArray(GRAPH_FILES.comparisons),
    stacks: safeJsonArray(GRAPH_FILES.stacks),
    supernodes: safeJsonArray(GRAPH_FILES.supernodes),
  })

  return graphCache
}

function nodeKeys(node: GraphNode | null | undefined): string[] {
  if (!node) return []

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

function profileKeys(profile: GraphRecord | string | null | undefined): string[] {
  return typeof profile === 'string' ? [normalizeKey(profile)].filter(Boolean) : recordKeys(profile)
}

function getNodes(graph: GraphInput): GraphNode[] {
  return normalizeGraphRuntime(graph).nodes || []
}

function getRelationships(graph: GraphInput): GraphRelationship[] {
  return normalizeGraphRuntime(graph).relationships || []
}

function hasSharedItem(a: unknown, b: unknown): boolean {
  const left = new Set(asList(a).map(normalizeKey).filter(Boolean))
  if (!left.size) return false

  return asList(b)
    .map(normalizeKey)
    .some((key) => key && left.has(key))
}

function matchesProfile(node: GraphNode, profile: GraphRecord | string): boolean {
  const targetKeys = profileKeys(profile)
  if (!targetKeys.length) return false

  return nodeKeys(node).some((key) => targetKeys.includes(key))
}

function matchesSlug(value: unknown, profile: GraphRecord | string): boolean {
  const key = normalizeKey(value)
  if (!key) return false

  return profileKeys(profile).includes(key)
}

function byNameOrSlug<T extends { id?: string; slug?: string; name?: string }>(
  rows: T[] | undefined,
  key: string
): T | null {
  if (!Array.isArray(rows)) return null
  const normalized = normalizeKey(key)
  if (!normalized) return null

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

export function getGraphNode(profile: ProfileInput): GraphNode | null
export function getGraphNode(
  graph: GraphInput,
  profile: ProfileInput
): GraphNode | null
export function getGraphNode(
  graphOrProfile: GraphInput | ProfileInput,
  maybeProfile?: ProfileInput
): GraphNode | null {
  const { graph, profile } = resolveProfileArgs(graphOrProfile, maybeProfile)
  return getNodes(graph).find((node) => matchesProfile(node, profile)) || null
}

export function getRelatedProfiles(
  profile: ProfileInput,
  limit?: number
): GraphRelationship[]
export function getRelatedProfiles(
  graph: GraphInput,
  profile: ProfileInput,
  limit?: number
): GraphRelationship[]
export function getRelatedProfiles(
  graphOrProfile: GraphInput | ProfileInput,
  profileOrLimit?: ProfileInput | number,
  maybeLimit?: number
): GraphRelationship[] {
  const { graph, profile, limit = 8 } = resolveProfileArgs(
    graphOrProfile,
    profileOrLimit,
    maybeLimit
  )
  const node = getGraphNode(graph, profile)
  const keys = new Set([
    ...nodeKeys(node),
    ...profileKeys(profile),
  ].filter(Boolean))

  if (!keys.size) return []

  const direct = getRelationships(graph).filter(
    (relationship) =>
      keys.has(normalizeKey(relationship.source)) ||
      keys.has(normalizeKey(relationship.target))
  )

  const semanticFallback = node
    ? getNodes(graph)
        .filter((candidate) => !matchesProfile(candidate, node))
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

  return sortCandidates([...direct, ...semanticFallback]).slice(0, Math.max(0, limit))
}

export function getTopicEcosystem(topic: string): GraphEcosystem | null
export function getTopicEcosystem(
  graph: GraphInput,
  topic: string
): GraphEcosystem | null
export function getTopicEcosystem(
  graphOrTopic: GraphInput | string,
  maybeTopic?: string
): GraphEcosystem | null {
  const { graph, key } = resolveEcosystemArgs(graphOrTopic, maybeTopic)
  return byNameOrSlug(graph.topics, key)
}

export function getPathwayEcosystem(pathway: string): GraphEcosystem | null
export function getPathwayEcosystem(
  graph: GraphInput,
  pathway: string
): GraphEcosystem | null
export function getPathwayEcosystem(
  graphOrPathway: GraphInput | string,
  maybePathway?: string
): GraphEcosystem | null {
  const { graph, key } = resolveEcosystemArgs(graphOrPathway, maybePathway)
  return byNameOrSlug(graph.pathways, key)
}

export function getComparisonCandidates(
  profile: ProfileInput,
  limit?: number
): GraphCandidate[]
export function getComparisonCandidates(
  graph: GraphInput,
  profile: ProfileInput,
  limit?: number
): GraphCandidate[]
export function getComparisonCandidates(
  graphOrProfile: GraphInput | ProfileInput,
  profileOrLimit?: ProfileInput | number,
  maybeLimit?: number
): GraphCandidate[] {
  const { graph, profile, limit = 8 } = resolveProfileArgs(
    graphOrProfile,
    profileOrLimit,
    maybeLimit
  )
  const comparisons = graph.comparisons || []

  return sortCandidates(
    comparisons.filter(
      (candidate) =>
        matchesSlug(candidate.source, profile) || matchesSlug(candidate.target, profile)
    )
  ).slice(0, Math.max(0, limit))
}

export function getStackCandidates(
  profile: ProfileInput,
  limit?: number
): GraphCandidate[]
export function getStackCandidates(
  graph: GraphInput,
  profile: ProfileInput,
  limit?: number
): GraphCandidate[]
export function getStackCandidates(
  graphOrProfile: GraphInput | ProfileInput,
  profileOrLimit?: ProfileInput | number,
  maybeLimit?: number
): GraphCandidate[] {
  const { graph, profile, limit = 8 } = resolveProfileArgs(
    graphOrProfile,
    profileOrLimit,
    maybeLimit
  )
  const stacks = graph.stacks || []

  return sortCandidates(
    stacks.filter(
      (candidate) =>
        matchesSlug(candidate.source, profile) || matchesSlug(candidate.target, profile)
    )
  ).slice(0, Math.max(0, limit))
}

export function getAuthoritySupernodes(limit?: number): GraphEcosystem[]
export function getAuthoritySupernodes(
  profile?: ProfileInput,
  limit?: number
): GraphEcosystem[]
export function getAuthoritySupernodes(
  graph: GraphInput,
  profile?: ProfileInput,
  limit?: number
): GraphEcosystem[]
export function getAuthoritySupernodes(
  graphOrProfileOrLimit?: GraphInput | ProfileInput | number,
  profileOrLimit?: ProfileInput | number,
  maybeLimit?: number
): GraphEcosystem[] {
  const graphOnly = isGraphLike(graphOrProfileOrLimit) && profileOrLimit === undefined
  const graphWithProfile =
    isGraphLike(graphOrProfileOrLimit) &&
    (typeof profileOrLimit === 'string' || asRecord(profileOrLimit) || maybeLimit !== undefined)
  const graph = graphOnly || graphWithProfile
    ? normalizeGraphRuntime(graphOrProfileOrLimit as GraphInput)
    : loadRuntimeGraph()
  const profile = graphWithProfile
    ? (profileOrLimit as ProfileInput | undefined)
    : typeof graphOrProfileOrLimit === 'string' || asRecord(graphOrProfileOrLimit)
      ? (graphOrProfileOrLimit as ProfileInput)
      : undefined
  const limit = typeof graphOrProfileOrLimit === 'number'
    ? graphOrProfileOrLimit
    : typeof profileOrLimit === 'number'
      ? profileOrLimit
      : maybeLimit ?? 12
  const supernodes = graph.supernodes || []

  if (!profile) return supernodes.slice(0, Math.max(0, limit))

  const keys = profileKeys(profile)
  if (!keys.length) return []

  return supernodes
    .filter((supernode) =>
      [
        supernode.id,
        supernode.slug,
        supernode.name,
        ...(Array.isArray(supernode.anchors) ? supernode.anchors : []),
      ]
        .map(normalizeKey)
        .some((key) => keys.includes(key))
    )
    .slice(0, Math.max(0, limit))
}

export function getEcosystemsForProfile(
  graph: GraphInput,
  profile: GraphRecord | string
): { topics: GraphEcosystem[]; pathways: GraphEcosystem[] } {
  const normalizedGraph = normalizeGraphRuntime(graph)
  const node = getGraphNode(normalizedGraph, profile)
  const keys = profileKeys(profile)

  const topics = (normalizedGraph.topics || []).filter(
    (topic) =>
      hasSharedItem(topic.topics, node?.topics) ||
      asList(topic.anchors).map(normalizeKey).some((key) => keys.includes(key)) ||
      asList(topic.herbs).map(normalizeKey).some((key) => keys.includes(key)) ||
      asList(topic.compounds).map(normalizeKey).some((key) => keys.includes(key))
  )

  const pathways = (normalizedGraph.pathways || []).filter(
    (pathway) =>
      hasSharedItem(pathway.pathways, node?.pathways) ||
      asList(pathway.anchors).map(normalizeKey).some((key) => keys.includes(key)) ||
      asList(pathway.herbs).map(normalizeKey).some((key) => keys.includes(key)) ||
      asList(pathway.compounds).map(normalizeKey).some((key) => keys.includes(key))
  )

  return { topics, pathways }
}
