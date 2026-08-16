import { describe, expect, it } from 'vitest'

import { buildPublicEvidenceDatasetFromRecords } from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(overrides: Partial<RuntimeRecord>): RuntimeRecord {
  return {
    slug: 'example',
    name: 'Example',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    ...overrides,
  } as RuntimeRecord
}

describe('public evidence canonical citation identity', () => {
  it('collapses DOI-only and PMID-only rows when a DOI+PMID bridge proves one publication', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'doi-only',
          sources: [{ title: 'Shared via DOI', doi: '10.1000/shared-study', relationship: 'supports' }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'bridge',
          sources: [{ title: 'Bridge', doi: 'https://doi.org/10.1000/shared-study', pmid: '34559859', relationship: 'mixed' }],
        }),
      },
      {
        type: 'herb',
        record: record({
          slug: 'pmid-only',
          sources: [{ title: 'Shared via PMID', pmid: '34559859', relationship: 'contradicts' }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].id).toBe('doi:10.1000/shared-study')
    expect(dataset.studies[0]).toMatchObject({ doi: '10.1000/shared-study', pmid: '34559859' })
    expect(dataset.studies[0].relationships.map(item => item.ingredientSlug).sort()).toEqual([
      'bridge',
      'doi-only',
      'pmid-only',
    ])
  })
})
