export type GraphNodeType = 'herb' | 'compound' | 'stack'

export type GraphRelationshipType =
  | 'pathway-overlap'
  | 'semantic-overlap'
  | 'ecosystem-continuity'
  | 'authority-hub'
  | 'biological-adjacency'
  | 'semantic-comparison'
  | 'relationship-overlap'

export type EvidenceTier =
  | 'Strong Human Evidence'
  | 'Moderate Human Evidence'
  | 'Limited Human Evidence'
  | 'Mechanistic Evidence'
  | 'Evidence-Limited'
  | 'Traditional Use Context'
  | 'Preliminary Evidence'

export type AuthorityRole =
  | 'core-anchor'
  | 'synergy-partner'
  | 'secondary-support'
  | 'regulatory-hub'
  | 'constituent-driver'
  | 'accessory-agent'
  | 'Topic Hub'
  | 'Authority Supernode'
  | 'Supporting Node'
  | 'Long-tail Node'

export type GraphRecord = Record<string, unknown>

export type GraphNode = GraphRecord & {
  id: string
  slug: string
  name: string
  type: GraphNodeType
  aliases?: string[]
  topics?: string[]
  pathways?: string[]
  mechanisms?: string[]
  effects?: string[]
  evidence_tier?: EvidenceTier
  graph_score?: number
  centrality_score?: number
  authority_role?: AuthorityRole
  sparse_profile?: boolean
  safety_flags?: string[]
  summary?: string
  retrieval_summary?: string
  sparse_recovery?: boolean
}

export type GraphRelationship = GraphRecord & {
  id: string
  source: string
  target: string
  type: GraphRelationshipType
  weight: number
  rationale: string
  evidence_context?: string
  pathways?: string[]
  mechanisms?: string[]
  topics?: string[]
}

export type GraphEcosystem = GraphRecord & {
  id: string
  slug: string
  name: string
  kind: string
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
  graph_score?: number
  relationship_density?: number
}

export type GraphCandidate = GraphRecord & {
  id: string
  source: string
  target: string
  type: string
  rationale: string
  evidence_context?: string
  framing?: string
  weight: number
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
