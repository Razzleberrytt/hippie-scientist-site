import { describe, expect, it } from 'vitest'
import {
  buildClaimEvidenceIndex,
  hasApprovedClaimSourceReceipt,
  hasResolvableEvidence,
  sourceIdentifiersFromClaim,
} from './evidence-receipts.mjs'

describe('governed evidence receipts', () => {
  it('counts one PubMed source once even when the claim repeats it as a URL', () => {
    expect(sourceIdentifiersFromClaim({
      pmid: '30198828',
      source_url: 'https://pubmed.ncbi.nlm.nih.gov/30198828/',
    })).toEqual(['pmid:30198828'])
  })

  it('preserves packed PubMed sources as distinct source receipts', () => {
    expect(sourceIdentifiersFromClaim({
      pmid: '12131602',
      source_url: 'https://pubmed.ncbi.nlm.nih.gov/12131602/ | https://pubmed.ncbi.nlm.nih.gov/23348842/',
    })).toEqual(['pmid:12131602', 'pmid:23348842'])
  })

  it('keeps claim identifiers out of the source-id namespace and count', () => {
    const index = buildClaimEvidenceIndex([
      {
        id: 'study-row-1',
        profile_slug: 'example',
        pmid: '30198828',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/30198828/',
      },
      {
        id: 'study-row-2',
        profile_slug: 'example',
        pmid: '30198828',
      },
    ], new Set(['example']))

    expect(index.get('example')).toEqual({
      sourceIds: ['pmid:30198828'],
      claimIds: ['study-row-1', 'study-row-2'],
    })
    expect(index.get('example').sourceIds.some((id) => id.startsWith('claim:'))).toBe(false)
  })

  it('does not let a positive sourceCount self-attest evidence', () => {
    expect(hasResolvableEvidence({
      evidence: {
        sourceCount: 1,
        sourceIds: [],
      },
    })).toBe(false)
  })

  it('rejects a dangling opaque source id but accepts self-resolving identifiers', () => {
    expect(hasResolvableEvidence({
      evidence: {
        sourceCount: 1,
        sourceIds: ['src_missing'],
      },
    })).toBe(false)

    expect(hasResolvableEvidence({
      evidence: {
        sourceCount: 1,
        sourceIds: ['pmid:30198828'],
      },
    })).toBe(true)
  })

  it('accepts an opaque source id only when it resolves locally or through the active registry', () => {
    expect(hasResolvableEvidence({
      sources: [{
        id: 'src_local',
        pmid: '30198828',
      }],
      evidence: {
        sourceIds: ['src_local'],
      },
    })).toBe(true)

    expect(hasResolvableEvidence({
      evidence: {
        sourceIds: ['src_registry'],
      },
    }, {
      registrySourceIds: new Set(['src_registry']),
    })).toBe(true)
  })

  it('requires an approved claim linked to an approved source before generic approval', () => {
    const source = {
      id: 'src_verified',
      pmid: '30198828',
      reviewStatus: 'approved',
    }

    expect(hasApprovedClaimSourceReceipt({
      sources: [source],
      claimMap: [{
        id: 'claim-approved',
        reviewStatus: 'approved',
        sourceRefIds: ['src_verified'],
      }],
    })).toBe(true)

    expect(hasApprovedClaimSourceReceipt({
      sources: [source],
      claimMap: [{
        id: 'claim-pending',
        reviewStatus: 'pending',
        sourceRefIds: ['src_verified'],
      }],
    })).toBe(false)

    expect(hasApprovedClaimSourceReceipt({
      sources: [source],
      claimMap: [{
        id: 'claim-approved',
        reviewStatus: 'approved',
        sourceRefIds: ['src_missing'],
      }],
    })).toBe(false)
  })
})
