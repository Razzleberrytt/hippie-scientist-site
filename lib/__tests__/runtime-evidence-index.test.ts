import { describe, expect, it } from 'vitest'

import { buildAug23WorkbookEvidenceIndex } from '../runtime-data'

describe('Aug 23 workbook evidence index', () => {
  it('groups only usable enrichment claims by profile without changing source normalization', () => {
    const index = buildAug23WorkbookEvidenceIndex([
      {
        id: 'aug23-enr-ash-1',
        profile_slug: 'ashwagandha',
        title: 'Ashwagandha trial',
        pmid: '12345',
        evidence_tier: 'A',
        claim: 'Improved the measured outcome.',
      },
      {
        id: 'aug23-enr-ash-2',
        profile_slug: 'ashwagandha',
        claim: 'Fallback title claim',
        doi: '10.1000/example',
        source_url: 'https://example.com/study',
        evidence_tier: 'B',
      },
      {
        id: 'ordinary-claim',
        profile_slug: 'ashwagandha',
        title: 'Must be ignored',
      },
      {
        id: 'aug23-enr-empty',
        profile_slug: 'ashwagandha',
      },
      {
        id: 'aug23-enr-rho-1',
        profile_slug: 'rhodiola',
        title: 'Rhodiola evidence',
      },
      null,
    ])

    expect(index.get('ashwagandha')).toEqual([
      {
        id: 'src_aug23-enr-ash-1',
        title: 'Ashwagandha trial',
        pmid: '12345',
        doi: '',
        url: '',
        studyType: 'A',
        result: 'Improved the measured outcome.',
        metadataSource: 'workbook-evidence-register',
      },
      {
        id: 'src_aug23-enr-ash-2',
        title: 'Fallback title claim',
        pmid: '',
        doi: '10.1000/example',
        url: 'https://example.com/study',
        studyType: 'B',
        result: 'Fallback title claim',
        metadataSource: 'workbook-evidence-register',
      },
    ])
    expect(index.get('rhodiola')).toHaveLength(1)
    expect(index.has('ordinary-claim')).toBe(false)
    expect([...index.values()].flat()).toHaveLength(3)
  })

  it('fails closed to an empty index for malformed claims payloads', () => {
    expect(buildAug23WorkbookEvidenceIndex(null).size).toBe(0)
    expect(buildAug23WorkbookEvidenceIndex({ claims: [] }).size).toBe(0)
  })
})
