import { describe, expect, it } from 'vitest'
import { entityId } from '../ids.mjs'
import { buildClaimKnowledgeBase } from '../../claim-knowledge-lib.mjs'

describe('claim knowledge base', () => {
  it('attaches stable claims, sources, review truthfulness, and affected pages', () => {
    const subjectId = entityId('herb', 'ashwagandha')
    const knowledge = buildClaimKnowledgeBase({
      herbs: [{
        slug: 'ashwagandha',
        name: 'Ashwagandha',
        evidence_grade: 'B',
        safety_flags: ['pregnancy-caution'],
      }],
      claims: [{
        id: 'clm_123456789abc',
        subject_id: subjectId,
        predicate: 'supports_outcome',
        object_literal: 'stress',
        qualifiers: {
          direction: 'positive',
          study_id: entityId('study', 'stress-rct'),
          public_statement: 'Human trials report a stress-reduction signal in studied ashwagandha preparations.',
        },
        source_ids: ['src_123456789abc'],
        evidence_level: 'human_rct',
        confidence: 0.8,
        review_status: 'approved',
        updated_at: '2026-08-15T12:00:00.000Z',
      }],
      sources: [{
        id: 'src_123456789abc',
        pmid: '12345678',
        title: 'Example RCT',
        author_or_label: 'Example A',
        journal: 'Example Journal',
        year: 2026,
        url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
        review_status: 'approved',
      }],
    })

    expect(knowledge.summary.claims).toBe(1)
    const endpoint = knowledge.endpoints[0]
    expect(endpoint.entity.id).toBe(subjectId)
    expect(endpoint.entity.canonicalPage).toBe('/herbs/ashwagandha/')
    expect(endpoint.evidence.profileGrade).toBe('B')
    expect(endpoint.safetyFlags).toContain('pregnancy-caution')
    expect(endpoint.claims[0].supportingSourceIds).toEqual(['src_123456789abc'])
    expect(endpoint.claims[0].contradictingSourceIds).toEqual([])
    expect(endpoint.claims[0].lastReviewedAt).toBe('2026-08-15T12:00:00.000Z')
    expect(endpoint.claims[0].affectedPages).toEqual(['/herbs/ashwagandha/'])
    expect(endpoint.citations[0].identifier).toEqual({ type: 'pmid', value: '12345678' })
    expect(knowledge.dependencies['clm_123456789abc'].affectedPages).toEqual(['/herbs/ashwagandha/'])
  })

  it('does not call an ordinary update a review when the claim is still pending', () => {
    const subjectId = entityId('compound', 'compound-a')
    const knowledge = buildClaimKnowledgeBase({
      compounds: [{ slug: 'compound-a', name: 'Compound A', evidence_grade: 'C' }],
      claims: [{
        id: 'clm_pending00001',
        subject_id: subjectId,
        predicate: 'supports_outcome',
        object_literal: 'focus',
        qualifiers: { direction: 'mixed' },
        source_ids: ['src_context0001'],
        evidence_level: 'human_obs',
        confidence: 0.5,
        review_status: 'pending',
        updated_at: '2026-08-15T12:00:00.000Z',
      }],
      sources: [{ id: 'src_context0001', doi: '10.1000/example', title: 'Example' }],
    })

    const claim = knowledge.endpoints[0].claims[0]
    expect(claim.lastReviewedAt).toBeNull()
    expect(claim.mixedSourceIds).toEqual(['src_context0001'])
    expect(claim.publicStatement).toBeNull()
  })

  it('never exposes free-form migration notes as public claim wording', () => {
    const subjectId = entityId('herb', 'herb-a')
    const knowledge = buildClaimKnowledgeBase({
      herbs: [{ slug: 'herb-a', name: 'Herb A' }],
      claims: [{
        id: 'clm_notes000001',
        subject_id: subjectId,
        predicate: 'supports_outcome',
        object_literal: 'sleep',
        notes: 'study_count=2; needs_validation; migration note',
        qualifiers: {},
        source_ids: [],
        evidence_level: 'none',
        review_status: 'pending',
      }],
    })

    expect(knowledge.endpoints[0].claims[0].publicStatement).toBeNull()
  })
})
