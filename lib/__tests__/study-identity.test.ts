import { describe, expect, it } from 'vitest'

import {
  buildPmidByCanonicalRoot,
  identityPmidsForJoin,
  parseStudyIdentity,
  pmidForIdentity,
} from '@/lib/study-identity'
import { canonicalStudyIdentityMap, loadPubmedCache } from '@/lib/research-coverage'
import { adaptClaimToProfile } from '@/scripts/claim-dna/adapter-1a'
import { enrichDoisFromCache, enrichSourceRecordsWithDoi } from '@/scripts/claim-dna/alias-1c'

describe('parseStudyIdentity', () => {
  it('parses pmid-canonical identifiers', () => {
    const id = parseStudyIdentity('pmid:38561618')
    expect(id.type).toBe('pmid')
    expect(id.pmid).toBe('38561618')
    expect(id.doi).toBeNull()
    expect(id.canonical).toBe('pmid:38561618')
  })

  it('parses doi-canonical identifiers without fabricating a PMID', () => {
    const id = parseStudyIdentity('doi:10.1000/xyz.123')
    expect(id.type).toBe('doi')
    expect(id.pmid).toBeNull()
    expect(id.doi).toBe('10.1000/xyz.123')
  })

  it('parses source-ref identifiers as non-publication identities', () => {
    const id = parseStudyIdentity('source-ref:src_pubmed-99999999')
    expect(id.type).toBe('source-ref')
    expect(id.pmid).toBeNull()
    expect(id.doi).toBeNull()
  })

  it('treats malformed identifiers as unknown, never coercing them', () => {
    for (const bad of [
      'pmid:abc', 'doi:', '', 'not-an-identifier', 'pmid:',
      'doi:garbage', 'doi:not-a-doi', 'doi:10.1000', 'doi:11.1000/xyz', 'doi:10./xyz',
    ]) {
      const id = parseStudyIdentity(bad)
      expect(id.pmid).toBeNull()
      expect(id.doi).toBeNull()
      expect(id.type).toBe('unknown')
    }
    expect(parseStudyIdentity('pmid:abc').type).toBe('unknown')
  })

  it('normalizes DOI case per the documented contract', () => {
    const id = parseStudyIdentity('doi:10.1000/XYZ.123')
    expect(id.type).toBe('doi')
    expect(id.doi).toBe('10.1000/xyz.123')
  })
})

describe('buildPmidByCanonicalRoot', () => {
  it('associates a doi-canonical root with its single verified PMID', () => {
    const map = buildPmidByCanonicalRoot([
      { canonical: 'doi:10.1000/xyz', pmid: '38561618' },
    ])
    expect(map.get('doi:10.1000/xyz')).toBe('38561618')
  })

  it('drops ambiguous associations instead of fabricating one', () => {
    const map = buildPmidByCanonicalRoot([
      { canonical: 'doi:10.1000/xyz', pmid: '111' },
      { canonical: 'doi:10.1000/xyz', pmid: '222' },
    ])
    expect(map.has('doi:10.1000/xyz')).toBe(false)
  })

  it('ignores non-doi canonicals and invalid PMIDs', () => {
    const map = buildPmidByCanonicalRoot([
      { canonical: 'pmid:38561618', pmid: '38561618' },
      { canonical: 'doi:10.1000/xyz', pmid: 'not-a-pmid' },
      { canonical: 'doi:10.1000/xyz', pmid: undefined },
      { canonical: 'source-ref:x', pmid: '123' },
    ])
    expect(map.size).toBe(0)
  })
})

describe('pmidForIdentity', () => {
  it('never places a DOI-canonical identifier inside a PMID field', () => {
    const doiId = parseStudyIdentity('doi:10.1000/xyz')
    // No verified association: null, not the doi: string.
    expect(pmidForIdentity(doiId, new Map())).toBeNull()
    // Verified association: the PMID, not the doi: string.
    expect(pmidForIdentity(doiId, new Map([['doi:10.1000/xyz', '38561618']]))).toBe('38561618')
    expect(pmidForIdentity(parseStudyIdentity('source-ref:x'), new Map())).toBeNull()
    expect(pmidForIdentity(parseStudyIdentity('garbage'), new Map())).toBeNull()
  })
})

describe('identityPmidsForJoin', () => {
  it('resolves joins from verified identifiers without assuming a pmid: prefix', () => {
    const pmids = identityPmidsForJoin(
      ['pmid:38561618', 'doi:10.1000/xyz', 'source-ref:src_pubmed-1'],
      new Map([['doi:10.1000/xyz', '99999999']]),
    )
    expect(pmids).toEqual(['38561618', '99999999'])
  })

  it('drops DOI-canonical identities with no verified PMID association', () => {
    const pmids = identityPmidsForJoin(['doi:10.1000/xyz'], new Map())
    expect(pmids).toEqual([])
  })
})

describe('typed identity over the real reconciler (DOI-enriched profile)', () => {
  it('recovers the PMID for a doi-canonical identity from verified source metadata', () => {
    const cache = loadPubmedCache()
    const doiMap = enrichDoisFromCache(['38561618'], cache)
    const profile = adaptClaimToProfile({
      id: 'test-join',
      claim: 'test',
      pmid: '38561618',
      profile_slug: 'test',
    })
    const enriched = enrichSourceRecordsWithDoi(profile.sources ?? [], doiMap)
    const identities = canonicalStudyIdentityMap({ ...profile, sources: enriched })
    const canonicals = [...identities.values()].map(String)
    // The reconciler emits a doi-canonical root once a DOI is present.
    expect(canonicals.some((c) => c.startsWith('doi:'))).toBe(true)

    const sourceById = new Map(enriched.map((s) => [String(s.id), s]))
    const pmidByCanonicalRoot = buildPmidByCanonicalRoot(
      [...identities.entries()].map(([sourceId, canonical]) => ({
        canonical: String(canonical),
        pmid: sourceById.get(String(sourceId))?.pmid,
      })),
    )
    const joinPmids = identityPmidsForJoin(canonicals, pmidByCanonicalRoot)
    // The verified PMID is recovered for the join; no doi: string leaks through.
    expect(joinPmids).toContain('38561618')
    expect(joinPmids.every((p) => /^\d+$/.test(p))).toBe(true)
  })
})
