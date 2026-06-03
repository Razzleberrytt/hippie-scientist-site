import type { GraphRelationshipType } from '../src/types/graph'

export const RELATIONSHIP_TYPES = {
  PATHWAY_OVERLAP: 'pathway-overlap',
  SEMANTIC_OVERLAP: 'semantic-overlap',
  ECOSYSTEM_CONTINUITY: 'ecosystem-continuity',
  AUTHORITY_HUB: 'authority-hub',
  BIOLOGICAL_ADJACENCY: 'biological-adjacency',
  SEMANTIC_COMPARISON: 'semantic-comparison',
  RELATIONSHIP_OVERLAP: 'relationship-overlap',
} as const

export type RelationshipType = typeof RELATIONSHIP_TYPES[keyof typeof RELATIONSHIP_TYPES]

// Ensure RelationshipType is compatible with GraphRelationshipType
const _assert: GraphRelationshipType = {} as RelationshipType
