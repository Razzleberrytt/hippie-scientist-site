import { describe, expect, it } from 'vitest'

import { buildRenderableRuntimeRecordIndex } from '@/lib/runtime-link-candidates'
import type { RuntimeRecord } from '@/src/types/content'

describe('renderable runtime link candidate index', () => {
  it('keeps publish and noindex records while excluding hidden candidates', () => {
    const index = buildRenderableRuntimeRecordIndex([
      { slug: 'published', indexability_status: 'PUBLISH' },
      { slug: 'research-only', indexability_status: 'NOINDEX' },
      {
        slug: 'hidden',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
    ])

    expect([...index.keys()]).toEqual(['published', 'research-only'])
  })

  it('does not let an unrenderable duplicate reserve a slug ahead of a renderable record', () => {
    const hidden: RuntimeRecord = {
      slug: 'shared',
      name: 'Hidden version',
      indexability_status: 'PUBLISH',
      runtime_export_decision: 'hide',
    }
    const renderable: RuntimeRecord = {
      slug: 'shared',
      name: 'Renderable version',
      indexability_status: 'PUBLISH',
    }

    const index = buildRenderableRuntimeRecordIndex([hidden, renderable])

    expect(index.get('shared')?.name).toBe('Renderable version')
  })

  it('ignores records without a usable slug', () => {
    const missingSlug = { indexability_status: 'PUBLISH' } as unknown as RuntimeRecord

    expect(
      buildRenderableRuntimeRecordIndex([
        { slug: '', indexability_status: 'PUBLISH' },
        missingSlug,
      ]),
    ).toEqual(new Map())
  })
})