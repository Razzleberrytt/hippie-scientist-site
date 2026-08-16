import { describe, expect, it } from 'vitest'

import { buildPublicEvidenceDatasetFromRecords } from '../public-evidence-dataset'
import type { RuntimeRecord } from '../../src/types/content'

describe('public evidence grade accounting', () => {
  it('keeps unresolved grades explicit and accounts for every ingredient exactly once', () => {
    const records = [
      {
        record: {
          slug: 'outcome-dependent',
          name: 'Outcome Dependent',
          indexability_status: 'PUBLISH',
          evidence_grade: 'Varies by outcome',
          evidence_tier: 'Strong Evidence',
          category: 'Test category',
        } as RuntimeRecord,
        type: 'herb' as const,
      },
      {
        record: {
          slug: 'strong-example',
          name: 'Strong Example',
          indexability_status: 'PUBLISH',
          evidence_grade: 'A',
          evidence_tier: 'Strong Evidence',
          category: 'Test category',
        } as RuntimeRecord,
        type: 'herb' as const,
      },
    ]

    const dataset = buildPublicEvidenceDatasetFromRecords(records)
    const distributionTotal = dataset.metrics.gradeDistribution.reduce((sum, bucket) => sum + bucket.count, 0)
    const category = dataset.metrics.categories.find((item) => item.category === 'Test category')

    expect(dataset.metrics.ingredientCount).toBe(2)
    expect(dataset.metrics.unassignedIngredients).toBe(1)
    expect(dataset.metrics.gradeDistribution.find((bucket) => bucket.grade === 'Unassigned')).toMatchObject({ count: 1 })
    expect(distributionTotal).toBe(dataset.metrics.ingredientCount)
    expect(category).toMatchObject({
      totalIngredients: 2,
      strongOrModerate: 1,
      preliminaryOrInsufficient: 0,
      unassigned: 1,
    })
  })
})
