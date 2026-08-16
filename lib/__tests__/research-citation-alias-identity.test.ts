import { describe, expect, it } from 'vitest'

import {
  canonicalStudyGroups,
  crossProfileStudyIdentityMap,
  type ResearchProfileEntry,
} from '@/lib/research-coverage'

describe('canonical research citation alias identity', () => {
  it('collapses DOI-only, DOI+PMID bridge, and PMID-only rows within one profile', () => {
    const record = {
      slug: 'example',
      sources: [
        { id: 'doi-only', doi: '10.1000/shared-study', studyClass: 'rct' },
        { id: 'bridge', doi: '10.1000/shared-study', pmid: '34559859', studyClass: 'rct' },
        { id: 'pmid-only', pmid: '34559859', studyClass: 'rct' },
      ],
      claimMap: [],
    }
    const groups = canonicalStudyGroups(record)
    expect(groups.size).toBe(1)
    expect([...groups.keys()]).toEqual(['doi:10.1000/shared-study'])
    expect([...groups.values()][0].map(source => source.id).sort()).toEqual(['bridge', 'doi-only', 'pmid-only'])
  })

  it('uses the same DOI/PMID bridge across profiles', () => {
    const profiles: ResearchProfileEntry[] = [
      { kind: 'herbs', url: '/herbs/doi-only/', file: 'doi-only.json', record: { slug: 'doi-only', sources: [{ id: 'a', doi: '10.1000/shared-study', studyClass: 'rct' }], claimMap: [] } },
      { kind: 'compounds', url: '/compounds/bridge/', file: 'bridge.json', record: { slug: 'bridge', sources: [{ id: 'b', doi: '10.1000/shared-study', pmid: '34559859', studyClass: 'rct' }], claimMap: [] } },
      { kind: 'herbs', url: '/herbs/pmid-only/', file: 'pmid-only.json', record: { slug: 'pmid-only', sources: [{ id: 'c', pmid: '34559859', studyClass: 'rct' }], claimMap: [] } },
    ]
    const identities = crossProfileStudyIdentityMap(profiles)
    expect(new Set(identities.values())).toEqual(new Set(['doi:10.1000/shared-study']))
  })
})
