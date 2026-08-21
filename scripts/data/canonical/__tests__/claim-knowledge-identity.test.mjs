import { describe, expect, it } from 'vitest'
import { buildStableEntityId } from '../../../../config/evidence-graph/identity-rules.mjs'
import { entityId } from '../ids.mjs'
import { buildClaimKnowledgeBase } from '../../claim-knowledge-lib.mjs'
import { remapClaimKnowledgeToStableSubstanceIds } from '../../claim-knowledge-identity.mjs'

describe('claim knowledge identity compatibility', () => {
  it('joins legacy canonical claims while exposing stable public substance IDs', () => {
    const herbs = [{ slug: 'ashwagandha', name: 'Ashwagandha', evidence_grade: 'B' }]
    const legacySubjectId = entityId('herb', 'ashwagandha')
    const stableSubjectId = buildStableEntityId('herb', 'ashwagandha')

    const derived = buildClaimKnowledgeBase({
      herbs,
      claims: [{
        id: 'clm_identitytest',
        subject_id: legacySubjectId,
        predicate: 'supports_outcome',
        object_literal: 'stress',
        qualifiers: { direction: '+' },
        source_ids: [],
        evidence_level: 'human_rct',
        review_status: 'pending',
      }],
    })
    const knowledge = remapClaimKnowledgeToStableSubstanceIds(derived, { herbs })

    const endpoint = knowledge.endpoints[0]
    expect(endpoint.entity.id).toBe(stableSubjectId)
    expect(endpoint.entity.legacyCanonicalId).toBe(legacySubjectId)
    expect(endpoint.claims[0].subjectId).toBe(stableSubjectId)
    expect(endpoint.claims[0].legacyCanonicalSubjectId).toBe(legacySubjectId)
    expect(knowledge.dependencies.clm_identitytest.subjectId).toBe(stableSubjectId)
    expect(knowledge.endpointIndex[stableSubjectId]).toBe('/data/ingredients/ashwagandha.json')
    expect(knowledge.identityContract.publicSubstanceIds).toBe('<entityType>:<canonical-slug>')
  })
})
