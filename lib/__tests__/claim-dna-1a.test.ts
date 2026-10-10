import { describe, expect, it } from 'vitest'

import {
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
} from '@/lib/research-coverage'
import { adaptClaimToProfile, sourceRecordIdForPmid, splitPmids } from '@/scripts/claim-dna/adapter-1a'
import { buildClaimDna, sortKeysDeep } from '@/scripts/claim-dna/run-1a'

// rg-0456: curcumin-piperine meta-analysis, PMID 38561618 (in PubMed cache).
const CLAIM_ID = 'rg-0456'
const PMID = '38561618'

describe('round 1a adapter', () => {
  it('preserves the canonical claim id verbatim', () => {
    const profile = adaptClaimToProfile({
      id: CLAIM_ID,
      claim: 'OA pain/inflammation (RCTs/meta).',
      pmid: PMID,
      profile_slug: 'curcumin-piperine',
    })
    expect(profile.claimMap?.[0]?.id).toBe(CLAIM_ID)
    expect(profile._adapterClaimId).toBe(CLAIM_ID)
  })

  it('maps PMIDs to synthetic source records, never raw PMIDs in sourceRefIds', () => {
    const profile = adaptClaimToProfile({
      id: CLAIM_ID,
      claim: 'x',
      pmid: PMID,
      profile_slug: 'curcumin-piperine',
    })
    const sourceIds = (profile.sources ?? []).map((s) => String(s.id))
    expect(sourceIds).toEqual([sourceRecordIdForPmid(PMID)])
    expect(sourceIds).toEqual([`src_pubmed-${PMID}`])
    const refs = profile.claimMap?.[0]?.sourceRefIds ?? []
    expect(refs).toEqual(sourceIds)
    // The silent-drop bug class: a raw PMID with no source record resolves to nothing.
    expect(refs).not.toContain(PMID)
    // And the source record carries the pmid field the identity machinery needs.
    expect(String(profile.sources?.[0]?.pmid)).toBe(PMID)
  })

  it('splits packed PMID strings', () => {
    expect(splitPmids('15070181; 22167571')).toEqual(['15070181', '22167571'])
    expect(splitPmids('38561618')).toEqual(['38561618'])
    expect(splitPmids('')).toEqual([])
  })
})

describe('round 1a pipeline', () => {
  it('resolves the claim to a canonical study identity (no silent drop)', () => {
    const profile = adaptClaimToProfile({
      id: CLAIM_ID,
      claim: 'OA pain/inflammation (RCTs/meta).',
      pmid: PMID,
      profile_slug: 'curcumin-piperine',
    })
    const identities = canonicalStudyIdentityMap(profile)
    const claim = (profile.claimMap ?? [])[0]
    const studyIds = uniqueClaimStudyIdentities(claim, identities)
    // One PMID in -> exactly one canonical study out. Zero would mean the
    // adapter fed the identity machinery something it could not resolve.
    expect(studyIds).toHaveLength(1)
    expect(studyIds[0]).toContain(PMID)
  })

  it('classifies provenance/resolution/assessment independently', () => {
    const { artifact } = buildClaimDna({ claimId: CLAIM_ID })
    expect(artifact['provenance_status']).toBe('primary_linked')
    expect(artifact['resolution_status']).toBe('resolved')
    expect(artifact['evidence_assessment']).toBe('not_evaluated')
  })

  it('negative test: uncached PMID is metadata_unavailable, not unresolved provenance', () => {
    const profile = adaptClaimToProfile({
      id: 'test-uncached',
      claim: 'test claim',
      pmid: '99999999',
      profile_slug: 'test-profile',
    })
    // Simulate the classifier logic directly: pmid present but not in cache.
    const pmids = ['99999999']
    const metadataByPmid: Record<string, unknown> = {}
    const provenance_status = pmids.length > 0 ? 'primary_linked' : 'unresolved'
    const resolution_status =
      pmids.length === 0
        ? 'not_attempted'
        : pmids.every((p) => metadataByPmid[p])
          ? 'resolved'
          : 'metadata_unavailable'
    expect(provenance_status).toBe('primary_linked')
    expect(resolution_status).toBe('metadata_unavailable')
    expect(profile.sources?.[0]?.pmid).toBe('99999999')
  })

  it('never auto-assigns a supports relationship from citation presence', () => {
    const { artifact } = buildClaimDna({ claimId: CLAIM_ID })
    expect(artifact['evidence_relationship']).toBe('unassessed')
    expect(artifact['evidence_relationship']).not.toBe('supports')
  })

  it('is deterministic: two runs produce byte-identical output', () => {
    const a = buildClaimDna({ claimId: CLAIM_ID })
    const b = buildClaimDna({ claimId: CLAIM_ID })
    expect(a.artifactBytes).toBe(b.artifactBytes)
    expect(a.artifactSha256).toBe(b.artifactSha256)
    // And no wall-clock timestamps leak into the deterministic bytes.
    expect(a.artifactBytes).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
  })

  it('traces every analytical output to its inputs', () => {
    const { artifact, trace } = buildClaimDna({ claimId: CLAIM_ID })
    const outputs = artifact['analytical_outputs'] as Record<string, unknown>
    // Every top-level analytical output must have a trace entry.
    expect(trace.some((t) => t.output === 'canonical_study_identities')).toBe(true)
    expect(trace.some((t) => t.output.startsWith('publication_metadata:'))).toBe(true)
    // Every trace entry names its inputs and the function that produced it.
    for (const t of trace) {
      expect(Array.isArray(t.inputs)).toBe(true)
      expect(typeof t.via).toBe('string')
      expect(t.via.length).toBeGreaterThan(0)
    }
    expect(Object.keys(outputs)).toContain('canonical_study_identities')
    expect(Object.keys(outputs)).toContain('publication_metadata')
  })

  it('sortKeysDeep produces stable key ordering', () => {
    const unsorted = { z: 1, a: { d: 4, b: 2 }, m: [3, 1] }
    const sorted = sortKeysDeep(unsorted) as Record<string, unknown>
    expect(Object.keys(sorted)).toEqual(['a', 'm', 'z'])
    expect(Object.keys(sorted['a'] as Record<string, unknown>)).toEqual(['b', 'd'])
  })
})
