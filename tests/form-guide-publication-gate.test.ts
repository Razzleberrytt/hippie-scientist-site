import { describe, expect, it } from 'vitest'

import {
  getForms,
  selectIndexableFormIngredients,
} from '../app/guides/forms/form-data'
import type { RuntimeRecord } from '../src/types/content'

describe('form guide publication gate', () => {
  it('publishes only indexable records with at least two distinct forms', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'published',
        forms: ['capsule', 'powder'],
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'noindex',
        forms: ['capsule', 'powder'],
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'hidden',
        forms: ['capsule', 'powder'],
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
      {
        slug: 'single-form',
        forms: ['capsule'],
        indexability_status: 'PUBLISH',
      },
    ]

    expect(selectIndexableFormIngredients(records).map((record) => record.slug)).toEqual([
      'published',
    ])
  })

  it('applies publication visibility before slug deduplication', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'shared',
        name: 'Noindex version',
        forms: ['capsule', 'powder'],
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'shared',
        name: 'Published version',
        available_forms: 'capsule; liquid',
        indexability_status: 'PUBLISH',
      },
    ]

    const selected = selectIndexableFormIngredients(records)

    expect(selected).toHaveLength(1)
    expect(selected[0]?.name).toBe('Published version')
  })

  it('deduplicates forms before testing whether a comparison is meaningful', () => {
    const repeated: RuntimeRecord = {
      slug: 'repeated',
      forms: ['capsule'],
      available_forms: ['capsule'],
      indexability_status: 'PUBLISH',
    }

    expect(getForms(repeated)).toEqual(['capsule'])
    expect(selectIndexableFormIngredients([repeated])).toEqual([])
  })

  it('preserves object and delimiter-separated form representations', () => {
    const objectRecord: RuntimeRecord = {
      forms: { extract: 'standardized', powder: 'whole root' },
    }
    const stringRecord: RuntimeRecord = {
      available_forms: 'capsule | liquid',
    }

    expect(getForms(objectRecord)).toEqual(['extract: standardized', 'powder: whole root'])
    expect(getForms(stringRecord)).toEqual(['capsule', 'liquid'])
  })
})
