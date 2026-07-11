import { describe, expect, it } from 'vitest'
import { applyBatch } from '../apply.mjs'
import {
  applyReviewManifest,
  buildEvidenceReview,
  validateReviewManifest,
  verifyFinalizedProfile,
} from '../evidence-finalize.mjs'
import { buildCanonicalCitationOverlay, mergeCanonicalCitationOverlay } from '../citation-export.mjs'

function datasetFixture() {
  return {
    entities: [{
      id: 'ent_compound_example',
      entity_type: 'compound',
      slug: 'example-compound',
      canonical_name: 'Example Compound',
      aliases: [],
      data: {},
    }],
    claims: [{
      id: 'clm_legacy',
      subject_id: 'ent_compound_example',
      predicate: 'supports_outcome',
      object_literal: 'Vague legacy benefit.',
      source_ids: ['src_legacy'],
      evidence_level: 'human_obs',
      confidence: 0.5,
      review_status: 'pending',
      notes: '',
      qualifiers: {},
      provenance: [],
    }],
    sources: [{
      id: 'src_legacy',
      url: 'https://example.com/legacy',
      title: 'Legacy source',
      review_status: 'approved',
      provenance: [],
    }],
    edges: [],
  }
}

function patchFixture() {
  return {
    patch_id: 'evidence-example-stress-001',
    original_hash: 'raw-hash',
    original_filename: 'example-compound-stress.json',
    target: {
      slug: 'example-compound',
      entity_type: 'compound',
    },
    operations: [{
      op: 'add_claim',
      field: 'effects',
      value: 'A small randomized trial reported a lower stress response than placebo.',
      confidence: 0.7,
      notes: 'Keep the wording narrow.',
    }],
    sources: [{
      doi: '10.1000/example',
      url: 'https://doi.org/10.1000/example',
      title: 'Randomized example trial',
      year: '2025',
    }],
    confidence: 0.7,
    requires_review: true,
  }
}

describe('buildEvidenceReview', () => {
  it('creates a slug-specific manifest from a successful dry run', () => {
    const review = buildEvidenceReview({
      slug: 'example-compound',
      patches: [patchFixture()],
      dataset: datasetFixture(),
    })

    expect(review.manifest).toMatchObject({
      slug: 'example-compound',
      entity_id: 'ent_compound_example',
      decision: 'pending',
      approved_patch_ids: ['evidence-example-stress-001'],
    })
    expect(review.manifest.approved_claim_ids).toHaveLength(1)
    expect(review.manifest.approved_source_ids).toHaveLength(1)
    expect(review.report.summary).toMatchObject({
      patches: 1,
      proposed_claims: 1,
      unique_sources: 1,
      dry_run_applied: 1,
    })
  })

  it('rejects non-evidence operations', () => {
    const patch = patchFixture()
    patch.operations = [{ op: 'update_field', field: 'description', value: 'Do not overwrite.' }]

    expect(() => buildEvidenceReview({
      slug: 'example-compound',
      patches: [patch],
      dataset: datasetFixture(),
    })).toThrow(/unsupported evidence-finalize operation/)
  })
})

describe('review approval and export', () => {
  it('approves the reviewed batch and removes deprecated canonical claims from runtime', () => {
    const dataset = datasetFixture()
    const patch = patchFixture()
    const review = buildEvidenceReview({ slug: 'example-compound', patches: [patch], dataset })
    const manifest = {
      ...review.manifest,
      decision: 'approved',
      reviewer: 'Reviewer Name',
      reviewed_at: '2026-07-11T22:00:00.000Z',
      deprecated_claim_ids: ['clm_legacy'],
      deprecated_source_ids: ['src_legacy'],
    }

    const validation = validateReviewManifest(manifest, {
      slug: 'example-compound',
      batchHash: review.manifest.batch_hash,
      availablePatchIds: new Set([patch.patch_id]),
    })
    expect(validation).toEqual({ ok: true, errors: [] })

    const applied = applyBatch(dataset, [patch]).dataset
    const finalized = applyReviewManifest(applied, manifest)
    expect(finalized.claims.find((claim) => claim.id === 'clm_legacy').review_status).toBe('deprecated')
    expect(finalized.claims.find((claim) => manifest.approved_claim_ids.includes(claim.id)).review_status).toBe('approved')
    expect(finalized.sources.find((source) => manifest.approved_source_ids.includes(source.id)).review_status).toBe('approved')

    const overlay = buildCanonicalCitationOverlay(finalized).get('example-compound')
    const existing = {
      slug: 'example-compound',
      claimMap: [{ id: 'clm_legacy', claim: 'Vague legacy benefit.', sourceRefIds: ['src_legacy'] }],
      sources: [{ id: 'src_legacy', title: 'Legacy source', url: 'https://example.com/legacy' }],
      evidence: {
        reviewStatus: 'sourced_pending_review',
        claimIds: ['clm_legacy'],
        sourceIds: ['src_legacy'],
      },
    }
    const record = mergeCanonicalCitationOverlay(existing, overlay)
    const verification = verifyFinalizedProfile({ record, manifest })

    expect(verification).toEqual({ ok: true, errors: [] })
    expect(record.claimMap.map((claim) => claim.id)).not.toContain('clm_legacy')
    expect(record.sources.map((source) => source.id)).not.toContain('src_legacy')
    expect(record.evidence.reviewStatus).toBe('sourced')
  })

  it('blocks source deprecation while an active claim still uses it', () => {
    const dataset = datasetFixture()
    const patch = patchFixture()
    const review = buildEvidenceReview({ slug: 'example-compound', patches: [patch], dataset })
    const manifest = {
      ...review.manifest,
      decision: 'approved',
      reviewer: 'Reviewer Name',
      reviewed_at: '2026-07-11T22:00:00.000Z',
      deprecated_source_ids: ['src_legacy'],
    }

    const applied = applyBatch(dataset, [patch]).dataset
    expect(() => applyReviewManifest(applied, manifest)).toThrow(/still referenced by active claim/)
  })

  it('rejects a stale review hash', () => {
    const review = buildEvidenceReview({
      slug: 'example-compound',
      patches: [patchFixture()],
      dataset: datasetFixture(),
    })
    const manifest = {
      ...review.manifest,
      batch_hash: 'stale',
      decision: 'approved',
      reviewer: 'Reviewer Name',
      reviewed_at: '2026-07-11T22:00:00.000Z',
    }

    const validation = validateReviewManifest(manifest, {
      slug: 'example-compound',
      batchHash: review.manifest.batch_hash,
      availablePatchIds: new Set(['evidence-example-stress-001']),
    })
    expect(validation.ok).toBe(false)
    expect(validation.errors).toContain('manifest batch_hash is stale; regenerate and review again')
  })
})
