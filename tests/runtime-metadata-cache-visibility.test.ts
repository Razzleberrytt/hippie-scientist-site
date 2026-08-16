import { describe, expect, it } from 'vitest'

import { buildRenderableMetadataMap } from '../src/lib/runtime-metadata-cache'
import type { RuntimeRecord } from '../src/types/content'

describe('runtime metadata cache visibility', () => {
  it('keeps publish and noindex profiles while excluding hidden records', () => {
    const map = buildRenderableMetadataMap(
      [
        { slug: 'published', name: 'Published', indexability_status: 'PUBLISH' },
        { slug: 'research-only', name: 'Research Only', indexability_status: 'NOINDEX' },
        {
          slug: 'hidden',
          name: 'Hidden',
          indexability_status: 'PUBLISH',
          runtime_export_decision: 'hide',
        },
      ],
      'herb',
    )

    expect([...map.keys()]).toEqual(['published', 'research-only'])
    expect(map.get('published')?.meta_title).toBe('Published Benefits, Dosage & Safety')
  })

  it('does not let a hidden duplicate reserve a slug ahead of a renderable record', () => {
    const records: RuntimeRecord[] = [
      {
        slug: 'shared',
        name: 'Hidden version',
        indexability_status: 'PUBLISH',
        runtime_export_decision: 'hide',
      },
      {
        slug: 'shared',
        name: 'Renderable version',
        indexability_status: 'PUBLISH',
      },
    ]

    const map = buildRenderableMetadataMap(records, 'compound')

    expect(map.get('shared')?.name).toBe('Renderable version')
    expect(map.get('shared')?.meta_title).toBe('Renderable version: Effects, Dose & Safety')
  })

  it('ignores records without a usable slug', () => {
    const missingSlug = {
      name: 'Missing',
      indexability_status: 'PUBLISH',
    } as unknown as RuntimeRecord

    expect(
      buildRenderableMetadataMap(
        [
          { slug: '', name: 'Empty', indexability_status: 'PUBLISH' },
          missingSlug,
        ],
        'herb',
      ),
    ).toEqual(new Map())
  })
})
