import { describe, expect, it } from 'vitest'

import {
  getFoodTimingGuidance,
  getTiming,
  selectDaypartTimingIngredients,
  selectFoodTimingIngredients,
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

  it('keeps morning-or-night subguides inside the same publication gate', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'published-daypart',
        best_taken: 'Take at bedtime',
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'published-generic',
        best_taken: 'Take consistently each day',
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'noindex-daypart',
        best_taken: 'Take in the morning',
        indexability_status: 'NOINDEX',
      },
    ]

    expect(selectDaypartTimingIngredients(records).map((record) => record.slug)).toEqual([
      'published-daypart',
    ])
  })

  it('keeps food subguides inside the same publication gate', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'published-food',
        best_taken: 'Take consistently',
        bioavailability_notes: 'Take with a meal',
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'published-no-food',
        best_taken: 'Take in the morning',
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'hidden-food',
        best_taken: 'Take with food',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
    ]

    const selected = selectFoodTimingIngredients(records)

    expect(selected.map((record) => record.slug)).toEqual(['published-food'])
    expect(getFoodTimingGuidance(selected[0])).toBe('Take with a meal')
  })
})
