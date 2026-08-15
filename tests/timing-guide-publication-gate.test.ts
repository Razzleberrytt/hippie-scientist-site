import { describe, expect, it } from 'vitest'

import {
  getTiming,
  selectIndexableTimingIngredients,
} from '../app/guides/timing/timing-data'
import type { RuntimeRecord } from '../src/types/content'

describe('timing guide publication gate', () => {
  it('publishes only indexable records with explicit timing guidance', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'published',
        name: 'Published',
        best_taken: '  In the morning  ',
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'noindex',
        name: 'Noindex',
        best_taken: 'At night',
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'hidden',
        name: 'Hidden',
        best_taken: 'With food',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
      {
        slug: 'no-timing',
        name: 'No timing',
        indexability_status: 'PUBLISH',
      },
    ]

    const selected = selectIndexableTimingIngredients(records)

    expect(selected.map((record) => record.slug)).toEqual(['published'])
    expect(getTiming(selected[0])).toBe('In the morning')
  })

  it('filters visibility before deduplicating slugs', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'shared',
        name: 'Hidden version',
        best_taken: 'Morning',
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'shared',
        name: 'Published version',
        best_taken: 'Night',
        indexability_status: 'PUBLISH',
      },
    ]

    const selected = selectIndexableTimingIngredients(records)

    expect(selected).toHaveLength(1)
    expect(selected[0]?.name).toBe('Published version')
    expect(getTiming(selected[0])).toBe('Night')
  })
})
