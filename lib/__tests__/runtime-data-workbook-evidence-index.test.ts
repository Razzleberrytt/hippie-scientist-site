import { describe, expect, it } from 'vitest'

import { buildWorkbookEvidenceIndex } from '@/lib/runtime-data'

describe('manifest-backed workbook evidence profile index', () => {
  it('groups legacy and current manifest enrichment claims by profile', () => {
    const index = buildWorkbookEvidenceIndex([
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
        id: 'med-sertraline-mdd-meta-2023',
        profile_slug: 'sertraline',
        title: 'Sertraline meta-analysis',
        claim: 'Sertraline claim',
        pmid: '37557058',
        doi: '10.1016/j.psychres.2023.115391',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/37557058/',
        evidence_tier: 'systematic review/meta-analysis',
        metadata_source: 'runtime-enrichment',
      },
      {
        id: 'other-alpha-ignored',
        profile_slug: 'alpha',
        claim: 'Not manifest enrichment',
        pmid: '999',
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
    ])

    expect(index.get('sertraline')).toEqual([
      {
        id: 'src_med-sertraline-mdd-meta-2023',
        title: 'Sertraline meta-analysis',
        pmid: '37557058',
        doi: '10.1016/j.psychres.2023.115391',
        url: 'https://pubmed.ncbi.nlm.nih.gov/37557058/',
        studyType: 'systematic review/meta-analysis',
        result: 'Sertraline claim',
        metadataSource: 'runtime-enrichment',
      },
    ])
  })

  it('excludes unusable, non-enrichment, and unscoped claims', () => {
    const index = buildWorkbookEvidenceIndex([
      null,
      [],
      { id: 'med-no-profile', profile_slug: '', claim: 'No profile', pmid: '1', metadata_source: 'runtime-enrichment' },
      { id: 'med-no-source', profile_slug: 'alpha', title: '', claim: '', pmid: '', doi: '', source_url: '', metadata_source: 'runtime-enrichment' },
      { id: 'legacy-claim', profile_slug: 'alpha', claim: 'Legacy', pmid: '2' },
    ])

    expect(index.size).toBe(0)
  })

  it('returns an empty index for non-array input', () => {
    expect(buildWorkbookEvidenceIndex({})).toEqual(new Map())
  })
})
