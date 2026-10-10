import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
} from '@/lib/research-coverage'
import { adaptClaimToProfile, sourceRecordIdForPmid, splitPmids } from '@/scripts/claim-dna/adapter-1a'
import { buildClaimDna, hasUsableMetadata, sortKeysDeep } from '@/scripts/claim-dna/run-1a'

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

  it('placeholder for negative paths: see end-to-end suite below', () => {
    // The genuine negative tests run buildClaimDna against isolated fixtures.
    expect(true).toBe(true)
  })
  it('regression: adapter never manufactures editorial approval', () => {
    const profile = adaptClaimToProfile({
      id: 'test-no-approval',
      claim: 'test claim',
      pmid: PMID,
      profile_slug: 'test-profile',
    })
    const status = String(profile.claimMap?.[0]?.reviewStatus ?? '')
    expect(status).not.toBe('approved')
    expect(status).toBe('pending')
    // Identity resolution must work independently of approval status.
    const identities = canonicalStudyIdentityMap(profile)
    const claim = (profile.claimMap ?? [])[0]
    expect(uniqueClaimStudyIdentities(claim, identities)).toHaveLength(1)
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

describe('round 1a negative paths (end-to-end via buildClaimDna)', () => {
  let fixtureRoot: string

  beforeAll(() => {
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claim-dna-1a-'))
    const claims = [
      {
        id: 'fixture-uncached',
        claim: 'Fixture claim with PMID absent from cache.',
        pmid: '99999999',
        profile_slug: 'fixture-profile',
      },
      {
        id: 'fixture-invalid-pmid',
        claim: 'Fixture claim with non-numeric PMID.',
        pmid: 'not-a-pmid',
        profile_slug: 'fixture-profile',
      },
    ]
    fs.mkdirSync(path.join(fixtureRoot, 'public', 'data'), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, 'public', 'data', 'claims.json'),
      JSON.stringify(claims),
      'utf8',
    )
    const cache = {
      records: {
        '99999999': {},
        '88888888': { abstract: 'Some abstract text without a title field.' },
      },
    }
    fs.mkdirSync(path.join(fixtureRoot, 'ops', 'cache'), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, 'ops', 'cache', 'pubmed-metadata.json'),
      JSON.stringify(cache),
      'utf8',
    )
    fs.writeFileSync(
      path.join(fixtureRoot, 'ops', 'cache', 'pubmed-abstracts.json'),
      JSON.stringify({ abstracts: {} }),
      'utf8',
    )
    fs.mkdirSync(path.join(fixtureRoot, 'scripts', 'claim-dna'), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, 'scripts', 'claim-dna', 'adapter-1a.ts'),
      '// fixture adapter',
      'utf8',
    )
  })

  afterAll(() => {
    fs.rmSync(fixtureRoot, { recursive: true, force: true })
  })

  it('uncached PMID: metadata_unavailable, provenance stays primary_linked', () => {
    const { artifact } = buildClaimDna({ claimId: 'fixture-uncached', root: fixtureRoot })
    expect(artifact['provenance_status']).toBe('primary_linked')
    expect(artifact['resolution_status']).toBe('metadata_unavailable')
    expect(artifact['evidence_assessment']).toBe('not_evaluated')
    expect(artifact['evidence_relationship']).toBe('unassessed')
    const outputs = artifact['analytical_outputs'] as Record<string, unknown>
    expect(outputs['canonical_study_identities']).toHaveLength(1)
    const jm = artifact['join_metrics'] as Record<string, unknown>
    expect(jm['identity_resolutions']).toBe(1)
    expect(jm['metadata_resolutions']).toBe(0)
    expect(jm['unresolved_identifiers']).toBe(1)
    expect(jm['successful_joins']).toBe(0)
  })

  it('empty or title-less cache objects do not count as resolved', () => {
    expect(hasUsableMetadata({})).toBe(false)
    expect(hasUsableMetadata({ abstract: 'text only' })).toBe(false)
    expect(hasUsableMetadata({ title: 'Real Title' })).toBe(true)
    expect(hasUsableMetadata(null)).toBe(false)
  })

  it('invalid PMID: no identity, unresolved provenance', () => {
    const { artifact } = buildClaimDna({ claimId: 'fixture-invalid-pmid', root: fixtureRoot })
    expect(artifact['pmids']).toEqual([])
    expect(artifact['provenance_status']).toBe('unresolved')
    expect(artifact['resolution_status']).toBe('not_attempted')
  })
})

