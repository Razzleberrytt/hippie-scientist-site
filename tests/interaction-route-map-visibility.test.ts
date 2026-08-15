import { describe, expect, it } from 'vitest'

import { buildRenderableSlugEntityTypeMap } from '../src/lib/runtime-data'
import type { RuntimeRecord } from '../src/types/content'

describe('interaction partner route map visibility', () => {
  it('keeps renderable publish and noindex profiles linkable while excluding hidden records', () => {
    const herbs: RuntimeRecord[] = [
      { slug: 'published-herb', indexability_status: 'PUBLISH' },
      { slug: 'research-herb', indexability_status: 'NOINDEX' },
      {
        slug: 'hidden-herb',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
    ]
    const compounds: RuntimeRecord[] = [
      { slug: 'published-compound', indexability_status: 'PUBLISH' },
      { slug: 'research-compound', indexability_status: 'NOINDEX' },
      {
        slug: 'hidden-compound',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
    ]

    expect(buildRenderableSlugEntityTypeMap(herbs, compounds)).toEqual({
      'published-herb': 'herb',
      'research-herb': 'herb',
      'published-compound': 'compound',
      'research-compound': 'compound',
    })
  })

  it('does not create route entries for records without a valid slug', () => {
    expect(
      buildRenderableSlugEntityTypeMap(
        [{ slug: '', indexability_status: 'PUBLISH' }],
        [{ indexability_status: 'PUBLISH' }],
      ),
    ).toEqual({})
  })
})
