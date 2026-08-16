import { describe, expect, it } from 'vitest'

import {
  buildPublicEvidenceDatasetFromRecords,
  publicEvidenceDatasetToCsv,
} from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(overrides: Partial<RuntimeRecord>): RuntimeRecord {
  return {
    slug: 'example',
    name: 'Example',
    category: 'Stress',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    ...overrides,
  } as RuntimeRecord
}

describe('public evidence ambiguity flags', () => {
  it('exports canonical ambiguity flags and candidate values per study', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'first-alias',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/ambiguous-study',
            year: 2020,
            study_type: 'randomized controlled trial',
            n: 100,
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'second-alias',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/ambiguous-study',
            pmid: '34559859',
            year: 2021,
            study_type: 'systematic review',
            n: 120,
          }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0]).toMatchObject({
      id: 'doi:10.1000/ambiguous-study',
      year: undefined,
      publicationYearCandidates: [2020, 2021],
      publicationYearAmbiguous: true,
      evidenceClass: 'other',
      studyClassCandidates: ['randomized_controlled_trial', 'systematic_review'],
      studyClassAmbiguous: true,
      sampleSize: undefined,
      participantCountCandidates: [100, 120],
      participantCountAmbiguous: true,
    })
    expect(dataset.metrics.publicationYearAmbiguityStudyCount).toBe(1)
    expect(dataset.metrics.studyClassAmbiguityStudyCount).toBe(1)
    expect(dataset.metrics.participantCountAmbiguityStudyCount).toBe(1)
    expect(dataset.metrics.humanTrialCount).toBe(0)
    expect(dataset.metrics.approximateParticipants).toBe(0)
    expect(dataset.metrics.participantCountCoverage).toBe(0)

    const csv = publicEvidenceDatasetToCsv(dataset)
    expect(csv).toContain('year,year_candidates,year_ambiguous')
    expect(csv).toContain('study_class,study_class_candidates,study_class_ambiguous')
    expect(csv).toContain('sample_size,participant_count_candidates,participant_count_ambiguous')
    expect(csv).toContain('2020|2021,true')
    expect(csv).toContain('randomized_controlled_trial|systematic_review,true')
    expect(csv).toContain(',100|120,true')
  })
})
