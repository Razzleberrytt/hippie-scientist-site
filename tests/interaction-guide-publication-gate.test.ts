import { describe, expect, it } from 'vitest'

import {
  interactionValueToText,
  selectIndexableInteractionIngredients,
} from '../app/guides/interactions/interaction-data'
import type { RuntimeRecord } from '../src/types/content'

describe('interaction guide publication gate', () => {
  it('publishes only indexable records with meaningful interaction data', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'published',
        interactions: ['CYP3A4 substrate', 'Sedative medicines'],
        indexability_status: 'PUBLISH',
      },
      {
        slug: 'noindex',
        interactions: 'Anticoagulants',
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'hidden',
        interactions: 'Stimulants',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
      {
        slug: 'placeholder',
        interactions: 'None known',
        indexability_status: 'PUBLISH',
      },
    ]

    expect(selectIndexableInteractionIngredients(records).map((record) => record.slug)).toEqual([
      'published',
    ])
  })

  it('applies publication visibility before slug deduplication', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'shared',
        name: 'Noindex version',
        interactions: 'Sedatives',
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'shared',
        name: 'Published version',
        interactions: 'Anticoagulants',
        indexability_status: 'PUBLISH',
      },
    ]

    const selected = selectIndexableInteractionIngredients(records)

    expect(selected).toHaveLength(1)
    expect(selected[0]?.name).toBe('Published version')
  })

  it('preserves structured interaction text rendering', () => {
    expect(
      interactionValueToText({
        medication_classes: ['Sedatives', 'Anticoagulants'],
        evidence_note: 'Monitor clinically',
      }),
    ).toBe('Medication Classes: Sedatives; Anticoagulants; Evidence Note: Monitor clinically')
  })
})
