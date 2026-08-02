import { describe, expect, it } from 'vitest'

import { generateDynamicBreadcrumbs } from '../navigation-config'

describe('lead magnet navigation', () => {
  it('uses a valid, compact breadcrumb trail for the checklist route', () => {
    expect(generateDynamicBreadcrumbs('/lead-magnets/adhd-supplement-starter-checklist/')).toEqual([
      { label: 'Home', href: '/', current: false },
      {
        label: 'ADHD Supplement Starter Checklist',
        href: '/lead-magnets/adhd-supplement-starter-checklist',
        current: true,
      },
    ])
  })
})
