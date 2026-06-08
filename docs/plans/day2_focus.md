# Day 2: Phase 1 Knowledge Graph Sprint

Primary Directive: Implement a typed knowledge graph schema, relationship normalization, cross-entity linking, canonical taxonomy, entity integrity validation, graph utilities, compare/group support, mechanism/effect/pathway relational modeling, runtime-safe graph exports, and deterministic schema generation.

## Plan Summary & Task Checklist

### Task 1: Canonical Graph Type Schema
- **File**: `src/types/graph.ts` [NEW]
- **Goal**: Export canonical graph type schema (`GraphNodeType`, `GraphRelationshipType`, `EvidenceTier`, `AuthorityRole`, `GraphNode`, `GraphRelationship`, `GraphEcosystem`, `GraphCandidate`, `GraphRuntime`).

### Task 2: Normalize Graph Relationship Type Constants
- **File**: `lib/graph-relationship-types.ts` [NEW]
- **Goal**: Define `RELATIONSHIP_TYPES` and `RelationshipType` enum/const. Update references in `lib/runtime-graph.ts` if needed.

### Task 3: Entity Integrity Validator
- **File**: `lib/graph-integrity.ts` [NEW], `src/lib/__tests__/graph-integrity.test.ts` [NEW]
- **Goal**: Implement `validateGraphIntegrity` to check endpoints, duplicates, missing required fields.

### Task 4: Canonical Mechanism Taxonomy
- **File**: `lib/canonical-mechanisms.ts` [NEW], `src/lib/__tests__/canonical-mechanisms.test.ts` [NEW]
- **Goal**: Implement mechanism normalization and clustering maps. Export JSON mapping if needed.

### Task 5: Cross-Entity Link Resolver
- **File**: `lib/graph-links.ts` [NEW], `src/lib/__tests__/graph-links.test.ts` [NEW]
- **Goal**: Implement `getEntityLinks` for resolving all links (related, comparisons, stacks, ecosystems, supernodes) for a slug.

### Task 6: Graph Query Utilities
- **File**: `lib/graph-query.ts` [NEW], `src/lib/__tests__/graph-query.test.ts` [NEW]
- **Goal**: Implement `getNodesByPathway`, `getNodesByMechanism`, `getNodesByTopic`, `getCompareGroup`, `getNHopNeighbors`.

### Task 7: Runtime Export Validation Script
- **File**: `scripts/validate-graph-export.mjs` [NEW]
- **Goal**: Build-time Node.js script validating export files in `public/data/graph/`.

### Task 8: Handoff Documentation
- **File**: `docs/plans/handoff_notes.md` [NEW]
- **Goal**: Write comprehensive handoff notes.
