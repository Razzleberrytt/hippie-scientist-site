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
  ecosystem_overlap?: string[]
  safety_gate?: string
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

const MAX_RELATED_PROFILES = 12
const MAX_COMPARISON_CANDIDATES = 8
const MAX_STACK_CANDIDATES = 6
const MAX_PATHWAY_COMPANIONS = 10

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
    ecosystem_overlap: unique(record.ecosystem_overlap || record.ecosystems || record.topics),
    safety_gate: asText(record.safety_gate),
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

function sharedItems(a: unknown, b: unknown): string[] {
  const left = new Set(asList(a).map(normalizeKey).filter(Boolean))
  if (!left.size) return []

  return unique(
    asList(b).filter((value) => {
      const key = normalizeKey(value)
      return key && left.has(key)
    })
  )
}

function hasSharedItem(a: unknown, b: unknown): boolean {
  return sharedItems(a, b).length > 0
}

function clampLimit(limit: number | undefined, fallback: number, max: number): number {
  const value = Number(limit ?? fallback)
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(0, value))
}

function otherEndpoint(
  edge: GraphRelationship | GraphCandidate,
  keys: Set<string>
): string {
  const source = normalizeKey(edge.source)
  const target = normalizeKey(edge.target)

  if (source && keys.has(source) && target && !keys.has(target)) return target
  if (target && keys.has(target) && source && !keys.has(source)) return source
  return ''
}

