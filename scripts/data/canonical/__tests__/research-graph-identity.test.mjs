import { describe, expect, it } from 'vitest'
import { buildStableEntityId } from '../../../../config/evidence-graph/identity-rules.mjs'
import { entityId } from '../ids.mjs'
import { buildResearchRelationshipGraph } from '../../research-graph-lib.mjs'
import { remapResearchGraphToStableSubstanceIds } from '../../research-graph-identity.mjs'

describe('research graph identity compatibility', () => {
  it('keeps legacy claim joins but emits stable evidence-graph substance IDs', () => {
    const herbs = [{ slug: 'herb-a', name: 'Herb A' }]
    const compounds = [{ slug: 'compound-x', name: 'Compound X' }]
    const legacyHerbId = entityId('herb', 'herb-a')
    const legacyCompoundId = entityId('compound', 'compound-x')
    const stableHerbId = buildStableEntityId('herb', 'herb-a')
    const stableCompoundId = buildStableEntityId('compound', 'compound-x')

    const derived = buildResearchRelationshipGraph({
      herbs,
      compounds,
      herbCompoundMap: [{ herb_slug: 'herb-a', compound_slug: 'compound-x' }],
      claims: [{
        id: 'clm_test',
        subject_id: legacyHerbId,
        predicate: 'supports_outcome',
        object_literal: 'sleep',
        qualifiers: { direction: '+' },
      }],
    })
    const graph = remapResearchGraphToStableSubstanceIds(derived, { herbs, compounds })

    const herbNode = graph.nodes.find((node) => node.id === stableHerbId)
    const compoundNode = graph.nodes.find((node) => node.id === stableCompoundId)
    expect(herbNode?.legacyCanonicalId).toBe(legacyHerbId)
    expect(compoundNode?.legacyCanonicalId).toBe(legacyCompoundId)
    expect(graph.nodes.some((node) => node.id === legacyHerbId)).toBe(false)
    expect(graph.edges.some((edge) => edge.from === stableHerbId && edge.rel === 'studied_for_outcome')).toBe(true)
    expect(graph.indexes.compoundsByBotanical[stableHerbId]).toContain(stableCompoundId)
    expect(graph.identityContract.publicSubstanceIds).toBe('<entityType>:<canonical-slug>')
  })
})
