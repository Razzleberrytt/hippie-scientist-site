import { describe, expect, it } from 'vitest'

import {
  buildCitationIdentifierIdentityMap,
  canonicalCitationIdentifier,
} from '@/lib/citation-identifiers.mjs'
import {
  canonicalStudyGroups,
  crossProfileStudyIdentityMap,
  type ResearchProfileEntry,
} from '@/lib/research-coverage'

describe('canonical citation identity', () => {
  it('collapses DOI-only, bridge, and PMID-only representations', () => {
    const sources = [
      { doi: '10.1000/shared-study' },
      { doi: 'https://doi.org/10.1000/shared-study', pmid: '34559859' },
      { pmid: '34559859' },
    ]
    const identities = buildCitationIdentifierIdentityMap(sources)
    expect(sources.map(source => canonicalCitationIdentifier(source, identities))).toEqual([
      'doi:10.1000/shared-study',
      'doi:10.1000/shared-study',
      'doi:10.1000/shared-study',
    ])
  })

  it('never unions packed multiple PMIDs or guesses an ambiguous DOI bridge', () => {
    const identities = buildCitationIdentifierIdentityMap([
      { doi: '10.1000/ambiguous', pmid: '15070181; 22167571' },
    ])
    expect(identities.get('doi:10.1000/ambiguous')).toBe('doi:10.1000/ambiguous')
    expect(identities.get('pmid:15070181')).toBe('pmid:15070181')
    expect(identities.get('pmid:22167571')).toBe('pmid:22167571')
  })

  it('uses the same bridge locally and across research profiles', () => {
    const record = {
      slug: 'example',
      sources: [
        { id: 'doi', doi: '10.1000/shared-study', studyClass: 'rct' },
        { id: 'bridge', doi: '10.1000/shared-study', pmid: '34559859', studyClass: 'rct' },
        { id: 'pmid', pmid: '34559859', studyClass: 'rct' },
      ],
      claimMap: [],
    }
    expect(canonicalStudyGroups(record).size).toBe(1)

    const profiles: ResearchProfileEntry[] = [
      { kind: 'herbs', url: '/herbs/a/', file: 'a.json', record: { slug: 'a', sources: [{ id: 'a', doi: '10.1000/shared-study' }], claimMap: [] } },
      { kind: 'compounds', url: '/compounds/b/', file: 'b.json', record: { slug: 'b', sources: [{ id: 'b', doi: '10.1000/shared-study', pmid: '34559859' }], claimMap: [] } },
      { kind: 'herbs', url: '/herbs/c/', file: 'c.json', record: { slug: 'c', sources: [{ id: 'c', pmid: '34559859' }], claimMap: [] } },
    ]
    expect(new Set(crossProfileStudyIdentityMap(profiles).values())).toEqual(new Set(['doi:10.1000/shared-study']))
  })
})
