import { describe, expect, it } from 'vitest'
import {
  classifyRuntimeSourceOrphan,
  rankRuntimeSourceRemediations,
} from '../runtime-source-remediation-classifier.mjs'

const orphan = { kind: 'herb', slug: 'fixture', sourceId: 'src_fixture', url: '/herbs/fixture/' }

function profile(source, claim = {}) {
  return {
    slug: 'fixture',
    indexability_status: 'PUBLISH',
    sources: source ? [{ id: 'src_fixture', title: 'Fixture study', ...source }] : [],
    claimMap: [{
      id: 'claim-1',
      claim: 'Human safety evidence reports adverse events.',
      evidenceLevel: 'human_rct',
      sourceRefIds: ['src_fixture'],
      ...claim,
    }],
  }
}

describe('runtime source remediation classifier', () => {
  it('marks DOI/PMID-bearing local metadata as attestation-ready without restoring registry membership', () => {
    const row = classifyRuntimeSourceOrphan(orphan, {
      profile: profile({ doi: '10.1000/fixture', pubmedId: '12345678', url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/' }),
    })

    expect(row.remediationState).toBe('recoverable_verified_identity')
    expect(row.anchors).toEqual({
      doi: '10.1000/fixture',
      pmid: '12345678',
      canonicalUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
    })
    expect(row.published).toBe(true)
    expect(row.safetyClaim).toBe(true)
    expect(row.humanEvidenceClaim).toBe(true)
  })

  it('keeps missing or anchorless local metadata unresolved', () => {
    const missing = classifyRuntimeSourceOrphan(orphan, { profile: profile(null) })
    expect(missing.remediationState).toBe('identity_metadata_insufficient')
    expect(missing.localSourcePresent).toBe(false)

    const anchorless = classifyRuntimeSourceOrphan(orphan, {
      profile: profile({ url: 'https://consensus.app/papers/fixture' }),
    })
    expect(anchorless.remediationState).toBe('identity_metadata_insufficient')
  })

  it('routes stale promotion or duplicate history through governed reconciliation', () => {
    const candidate = {
      candidateSourceId: 'cand_fixture',
      doi: '10.1000/fixture',
      pmid: '12345678',
      reviewStatus: 'approved_for_registry',
      approvalNotes: 'Approved via governed checks and promoted to source registry.',
    }
    const reconciliation = {
      candidateSourceId: 'cand_fixture',
      correctedPromotionState: 'promotion_history_unresolved',
    }
    const row = classifyRuntimeSourceOrphan(orphan, {
      profile: profile({ doi: '10.1000/fixture', pubmedId: '12345678' }),
      candidates: [candidate],
      reconciliations: [reconciliation],
    })

    expect(row.remediationState).toBe('candidate_reconciliation_required')
    expect(row.candidateSourceIds).toEqual(['cand_fixture'])
    expect(row.reconciliationStates).toEqual(['promotion_history_unresolved'])
  })

  it('preserves historical provenance as a separate recovery class', () => {
    const row = classifyRuntimeSourceOrphan(orphan, {
      profile: profile({ doi: '10.1000/fixture', publicationStatus: 'superseded' }),
    })
    expect(row.remediationState).toBe('historical_identity_recovery')
  })

  it('quarantines contradictory DOI/PMID identity anchors', () => {
    const row = classifyRuntimeSourceOrphan(orphan, {
      profile: profile({ doi: '10.1000/local', pubmedId: '12345678' }),
      candidates: [{
        candidateSourceId: 'cand_conflict',
        doi: '10.1000/different',
        pmid: '12345678',
        reviewStatus: 'under_review',
      }],
    })
    expect(row.remediationState).toBe('quarantine_unverifiable')
  })

  it('ranks published safety/human rows and high-fanout identities first deterministically', () => {
    const ranked = rankRuntimeSourceRemediations([
      { ...classifyRuntimeSourceOrphan(orphan, { profile: profile({ doi: '10.1000/fixture' }) }), slug: 'a' },
      { ...classifyRuntimeSourceOrphan({ ...orphan, slug: 'b' }, { profile: profile({ doi: '10.1000/fixture' }) }), slug: 'b' },
      {
        kind: 'herb', slug: 'c', sourceId: 'src_low', url: '/herbs/c/',
        remediationState: 'identity_metadata_insufficient', reason: 'fixture', published: false,
        safetyClaim: false, humanEvidenceClaim: false, anchors: { doi: null, pmid: null, canonicalUrl: null },
        localSourcePresent: false, candidateSourceIds: [], reconciliationStates: [],
      },
    ])

    expect(ranked.slice(0, 2).map(row => row.sourceId)).toEqual(['src_fixture', 'src_fixture'])
    expect(ranked[0].sourceFanout).toBe(2)
    expect(ranked.at(-1).sourceId).toBe('src_low')
  })
})
