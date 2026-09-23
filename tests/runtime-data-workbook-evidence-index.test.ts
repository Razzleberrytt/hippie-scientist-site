import { describe, expect, it } from 'vitest'

import { buildAug23WorkbookEvidenceIndex } from '../lib/runtime-data'

describe('Aug 23 workbook evidence index', () => {
  it('indexes eligible workbook evidence once by profile slug without changing source shape', () => {
    const index = buildAug23WorkbookEvidenceIndex([
      {
        id: 'aug23-enr-ash-1',
        profile_slug: 'ashwagandha',
        title: 'Ashwagandha trial',
        claim: 'Improved stress score',
        pmid: '12345',
        doi: '10.1000/example',
        source_url: 'https://example.test/ash',
        evidence_tier: 'randomized-controlled-trial',
      },
      {
        id: 'aug23-enr-ash-2',
        profile_slug: 'ashwagandha',
        title: '',
        claim: 'Fallback claim title',
        pmid: '67890',
        evidence_tier: 'systematic-review',
      },
      {
        id: 'other-source',
        profile_slug: 'ashwagandha',
        title: 'Must not be imported',
      },
      {
        id: 'aug23-enr-empty',
        profile_slug: 'l-theanine',
      },
      {
        id: 'aug23-enr-theanine-1',
        profile_slug: 'l-theanine',
        source_url: 'https://example.test/theanine',
      },
    ])

    expect(index.get('ashwagandha')).toEqual([
      {
        id: 'src_aug23-enr-ash-1',
        title: 'Ashwagandha trial',
        pmid: '12345',
        doi: '10.1000/example',
        url: 'https://example.test/ash',
        studyType: 'randomized-controlled-trial',
        result: 'Improved stress score',
        metadataSource: 'workbook-evidence-register',
      },
      {
        id: 'src_aug23-enr-ash-2',
        title: 'Fallback claim title',
        pmid: '67890',
        doi: '',
        url: '',
        studyType: 'systematic-review',
        result: 'Fallback claim title',
        metadataSource: 'workbook-evidence-register',
      },
    ])
    expect(index.get('l-theanine')).toEqual([
      {
        id: 'src_aug23-enr-theanine-1',
        title: '',
        pmid: '',
        doi: '',
        url: 'https://example.test/theanine',
        studyType: '',
        result: '',
        metadataSource: 'workbook-evidence-register',
      },
    ])
    expect(index.size).toBe(2)
  })

  it('fails closed to an empty index for malformed claim payloads', () => {
    expect(buildAug23WorkbookEvidenceIndex(null).size).toBe(0)
    expect(buildAug23WorkbookEvidenceIndex({}).size).toBe(0)
  })
})
