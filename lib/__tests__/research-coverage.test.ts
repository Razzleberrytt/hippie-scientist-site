import { describe, expect, it } from 'vitest'

import {
  canonicalStudyClass,
  canonicalStudyGroups,
  canonicalStudyIdentityMap,
  uniqueClaimStudyIdentities,
  type ResearchProfile,
} from '@/lib/research-coverage'

describe('canonical study identity', () => {
  it('collapses source rows connected by DOI/PMID aliases', () => {
    const record: ResearchProfile = {
      sources: [
        { id: 'a', doi: '10.1000/XYZ', pmid: '12345678' },
        { id: 'b', pmid: '12345678' },
        { id: 'c', doi: '10.1000/xyz' },
        { id: 'd', pmid: '87654321' },
      ],
    }

    const identities = canonicalStudyIdentityMap(record)
    expect(identities.get('a')).toBe(identities.get('b'))
    expect(identities.get('a')).toBe(identities.get('c'))
    expect(identities.get('d')).not.toBe(identities.get('a'))
  })

  it('does not invent identity for sources without stable identifiers', () => {
    const record: ResearchProfile = {
      sources: [
        { id: 'a', title: 'Same-looking title' },
        { id: 'b', title: 'Same-looking title' },
      ],
    }

    const identities = canonicalStudyIdentityMap(record)
    expect(identities.get('a')).toBe('source-ref:a')
    expect(identities.get('b')).toBe('source-ref:b')
  })

  it('counts independent studies rather than duplicate source references', () => {
    const record: ResearchProfile = {
      sources: [
        { id: 'a', doi: '10.1000/XYZ', pmid: '12345678' },
        { id: 'b', pmid: '12345678' },
        { id: 'c', pmid: '87654321' },
      ],
    }
    const identities = canonicalStudyIdentityMap(record)

    expect(uniqueClaimStudyIdentities({ sourceRefIds: ['a', 'b'] }, identities)).toHaveLength(1)
    expect(uniqueClaimStudyIdentities({ sourceRefIds: ['a', 'b', 'c'] }, identities)).toHaveLength(2)
  })

  it('derives study design once per canonical study and keeps the strongest classification', () => {
    const record: ResearchProfile = {
      sources: [
        { id: 'a', doi: '10.1000/XYZ', pmid: '12345678', studyClass: 'narrative-review' },
        { id: 'b', pmid: '12345678', studyClass: 'randomized controlled trial' },
        { id: 'c', pmid: '87654321', studyClass: 'narrative-review' },
      ],
    }

    const groups = canonicalStudyGroups(record)
    expect(groups).toHaveLength(2)
    const merged = [...groups.values()].find((group) => group.length === 2)
    expect(merged).toBeDefined()
    expect(canonicalStudyClass(merged ?? [], {})).toBe('rct')
  })
})
