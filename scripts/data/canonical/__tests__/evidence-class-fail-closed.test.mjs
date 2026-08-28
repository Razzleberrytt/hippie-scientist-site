import { describe, it, expect } from 'vitest'

import { buildEvidenceRationale } from '../../../../lib/evidence-rationale'
import { applyBatch } from '../apply.mjs'
import { buildEvidenceReview } from '../evidence-finalize.mjs'
import { entityId } from '../ids.mjs'
import { normalizeEvidenceLevel } from '../normalize.mjs'
import { normalizedPatchSchema } from '../schema.mjs'
import { evaluateRecord } from '../../../lib/production-content-invariants.mjs'

const NOW = '2026-01-01T00:00:00.000Z'

function dataset() {
  return {
    entities: [{
      id: entityId('compound', 'test-compound'),
      entity_type: 'compound',
      canonical_name: 'Test Compound',
      slug: 'test-compound',
      aliases: [],
      description: '',
      review_status: 'approved',
      created_at: NOW,
      updated_at: NOW,
      provenance: [],
      data: {},
      legacy: {},
    }],
    claims: [],
    edges: [],
    sources: [],
  }
}

function patch(operation = { op: 'add_claim', value: 'supports an outcome', payload: {} }) {
  return {
    patch_id: 'p-evidence-class',
    patch_version: '1',
    created_at: NOW,
    target: { slug: 'test-compound', entity_type: 'compound' },
    operations: [operation],
    sources: [{ pmid: '12345', title: 'A traceable source', year: '2026' }],
    notes: '',
    confidence: 0.5,
    requires_review: true,
    original_filename: 'test.json',
    original_hash: 'abc',
  }
}

describe('canonical evidence classification fails closed', () => {
  it('classifies literal preclinical/nonclinical descriptors before clinical substrings', () => {
    expect(normalizeEvidenceLevel('preclinical')).toBe('preclinical')
    expect(normalizeEvidenceLevel('nonclinical systematic review in rats')).toBe('preclinical')
    expect(normalizeEvidenceLevel('in vitro cell study')).toBe('preclinical')
  })

  it('allows normalized patch operations to carry an explicit evidence class', () => {
    const parsed = normalizedPatchSchema.safeParse(
      patch({ op: 'add_claim', value: 'animal outcome', payload: {}, evidence_level: 'preclinical' }),
    )
    expect(parsed.success).toBe(true)
  })

  it('does not infer human evidence merely because a claim has a source', () => {
    const result = applyBatch(dataset(), [patch()])
    expect(result.results[0].status).toBe('applied')
    expect(result.dataset.claims).toHaveLength(1)
    expect(result.dataset.claims[0].evidence_level).toBe('none')
  })

  it('preserves an explicit preclinical class through patch application', () => {
    const result = applyBatch(dataset(), [
      patch({ op: 'add_claim', value: 'animal outcome', payload: {}, evidence_level: 'preclinical' }),
    ])
    expect(result.dataset.claims[0].evidence_level).toBe('preclinical')
  })

  it('keeps evidence-review previews unclassified when the patch omits evidence class', () => {
    const review = buildEvidenceReview({ slug: 'test-compound', patches: [patch()], dataset: dataset() })
    expect(review.report.proposed_claims[0].evidence_level).toBe('none')
  })
})

describe('source-derived rationale population is fail closed', () => {
  it('does not count a generic systematic review as human when source attestation says population is unknown/nonhuman', () => {
    const rationale = buildEvidenceRationale([{
      study_class: 'systematic-review',
      study_class_source: 'Systematic Review',
      study_class_human: false,
    }])
    expect(rationale.classifiedStudyCount).toBe(1)
    expect(rationale.humanStudyCount).toBe(0)
  })

  it('counts a review when independent source metadata establishes a human population', () => {
    const rationale = buildEvidenceRationale([{
      study_class: 'meta-analysis',
      study_class_source: 'Meta-Analysis of randomized trials in adults',
      study_class_human: true,
    }])
    expect(rationale.classifiedStudyCount).toBe(1)
    expect(rationale.humanStudyCount).toBe(1)
  })
})

describe('production human-source gate is independent of claim labels', () => {
  const base = {
    slug: 'test-compound',
    indexability_status: 'PUBLISH',
    evidence_grade: '',
  }

  it('rejects a human claim backed only by a preclinical systematic review', () => {
    const issues = evaluateRecord({
      ...base,
      sources: [{
        id: 'src-1',
        title: 'Systematic review of preclinical studies in rats',
        studyClass: 'preclinical systematic review',
      }],
      claimMap: [{
        id: 'claim-1',
        claim: 'Improved outcome in humans',
        evidenceLevel: 'human_obs',
        sourceRefIds: ['src-1'],
      }],
    }, 'compound')

    expect(issues.map((issue) => issue.code)).toContain('HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE')
  })

  it('does not treat review design alone as proof of a human source', () => {
    const issues = evaluateRecord({
      ...base,
      sources: [{ id: 'src-1', title: 'Systematic review and meta-analysis of mechanisms' }],
      claimMap: [{
        id: 'claim-1',
        claim: 'Human outcome',
        evidenceLevel: 'human_obs',
        sourceRefIds: ['src-1'],
      }],
    }, 'compound')

    expect(issues.map((issue) => issue.code)).toContain('HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE')
  })

  it('accepts independently human-classified source metadata', () => {
    const issues = evaluateRecord({
      ...base,
      sources: [{ id: 'src-1', title: 'Outcome study', studyClass: 'randomized controlled trial in adults' }],
      claimMap: [{
        id: 'claim-1',
        claim: 'Human outcome',
        evidenceLevel: 'human_rct',
        sourceRefIds: ['src-1'],
      }],
    }, 'compound')

    expect(issues.map((issue) => issue.code)).not.toContain('HUMAN_CLAIM_WITHOUT_HUMAN_SOURCE')
  })
})