function dedupeByOtherEndpoint<T extends GraphCandidate | GraphRelationship>(
  rows: T[],
  keys: Set<string>
): T[] {
  const seen = new Set<string>()

  return rows.filter((row) => {
    const endpoint = otherEndpoint(row, keys)
    if (!endpoint || seen.has(endpoint)) return false
    seen.add(endpoint)
    return true
  })
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


function relationshipToCandidate(
  relationship: GraphRelationship,
  type = relationship.type || 'relationship-overlap'
): GraphCandidate {
  return {
    id: relationship.id,
    source: relationship.source,
    target: relationship.target,
    type,
    weight: relationship.weight,
    rationale: relationship.rationale || 'Shared mechanism, pathway, or ecosystem context; frame as a comparison prompt rather than an outcome claim.',
    evidence_context: relationship.evidence_context,
    mechanism_overlap: unique(relationship.mechanisms),
    pathway_overlap: unique(relationship.pathways),
    topic_overlap: unique(relationship.topics),
    ecosystem_overlap: unique(relationship.topics),
  }
}

function nodeComparisonFallback(graph: GraphRuntime, node: GraphNode | null, keys: Set<string>): GraphCandidate[] {
  if (!node) return []

  return getNodes(graph)
    .filter((candidate) => !matchesProfile(candidate, node))
    .map((candidate) => {
      const mechanisms = sharedItems(node.mechanisms, candidate.mechanisms)
      const pathways = sharedItems(node.pathways, candidate.pathways)
      const topics = sharedItems(node.topics, candidate.topics)
      const overlapScore = mechanisms.length * 3 + pathways.length * 2 + topics.length

      return {
        id: `${node.slug || node.id}-compare-${candidate.slug || candidate.id}`,
        source: node.slug || node.id,
        target: candidate.slug || candidate.id,
        type: 'semantic-comparison',
        weight: overlapScore,
        rationale: 'Semantic comparison candidate based on shared mechanisms, pathways, or ecosystem context; not an efficacy or superiority claim.',
        evidence_context: 'Evidence context should be read from each profile before interpretation.',
        mechanism_overlap: mechanisms,
        pathway_overlap: pathways,
        topic_overlap: topics,
        ecosystem_overlap: topics,
      }
    })
    .filter((candidate) => {
      if (!otherEndpoint(candidate, keys)) return false
      return asList(candidate.mechanism_overlap).length > 0 ||
        asList(candidate.pathway_overlap).length > 0 ||
        asList(candidate.topic_overlap).length >= 2
    })
}

function nodeStackFallback(graph: GraphRuntime, node: GraphNode | null, keys: Set<string>): GraphCandidate[] {
  if (!node) return []

  return getNodes(graph)
    .filter((candidate) => !matchesProfile(candidate, node))
    .map((candidate) => {
      const mechanisms = sharedItems(node.mechanisms, candidate.mechanisms)
      const pathways = sharedItems(node.pathways, candidate.pathways)
      const topics = sharedItems(node.topics, candidate.topics)
      const overlapScore = mechanisms.length * 2 + pathways.length * 2 + topics.length

      return {
        id: `${node.slug || node.id}-stack-${candidate.slug || candidate.id}`,
        source: node.slug || node.id,
        target: candidate.slug || candidate.id,
        type: 'biological-adjacency',
        weight: overlapScore,
        rationale: 'Biologically adjacent research candidate; use only as exploratory education context, not stack advice.',
        framing: topics.join('; '),
        evidence_context: 'Exploratory graph context; review profile-specific evidence and safety notes.',
        mechanism_complementarity: mechanisms,
        pathway_complementarity: pathways,
        topic_overlap: topics,
        ecosystem_overlap: topics,
        safety_gate: 'review safety context before combining',
      }
    })
    .filter((candidate) => {
      if (!otherEndpoint(candidate, keys)) return false
      const mechanismCount = asList(candidate.mechanism_complementarity).length
      const pathwayCount = asList(candidate.pathway_complementarity).length
      const topicCount = asList(candidate.topic_overlap).length

      return mechanismCount >= 2 || pathwayCount >= 2 || (mechanismCount + pathwayCount >= 2 && topicCount > 0)
    })
}

function candidateScore(candidate: GraphCandidate | GraphRelationship): number {
  const weight = Number(asText(candidate.weight))
  const rationale = asText(candidate.rationale)
  const mechanisms = asList((candidate as GraphRelationship).mechanisms || (candidate as GraphCandidate).mechanism_overlap).length
  const pathways = asList((candidate as GraphRelationship).pathways || (candidate as GraphCandidate).pathway_overlap).length
  const topics = asList((candidate as GraphRelationship).topics || (candidate as GraphCandidate).topic_overlap).length
  const ecosystems = asList((candidate as GraphCandidate).ecosystem_overlap).length
  const complementaryMechanisms = asList((candidate as GraphCandidate).mechanism_complementarity).length
  const complementaryPathways = asList((candidate as GraphCandidate).pathway_complementarity).length

  return (Number.isFinite(weight) ? weight : 0) +
    mechanisms * 3 +
    pathways * 2 +
    topics +
    ecosystems +
    complementaryMechanisms * 2 +
    complementaryPathways +
    (rationale ? 1 : 0)
}

function candidateSortKey(candidate: GraphCandidate | GraphRelationship): string {
  return [candidate.source, candidate.target, candidate.id, candidate.type]
    .map(asLowerText)
    .join('|')
}

function sortCandidates<T extends GraphCandidate | GraphRelationship>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const scoreDelta = candidateScore(b) - candidateScore(a)
    if (scoreDelta !== 0) return scoreDelta
    return candidateSortKey(a).localeCompare(candidateSortKey(b))
  })
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
      otherEndpoint(relationship, keys) &&
      (keys.has(normalizeKey(relationship.source)) ||
        keys.has(normalizeKey(relationship.target)))
  )

  const semanticFallback = node
    ? getNodes(graph)
        .filter((candidate) => !matchesProfile(candidate, node))
        .map((candidate) => {
          const mechanisms = sharedItems(node.mechanisms, candidate.mechanisms)
          const pathways = sharedItems(node.pathways, candidate.pathways)
          const topics = sharedItems(node.topics, candidate.topics)
          const overlapScore = mechanisms.length * 3 + pathways.length * 2 + topics.length

          return {
            id: `${node.slug || node.id}-${candidate.slug || candidate.id}`,
            source: node.slug || node.id,
            target: candidate.slug || candidate.id,
            type: 'semantic-overlap',
            weight: overlapScore,
            rationale: 'Related by shared mechanisms, pathways, or topic ecosystem context.',
            mechanisms,
            pathways,
            topics,
          }
        })
        .filter((candidate) => {
          const mechanismCount = asList(candidate.mechanisms).length
          const pathwayCount = asList(candidate.pathways).length
          const topicCount = asList(candidate.topics).length

          return mechanismCount > 0 || pathwayCount > 0 || topicCount >= 2
        })
    : []

  return dedupeByOtherEndpoint(
    sortCandidates([...direct, ...semanticFallback]),
    keys
  ).slice(0, clampLimit(limit, 8, MAX_RELATED_PROFILES))
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
  const node = getGraphNode(graph, profile)
  const keys = new Set([
    ...nodeKeys(node),
    ...profileKeys(profile),
  ].filter(Boolean))

  if (!keys.size) return []

  const explicit = (graph.comparisons || []).filter(
    (candidate) =>
      otherEndpoint(candidate, keys) &&
      (keys.has(normalizeKey(candidate.source)) || keys.has(normalizeKey(candidate.target)))
  )

  const relationshipFallback = getRelationships(graph)
    .filter((relationship) =>
      otherEndpoint(relationship, keys) &&
      (keys.has(normalizeKey(relationship.source)) || keys.has(normalizeKey(relationship.target))) &&
      (asList(relationship.mechanisms).length > 0 || asList(relationship.pathways).length > 0 || asList(relationship.topics).length >= 2)
    )
    .map((relationship) => relationshipToCandidate(relationship, 'relationship-overlap'))

  return dedupeByOtherEndpoint(
    sortCandidates([
      ...explicit,
      ...relationshipFallback,
      ...nodeComparisonFallback(graph, node, keys),
    ]),
    keys
  ).slice(0, clampLimit(limit, 8, MAX_COMPARISON_CANDIDATES))
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
  const node = getGraphNode(graph, profile)
  const keys = new Set([
    ...nodeKeys(node),
    ...profileKeys(profile),
  ].filter(Boolean))

  if (!keys.size) return []

  const explicit = (graph.stacks || []).filter(
    (candidate) =>
      otherEndpoint(candidate, keys) &&
      (keys.has(normalizeKey(candidate.source)) || keys.has(normalizeKey(candidate.target))) &&
      (asList(candidate.mechanism_complementarity).length > 0 || asList(candidate.pathway_complementarity).length > 0)
  )

  const relationshipFallback = getRelationships(graph)
    .filter((relationship) =>
      otherEndpoint(relationship, keys) &&
      (keys.has(normalizeKey(relationship.source)) || keys.has(normalizeKey(relationship.target))) &&
      (asList(relationship.mechanisms).length >= 2 || asList(relationship.pathways).length >= 2)
    )
    .map((relationship) => ({
      ...relationshipToCandidate(relationship, 'biological-adjacency'),
      rationale: 'Biologically adjacent research candidate; use only as exploratory education context, not stack advice.',
      mechanism_complementarity: unique(relationship.mechanisms),
      pathway_complementarity: unique(relationship.pathways),
      safety_gate: 'review safety context before combining',
    }))

  return dedupeByOtherEndpoint(
    sortCandidates([
      ...explicit,
      ...relationshipFallback,
      ...nodeStackFallback(graph, node, keys),
    ]),
    keys
  ).slice(0, clampLimit(limit, 6, MAX_STACK_CANDIDATES))
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

  if (!profile) return supernodes.slice(0, clampLimit(limit, 12, MAX_RELATED_PROFILES))

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
    .slice(0, clampLimit(limit, 12, MAX_RELATED_PROFILES))
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

  return {
    topics: topics.slice(0, MAX_PATHWAY_COMPANIONS),
    pathways: pathways.slice(0, MAX_PATHWAY_COMPANIONS),
  }
}
