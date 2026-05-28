import type { GraphRuntime, GraphNode, GraphRelationship } from '../src/types/graph'

export type IntegrityError = {
  code: string
  message: string
  entityId?: string
}

export type IntegrityWarning = {
  code: string
  message: string
  entityId?: string
}

export type GraphStats = {
  nodeCount: number
  relationshipCount: number
  topicCount: number
  pathwayCount: number
  comparisonCount: number
  stackCount: number
  supernodeCount: number
}

export type IntegrityReport = {
  valid: boolean
  errors: IntegrityError[]
  warnings: IntegrityWarning[]
  stats: GraphStats
}

const VALID_EVIDENCE_TIERS = new Set([
  'Strong Human Evidence',
  'Moderate Human Evidence',
  'Limited Human Evidence',
  'Mechanistic Evidence',
  'Evidence-Limited',
  'Traditional Use Context',
  'Preliminary Evidence',
])

const VALID_AUTHORITY_ROLES = new Set([
  'core-anchor',
  'synergy-partner',
  'secondary-support',
  'regulatory-hub',
  'constituent-driver',
  'accessory-agent',
  'Topic Hub',
  'Authority Supernode',
  'Supporting Node',
  'Long-tail Node',
])

export function validateGraphIntegrity(graph: GraphRuntime): IntegrityReport {
  const errors: IntegrityError[] = []
  const warnings: IntegrityWarning[] = []

  const nodes = graph.nodes || []
  const relationships = graph.relationships || []
  const topics = graph.topics || []
  const pathways = graph.pathways || []
  const comparisons = graph.comparisons || []
  const stacks = graph.stacks || []
  const supernodes = graph.supernodes || []

  // Stats collection
  const stats: GraphStats = {
    nodeCount: nodes.length,
    relationshipCount: relationships.length,
    topicCount: topics.length,
    pathwayCount: pathways.length,
    comparisonCount: comparisons.length,
    stackCount: stacks.length,
    supernodeCount: supernodes.length,
  }

  // Set of valid slugs for checking endpoint existence
  const nodeSlugs = new Set<string>()
  const nodeIds = new Set<string>()

  // Validate nodes
  nodes.forEach((node, index) => {
    const entityId = node.slug || node.id || `node-${index}`
    
    if (!node.id) {
      errors.push({
        code: 'MISSING_NODE_ID',
        message: `Node at index ${index} is missing a required 'id' field`,
        entityId,
      })
    } else {
      if (nodeIds.has(node.id)) {
        errors.push({
          code: 'DUPLICATE_NODE_ID',
          message: `Duplicate node ID: ${node.id}`,
          entityId,
        })
      }
      nodeIds.add(node.id)
    }

    if (!node.slug) {
      errors.push({
        code: 'MISSING_NODE_SLUG',
        message: `Node '${node.id || index}' is missing a required 'slug' field`,
        entityId,
      })
    } else {
      if (nodeSlugs.has(node.slug)) {
        errors.push({
          code: 'DUPLICATE_NODE_SLUG',
          message: `Duplicate node slug: ${node.slug}`,
          entityId,
        })
      }
      nodeSlugs.add(node.slug)
    }

    if (!node.name) {
      errors.push({
        code: 'MISSING_NODE_NAME',
        message: `Node '${entityId}' is missing a required 'name' field`,
        entityId,
      })
    }

    if (!node.type) {
      errors.push({
        code: 'MISSING_NODE_TYPE',
        message: `Node '${entityId}' is missing a required 'type' field`,
        entityId,
      })
    } else if (node.type !== 'herb' && node.type !== 'compound' && node.type !== 'stack') {
      errors.push({
        code: 'INVALID_NODE_TYPE',
        message: `Node '${entityId}' has invalid type: ${node.type}`,
        entityId,
      })
    }

    if (node.evidence_tier && !VALID_EVIDENCE_TIERS.has(node.evidence_tier)) {
      warnings.push({
        code: 'INVALID_EVIDENCE_TIER',
        message: `Node '${entityId}' has custom or unexpected evidence tier: ${node.evidence_tier}`,
        entityId,
      })
    }

    if (node.authority_role && !VALID_AUTHORITY_ROLES.has(node.authority_role)) {
      warnings.push({
        code: 'INVALID_AUTHORITY_ROLE',
        message: `Node '${entityId}' has custom or unexpected authority role: ${node.authority_role}`,
        entityId,
      })
    }
  })

  // Validate relationships
  relationships.forEach((rel, index) => {
    const entityId = rel.id || `rel-${index}`

    if (!rel.id) {
      errors.push({
        code: 'MISSING_RELATIONSHIP_ID',
        message: `Relationship at index ${index} is missing a required 'id' field`,
        entityId,
      })
    }

    if (!rel.source) {
      errors.push({
        code: 'MISSING_RELATIONSHIP_SOURCE',
        message: `Relationship '${entityId}' is missing 'source'`,
        entityId,
      })
    } else if (!nodeSlugs.has(rel.source)) {
      errors.push({
        code: 'DANGLING_RELATIONSHIP_SOURCE',
        message: `Relationship source slug '${rel.source}' does not map to any existing node`,
        entityId,
      })
    }

    if (!rel.target) {
      errors.push({
        code: 'MISSING_RELATIONSHIP_TARGET',
        message: `Relationship '${entityId}' is missing 'target'`,
        entityId,
      })
    } else if (!nodeSlugs.has(rel.target)) {
      errors.push({
        code: 'DANGLING_RELATIONSHIP_TARGET',
        message: `Relationship target slug '${rel.target}' does not map to any existing node`,
        entityId,
      })
    }

    if (rel.source && rel.target && rel.source === rel.target) {
      warnings.push({
        code: 'SELF_REFERENTIAL_RELATIONSHIP',
        message: `Relationship '${entityId}' has identical source and target slugs: ${rel.source}`,
        entityId,
      })
    }
  })

  // Validate comparisons
  comparisons.forEach((comp, index) => {
    const entityId = comp.id || `comp-${index}`
    if (comp.source && !nodeSlugs.has(comp.source)) {
      warnings.push({
        code: 'DANGLING_COMPARISON_SOURCE',
        message: `Comparison source slug '${comp.source}' does not exist as a node`,
        entityId,
      })
    }
    if (comp.target && !nodeSlugs.has(comp.target)) {
      warnings.push({
        code: 'DANGLING_COMPARISON_TARGET',
        message: `Comparison target slug '${comp.target}' does not exist as a node`,
        entityId,
      })
    }
  })

  // Validate stacks
  stacks.forEach((stack, index) => {
    const entityId = stack.id || `stack-${index}`
    if (stack.source && !nodeSlugs.has(stack.source)) {
      warnings.push({
        code: 'DANGLING_STACK_SOURCE',
        message: `Stack source slug '${stack.source}' does not exist as a node`,
        entityId,
      })
    }
    if (stack.target && !nodeSlugs.has(stack.target)) {
      warnings.push({
        code: 'DANGLING_STACK_TARGET',
        message: `Stack target slug '${stack.target}' does not exist as a node`,
        entityId,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  }
}
