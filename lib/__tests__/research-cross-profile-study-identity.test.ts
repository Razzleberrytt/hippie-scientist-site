import { describe, expect, it } from 'vitest'

import {
  canonicalStudyGroups,
  crossProfileStudyIdentity,
  crossProfileStudyIdentityMap,
  type ResearchProfileEntry,
} from '@/lib/research-coverage'

function entry(url: string, sources: Array<Record<string, unknown>>): ResearchProfileEntry {
  return {
    kind: 'herbs',
    url,
    file: `${url}.json`,
    record: { slug: url.replace(/\W+/g, '-'), sources },
  }
}

describe('cross-profile study identity', () => {
  it('unions DOI/PMID aliases across profiles without collapsing fallback source IDs', () => {
    const profiles = [
      entry('/herbs/a/', [
        { id: 'shared', doi: '10.1234/example', pmid: '12345678' },
        { id: 'fallback', title: 'Profile A local source' },
      ]),
      entry('/herbs/b/', [
        { id: 'shared', pmid: '12345678' },
        { id: 'fallback', title: 'Profile B local source' },
      ]),
    ]

    const identities = crossProfileStudyIdentityMap(profiles)
    const groupsA = canonicalStudyGroups(profiles[0].record)
    const groupsB = canonicalStudyGroups(profiles[1].record)
    const stableA = [...groupsA.keys()].find((id) => id !== 'source-ref:fallback')!
    const stableB = [...groupsB.keys()].find((id) => id !== 'source-ref:fallback')!

    expect(crossProfileStudyIdentity('/herbs/a/', stableA, identities))
      .toBe(crossProfileStudyIdentity('/herbs/b/', stableB, identities))
    expect(crossProfileStudyIdentity('/herbs/a/', 'source-ref:fallback', identities))
      .not.toBe(crossProfileStudyIdentity('/herbs/b/', 'source-ref:fallback', identities))
  })
})
