import { describe, expect, it } from 'vitest'

import {
  canRenderRuntimeComparison,
  comparisonValueToText,
  firstComparisonField,
  resolveRuntimeComparisonSide,
} from '../src/lib/runtime-comparison-resolution'
import type { RuntimeRecord } from '../src/types/content'

describe('runtime comparison publication gate', () => {
  it('keeps a review-gated record renderable instead of turning the comparison into a 404', () => {
    const herbs: RuntimeRecord[] = [
      {
        slug: 'first-alias',
        name: 'Review-gated alias',
        indexability_status: 'NOINDEX',
      },
      {
        slug: 'second-alias',
        name: 'Published alias',
        indexability_status: 'PUBLISH',
      },
    ]

    const resolved = resolveRuntimeComparisonSide(
      { label: 'Example', candidates: ['first-alias', 'second-alias'] },
      herbs,
      [],
    )

    expect(resolved.record?.slug).toBe('first-alias')
    expect(resolved.href).toBe('/herbs/first-alias/')
  })

  it('still refuses to advertise a comparison as indexable when one side is review-gated', async () => {
    const herbs: RuntimeRecord[] = [
      { slug: 'review-gated', indexability_status: 'NOINDEX' },
      { slug: 'published', indexability_status: 'PUBLISH' },
    ]

    const availableForIndexing = await canRenderRuntimeComparison(
      { label: 'Left', candidates: ['review-gated'] },
      { label: 'Right', candidates: ['published'] },
      async () => ({ herbs, compounds: [] }),
    )

    expect(availableForIndexing).toBe(false)
  })

  it('does not expose hidden records and can fall through to a renderable compound', () => {
    const herbs: RuntimeRecord[] = [
      {
        slug: 'shared-candidate',
        name: 'Hidden herb',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
    ]
    const compounds: RuntimeRecord[] = [
      {
        slug: 'shared-candidate',
        name: 'Published compound',
        indexability_status: 'PUBLISH',
      },
    ]

    const resolved = resolveRuntimeComparisonSide(
      { label: 'Example', candidates: ['shared-candidate'] },
      herbs,
      compounds,
    )

    expect(resolved.record?.name).toBe('Published compound')
    expect(resolved.href).toBe('/compounds/shared-candidate/')
  })

  it('returns no side when every candidate is truly hidden', () => {
    const records: RuntimeRecord[] = [
      { slug: 'hidden-one', indexability_status: 'NOINDEX', runtime_export_decision: 'hide' },
      { slug: 'hidden-two', indexability_status: 'PUBLISH', runtime_export_decision: 'hide' },
    ]

    expect(
      resolveRuntimeComparisonSide(
        { label: 'Example', candidates: ['hidden-one', 'hidden-two'] },
        records,
        [],
      ),
    ).toEqual({ label: 'Example', record: null, href: null })
  })

  it('preserves structured comparison field rendering after consolidation', () => {
    const record = {
      slug: 'structured-safety',
      safety: {
        common: ['GI upset', 'headache'],
        note: 'Dose dependent',
      },
    } as unknown as RuntimeRecord

    expect(comparisonValueToText(record.safety)).toBe(
      'common: GI upset; headache; note: Dose dependent',
    )
    expect(firstComparisonField(record, ['missing', 'safety'])).toBe(
      'common: GI upset; headache; note: Dose dependent',
    )
  })
})
