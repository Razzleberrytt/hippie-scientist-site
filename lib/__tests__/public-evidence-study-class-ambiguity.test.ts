import { describe, expect, it } from 'vitest'

import { buildPublicEvidenceDatasetFromRecords } from '@/lib/public-evidence-dataset'
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

describe('public evidence study-class ambiguity', () => {
  it('neutralizes conflicting concrete classes for one canonical publication', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'rct-alias',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/class-conflict',
            study_type: 'randomized controlled trial',
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'review-alias',
          sources: [{
            title: 'Shared publication',
            doi: 'https://doi.org/10.1000/class-conflict',
            pmid: '34559859',
            study_type: 'systematic review',
          }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0]).toMatchObject({
      id: 'doi:10.1000/class-conflict',
      evidenceClass: 'other',
    })
    expect(dataset.metrics.studyClassAmbiguityStudyCount).toBe(1)
    expect(dataset.metrics.humanStudyCount).toBe(0)
    expect(dataset.metrics.humanTrialCount).toBe(0)
    expect(dataset.metrics.categories[0].humanStudies).toBe(0)
    expect(dataset.metrics.categories[0].humanTrials).toBe(0)
  })

  it('uses one concrete class over unknown aliases regardless of source order', () => {
    const unknown = {
      type: 'herb' as const,
      record: record({
        slug: 'unknown-alias',
        sources: [{
          title: 'Shared publication',
          doi: '10.1000/class-known',
          study_type: 'unclear publication type',
        }],
      }),
    }
    const rct = {
      type: 'compound' as const,
      record: record({
        slug: 'rct-alias',
        sources: [{
          title: 'Shared publication',
          doi: '10.1000/class-known',
          pmid: '34559859',
          study_type: 'randomized controlled trial',
        }],
      }),
    }

    for (const entities of [[unknown, rct], [rct, unknown]]) {
      const dataset = buildPublicEvidenceDatasetFromRecords(entities)
      expect(dataset.studies).toHaveLength(1)
      expect(dataset.studies[0].evidenceClass).toBe('randomized_controlled_trial')
      expect(dataset.metrics.studyClassAmbiguityStudyCount).toBe(0)
      expect(dataset.metrics.humanStudyCount).toBe(1)
      expect(dataset.metrics.humanTrialCount).toBe(1)
    }
  })
})
