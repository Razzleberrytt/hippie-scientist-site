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

describe('public evidence participant-count ambiguity', () => {
  it('excludes ambiguous N from aggregate participants while retaining clean studies', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'ambiguous-a',
          sources: [{
            title: 'Ambiguous shared trial',
            pmid: '12345678',
            study_type: 'randomized controlled trial',
            n: 100,
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'ambiguous-b',
          sources: [{
            title: 'Ambiguous shared trial alias',
            pmid: '12345678',
            study_type: 'randomized controlled trial',
            sample_size: 'N=120',
          }],
        }),
      },
      {
        type: 'herb',
        record: record({
          slug: 'clean',
          sources: [{
            title: 'Clean trial',
            pmid: '87654321',
            study_type: 'randomized controlled trial',
            n: 50,
          }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(2)
    expect(dataset.metrics).toMatchObject({
      humanTrialCount: 2,
      approximateParticipants: 50,
      participantCountCoverage: 1,
      participantCountAmbiguityStudyCount: 1,
    })
  })
})
