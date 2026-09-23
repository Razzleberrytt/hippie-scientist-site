import { describe, expect, it } from 'vitest'

import { buildAug23WorkbookEvidenceIndex } from '@/lib/runtime-data'

describe('Aug 23 workbook evidence profile index', () => {
  it('groups eligible enrichment claims by profile while preserving source order and fields', () => {
    const index = buildAug23WorkbookEvidenceIndex([
      {
        id: 'aug23-enr-alpha-1',
        profile_slug: 'alpha',
        title: 'Primary title',
        claim: 'Alpha claim one',
        pmid: '123',
        doi: '10.1000/alpha',
        source_url: 'https://example.com/alpha',
        evidence_tier: 'RCT',
      },
      {
        id: 'other-alpha-ignored',
        profile_slug: 'alpha',
        claim: 'Not an Aug 23 enrichment claim',
        pmid: '999',
      },
      {
        id: 'aug23-enr-beta-1',
        profile_slug: 'beta',
        title: '',
        claim: 'Fallback claim title',
        pmid: '456',
        evidence_tier: 'review',
      },
      {
        id: 'aug23-enr-alpha-2',
        profile_slug: 'alpha',
        claim: 'Alpha claim two',
        source_url: 'https://example.com/alpha-2',
      },
    ])

    expect(index.get('alpha')).toEqual([
      {
        id: 'src_aug23-enr-alpha-1',
        title: 'Primary title',
        pmid: '123',
        doi: '10.1000/alpha',
        url: 'https://example.com/alpha',
        studyType: 'RCT',
        result: 'Alpha claim one',
        metadataSource: 'workbook-evidence-register',
      },
      {
        id: 'src_aug23-enr-alpha-2',
        title: 'Alpha claim two',
        pmid: '',
        doi: '',
        url: 'https://example.com/alpha-2',
        studyType: '',
        result: 'Alpha claim two',
        metadataSource: 'workbook-evidence-register',
      },
    ])
    expect(index.get('beta')).toEqual([
      {
        id: 'src_aug23-enr-beta-1',
        title: 'Fallback claim title',
        pmid: '456',
        doi: '',
        url: '',
        studyType: 'review',
        result: 'Fallback claim title',
        metadataSource: 'workbook-evidence-register',
      },
    ])
  })

  it('excludes unusable, non-enrichment, and unscoped claims', () => {
    const index = buildAug23WorkbookEvidenceIndex([
      null,
      [],
      { id: 'aug23-enr-no-profile', profile_slug: '', claim: 'No profile', pmid: '1' },
      { id: 'aug23-enr-no-source', profile_slug: 'alpha', title: '', claim: '', pmid: '', doi: '', source_url: '' },
      { id: 'legacy-claim', profile_slug: 'alpha', claim: 'Legacy', pmid: '2' },
    ])

    expect(index.size).toBe(0)
  })

  it('returns an empty index for non-array input', () => {
    expect(buildAug23WorkbookEvidenceIndex({})).toEqual(new Map())
  })
})
