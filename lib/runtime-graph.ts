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
  companions?: string[]
  related_pathways?: string[]
  profile_type?: string
  graph_score?: string | number
  relationship_density?: string | number
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
  __normalized?: boolean
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
const MAX_ECOSYSTEM_SUGGESTIONS = 10
const MAX_AUTHORITY_HUBS = 6

let graphCache: GraphRuntime | null = null
const relatedProfilesCache = new Map<string, GraphRelationship[]>()
const comparisonCandidatesCache = new Map<string, GraphCandidate[]>()
const stackCandidatesCache = new Map<string, GraphCandidate[]>()

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
    companions: unique(record.companions),
    related_pathways: unique(record.related_pathways || record.relatedPathways),
    profile_type: asText(record.profile_type || record.profileType),
    graph_score: asText(record.graph_score || record.graphScore) || 0,
    relationship_density: asText(record.relationship_density || record.relationshipDensity) || 0,
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

  if (source.__normalized) return source as GraphRuntime

  return {
    __normalized: true,
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

function profileCacheKey(kind: string, profile: ProfileInput, limit: number | undefined): string {
  return [kind, clampLimit(limit, 8, MAX_RELATED_PROFILES), ...profileKeys(profile)].join('|')
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


function numericSignal(value: unknown): number {
  const numeric = Number(asText(value))
  return Number.isFinite(numeric) ? numeric : 0
}

function ecosystemEntityKeys(ecosystem: GraphEcosystem | null | undefined): string[] {
  if (!ecosystem) return []

  return unique([
    ...(Array.isArray(ecosystem.anchors) ? ecosystem.anchors : []),
    ...(Array.isArray(ecosystem.herbs) ? ecosystem.herbs : []),
    ...(Array.isArray(ecosystem.compounds) ? ecosystem.compounds : []),
    ...(Array.isArray(ecosystem.companions) ? ecosystem.companions : []),
  ]).map(normalizeKey)
}

function ecosystemKeys(ecosystem: GraphEcosystem | null | undefined): string[] {
  if (!ecosystem) return []

  return unique([
    ecosystem.id,
    ecosystem.slug,
    ecosystem.name,
    ...(Array.isArray(ecosystem.topics) ? ecosystem.topics : []),
    ...(Array.isArray(ecosystem.pathways) ? ecosystem.pathways : []),
  ]).map(normalizeKey)
}

function ecosystemMatchScore(
  ecosystem: GraphEcosystem,
  node: GraphNode | null,
  keys: string[],
  relationshipSignals: { topics: string[]; pathways: string[]; mechanisms: string[] } = { topics: [], pathways: [], mechanisms: [] }
): number {
  const normalizedKeys = new Set(keys.map(normalizeKey).filter(Boolean))
  const directEntityMatch = ecosystemEntityKeys(ecosystem).some((key) => normalizedKeys.has(key)) ? 8 : 0
  const directNameMatch = ecosystemKeys(ecosystem).some((key) => normalizedKeys.has(key)) ? 6 : 0
  const topicOverlap = sharedItems(ecosystem.topics, [...(node?.topics || []), ...relationshipSignals.topics]).length
  const pathwayOverlap = sharedItems(ecosystem.pathways, [...(node?.pathways || []), ...relationshipSignals.pathways]).length
  const mechanismOverlap = sharedItems(ecosystem.mechanisms, [...(node?.mechanisms || []), ...relationshipSignals.mechanisms]).length

  return directEntityMatch +
    directNameMatch +
    topicOverlap * 3 +
    pathwayOverlap * 3 +
    mechanismOverlap * 2 +
    Math.min(numericSignal(ecosystem.relationship_density) / 25, 4) +
    Math.min(numericSignal(ecosystem.graph_score) / 50, 2)
}

function ecosystemSortKey(ecosystem: GraphEcosystem): string {
  return [ecosystem.kind, ecosystem.name, ecosystem.slug, ecosystem.id]
    .map(asLowerText)
    .join('|')
}

function sortEcosystems<T extends GraphEcosystem>(rows: T[], score: (row: T) => number): T[] {
  return [...rows].sort((a, b) => {
    const scoreDelta = score(b) - score(a)
    if (scoreDelta !== 0) return scoreDelta
    return ecosystemSortKey(a).localeCompare(ecosystemSortKey(b))
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

  const canUseCache = !isGraphLike(graphOrProfile)
  const cacheKey = profileCacheKey('related', profile, limit)
  if (canUseCache && relatedProfilesCache.has(cacheKey)) {
    return [...(relatedProfilesCache.get(cacheKey) || [])]
  }

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

  const ecosystemFallback = getEcosystemsForProfile(graph, profile)
    .topics
    .slice(0, 3)
    .flatMap((ecosystem) =>
      unique([
        ...(ecosystem.anchors || []),
        ...(ecosystem.herbs || []),
        ...(ecosystem.compounds || []),
      ])
        .map(normalizeKey)
        .filter((slug) => slug && !keys.has(slug))
        .slice(0, 4)
        .map((slug) => ({
          id: `${node?.slug || profileKeys(profile)[0]}-${ecosystem.slug || ecosystem.id}-${slug}`,
          source: node?.slug || profileKeys(profile)[0],
          target: slug,
          type: 'ecosystem-continuity',
          weight: 20 + sharedItems(ecosystem.topics, node?.topics).length * 3 + sharedItems(ecosystem.pathways, node?.pathways).length * 2,
          rationale: 'Related by topic ecosystem continuity; use as contextual discovery rather than outcome equivalence.',
          evidence_context: ecosystem.retrieval_summary,
          mechanisms: unique(ecosystem.mechanisms).slice(0, 6),
          pathways: unique(ecosystem.pathways).slice(0, 6),
          topics: unique([ecosystem.name, ...(ecosystem.topics || [])]).slice(0, 6),
        }))
    )

  const authorityFallback = getAuthoritySupernodes(graph, profile, MAX_AUTHORITY_HUBS)
    .map((supernode) => ({
      id: `${node?.slug || profileKeys(profile)[0]}-authority-${supernode.slug || supernode.id}`,
      source: node?.slug || profileKeys(profile)[0],
      target: supernode.slug || supernode.id,
      type: 'authority-hub',
      weight: 30 + numericSignal(supernode.relationship_density),
      rationale: 'Authority hub with dense relationship coverage for nearby topics and pathways; evidence tier should control interpretation.',
      evidence_context: supernode.retrieval_summary,
      mechanisms: unique(supernode.mechanisms).slice(0, 6),
      pathways: unique(supernode.pathways).slice(0, 6),
      topics: unique(supernode.topics).slice(0, 6),
    }))

  const results = dedupeByOtherEndpoint(
    sortCandidates([...direct, ...semanticFallback, ...ecosystemFallback, ...authorityFallback]),
    keys
  ).slice(0, clampLimit(limit, 8, MAX_RELATED_PROFILES))

  if (canUseCache) relatedProfilesCache.set(cacheKey, results)
  return [...results]
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

  const canUseCache = !isGraphLike(graphOrProfile)
  const cacheKey = profileCacheKey('comparison', profile, limit)
  if (canUseCache && comparisonCandidatesCache.has(cacheKey)) {
    return [...(comparisonCandidatesCache.get(cacheKey) || [])]
  }

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

  const results = dedupeByOtherEndpoint(
    sortCandidates([
      ...explicit,
      ...relationshipFallback,
      ...nodeComparisonFallback(graph, node, keys),
    ]),
    keys
  ).slice(0, clampLimit(limit, 8, MAX_COMPARISON_CANDIDATES))

  if (canUseCache) comparisonCandidatesCache.set(cacheKey, results)
  return [...results]
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

  const canUseCache = !isGraphLike(graphOrProfile)
  const cacheKey = profileCacheKey('stack', profile, limit)
  if (canUseCache && stackCandidatesCache.has(cacheKey)) {
    return [...(stackCandidatesCache.get(cacheKey) || [])]
  }

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

  const results = dedupeByOtherEndpoint(
    sortCandidates([
      ...explicit,
      ...relationshipFallback,
      ...nodeStackFallback(graph, node, keys),
    ]),
    keys
  ).slice(0, clampLimit(limit, 6, MAX_STACK_CANDIDATES))

  if (canUseCache) stackCandidatesCache.set(cacheKey, results)
  return [...results]
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
      : maybeLimit ?? MAX_AUTHORITY_HUBS
  const requestedLimit = clampLimit(limit, MAX_AUTHORITY_HUBS, MAX_AUTHORITY_HUBS)
  const supernodes = graph.supernodes || []

  if (!profile) {
    return sortEcosystems(supernodes, (supernode) =>
      numericSignal(supernode.graph_score) + numericSignal(supernode.relationship_density)
    ).slice(0, requestedLimit)
  }

  const node = getGraphNode(graph, profile)
  const keys = unique([...nodeKeys(node), ...profileKeys(profile)]).filter(Boolean)
  if (!keys.length) return []

  const relationshipSignals = { topics: [], pathways: [], mechanisms: [] }
  const keySet = new Set(keys.map(normalizeKey).filter(Boolean))

  return sortEcosystems(
    supernodes.filter((supernode) => {
      const selfMatch = [supernode.id, supernode.slug, supernode.name]
        .map(normalizeKey)
        .some((key) => keySet.has(key))
      if (selfMatch) return false

      return ecosystemMatchScore(supernode, node, keys, relationshipSignals) >= 5
    }),
    (supernode) => ecosystemMatchScore(supernode, node, keys, relationshipSignals)
  ).slice(0, requestedLimit)
}

export function getEcosystemsForProfile(
  profile: GraphRecord | string
): { topics: GraphEcosystem[]; pathways: GraphEcosystem[] }
export function getEcosystemsForProfile(
  graph: GraphInput,
  profile: GraphRecord | string
): { topics: GraphEcosystem[]; pathways: GraphEcosystem[] }
export function getEcosystemsForProfile(
  graphOrProfile: GraphInput | GraphRecord | string,
  maybeProfile?: GraphRecord | string
): { topics: GraphEcosystem[]; pathways: GraphEcosystem[] } {
  const { graph, profile } = resolveProfileArgs(graphOrProfile, maybeProfile)
  const node = getGraphNode(graph, profile)
  const keys = unique([...nodeKeys(node), ...profileKeys(profile)]).filter(Boolean)
  if (!keys.length) return { topics: [], pathways: [] }

  const relationshipSignals = { topics: [], pathways: [], mechanisms: [] }
  const scoredTopics = sortEcosystems(
    (graph.topics || []).filter((topic) => ecosystemMatchScore(topic, node, keys, relationshipSignals) > 0),
    (topic) => ecosystemMatchScore(topic, node, keys, relationshipSignals)
  )
  const scoredPathways = sortEcosystems(
    (graph.pathways || []).filter((pathway) => ecosystemMatchScore(pathway, node, keys, relationshipSignals) > 0),
    (pathway) => ecosystemMatchScore(pathway, node, keys, relationshipSignals)
  )

  return {
    topics: scoredTopics.slice(0, MAX_ECOSYSTEM_SUGGESTIONS),
    pathways: scoredPathways.slice(0, MAX_ECOSYSTEM_SUGGESTIONS),
  }
}

export function getPathwayCompanions(pathway: string, limit?: number): string[]
export function getPathwayCompanions(graph: GraphInput, pathway: string, limit?: number): string[]
export function getPathwayCompanions(
  graphOrPathway: GraphInput | string,
  pathwayOrLimit?: string | number,
  maybeLimit?: number
): string[] {
  const { graph, key } = resolveEcosystemArgs(
    graphOrPathway,
    typeof pathwayOrLimit === 'string' ? pathwayOrLimit : undefined
  )
  const limit = typeof pathwayOrLimit === 'number' ? pathwayOrLimit : maybeLimit
  const ecosystem = getPathwayEcosystem(graph, key)
  const companions = unique([
    ...(ecosystem?.companions || []),
    ...(ecosystem?.anchors || []),
    ...(ecosystem?.herbs || []),
    ...(ecosystem?.compounds || []),
  ])

  return companions
    .map(normalizeKey)
    .filter(Boolean)
    .filter((slug) => slug !== normalizeKey(key))
    .slice(0, clampLimit(limit, MAX_PATHWAY_COMPANIONS, MAX_PATHWAY_COMPANIONS))
}

export function getRelatedEcosystemTraversal(ecosystem: string, limit?: number): GraphEcosystem[]
export function getRelatedEcosystemTraversal(graph: GraphInput, ecosystem: string, limit?: number): GraphEcosystem[]
export function getRelatedEcosystemTraversal(
  graphOrEcosystem: GraphInput | string,
  ecosystemOrLimit?: string | number,
  maybeLimit?: number
): GraphEcosystem[] {
  const { graph, key } = resolveEcosystemArgs(
    graphOrEcosystem,
    typeof ecosystemOrLimit === 'string' ? ecosystemOrLimit : undefined
  )
  const limit = typeof ecosystemOrLimit === 'number' ? ecosystemOrLimit : maybeLimit
  const source = getTopicEcosystem(graph, key) || getPathwayEcosystem(graph, key)
  if (!source) return []

  const sourceKeys = new Set(ecosystemKeys(source).filter(Boolean))
  const rows = [...(graph.topics || []), ...(graph.pathways || [])].filter((candidate) => {
    const candidateKey = normalizeKey(candidate.slug || candidate.id || candidate.name)
    if (!candidateKey || sourceKeys.has(candidateKey)) return false

    return hasSharedItem(source.topics, candidate.topics) ||
      hasSharedItem(source.pathways, candidate.pathways) ||
      hasSharedItem(source.mechanisms, candidate.mechanisms) ||
      hasSharedItem(source.related_pathways, [candidate.name, candidate.slug, candidate.id])
  })

  return sortEcosystems(rows, (candidate) =>
    sharedItems(source.topics, candidate.topics).length * 3 +
    sharedItems(source.pathways, candidate.pathways).length * 3 +
    sharedItems(source.mechanisms, candidate.mechanisms).length * 2 +
    sharedItems(source.related_pathways, [candidate.name, candidate.slug, candidate.id]).length * 4
  ).slice(0, clampLimit(limit, MAX_ECOSYSTEM_SUGGESTIONS, MAX_ECOSYSTEM_SUGGESTIONS))
}
