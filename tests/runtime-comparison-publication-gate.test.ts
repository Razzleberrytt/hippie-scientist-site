import { describe, expect, it } from 'vitest'

import {
  comparisonValueToText,
  firstComparisonField,
  resolveRuntimeComparisonSide,
} from '../src/lib/runtime-comparison-resolution'
import type { RuntimeRecord } from '../src/types/content'

describe('runtime comparison publication gate', () => {
  it('skips unpublished aliases and resolves a later publishable candidate', () => {
    const herbs: RuntimeRecord[] = [
      {
        slug: 'first-alias',
        name: 'Unpublished alias',
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

    expect(resolved.record?.slug).toBe('second-alias')
    expect(resolved.href).toBe('/herbs/second-alias/')
  })

  it('does not expose hidden records and can fall through to a publishable compound', () => {
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

  it('returns no side when every candidate is unpublished', () => {
    const records: RuntimeRecord[] = [
      { slug: 'noindex', indexability_status: 'NOINDEX' },
      { slug: 'hidden', indexability_status: 'PUBLISH', runtime_export_decision: 'hide' },
    ]

    expect(
      resolveRuntimeComparisonSide(
        { label: 'Example', candidates: ['noindex', 'hidden'] },
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
