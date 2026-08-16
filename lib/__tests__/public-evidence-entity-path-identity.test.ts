import { describe, expect, it } from 'vitest'

import { buildPublicEvidenceDatasetFromRecords } from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(overrides: Partial<RuntimeRecord>): RuntimeRecord {
  return {
    slug: 'shared',
    name: 'Shared',
    category: 'Stress',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    ...overrides,
  } as RuntimeRecord
}

describe('public evidence entity path identity', () => {
  it('keeps same-slug herb and compound relationships distinct for metrics and context', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          category: 'Stress',
          sources: [{
            title: 'Shared clinical trial',
            doi: '10.1000/same-slug-shared-study',
            study_type: 'randomized controlled trial',
            relationship: 'supports',
            outcome: 'Shared endpoint',
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          category: 'Sleep',
          sources: [{
            title: 'Shared clinical trial',
            doi: '10.1000/same-slug-shared-study',
            study_type: 'randomized controlled trial',
            relationship: 'no_clear_effect',
            outcome: 'Shared endpoint',
          }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    expect(dataset.studies[0].relationships.map((relationship) => relationship.ingredientPath).sort()).toEqual([
      '/compounds/shared/',
      '/herbs/shared/',
    ])
    expect(dataset.studies[0].relationshipSummary).toBe('mixed')
    expect(dataset.metrics.withinIngredientDirectionalHeterogeneityStudyCount).toBe(0)

    const stress = dataset.metrics.categories.find((category) => category.category === 'Stress')
    const sleep = dataset.metrics.categories.find((category) => category.category === 'Sleep')
    expect(stress).toMatchObject({ humanStudies: 1, humanTrials: 1 })
    expect(sleep).toMatchObject({ humanStudies: 1, humanTrials: 1 })
  })
})
