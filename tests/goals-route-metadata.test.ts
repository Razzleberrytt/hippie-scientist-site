import { describe, expect, it } from 'vitest'

import {
  generateDynamicBreadcrumbs,
  getRouteMetadata,
  validateRoute,
} from '@/lib/navigation-config'

describe('goals route metadata', () => {
  it('recognizes the goals hub and dynamic goal pages', () => {
    expect(validateRoute('/goals')).toBe(true)
    expect(validateRoute('/goals/sleep')).toBe(true)

    expect(getRouteMetadata('/goals')).toMatchObject({
      label: 'Supplement Goals',
      parent: '/library',
    })
    expect(getRouteMetadata('/goals/sleep')).toMatchObject({
      label: 'Goal Guide',
      parent: '/goals',
      isDynamic: true,
    })
  })

  it('builds a clear breadcrumb trail for a goal page', () => {
    expect(generateDynamicBreadcrumbs('/goals/sleep')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Supplement Goals', href: '/goals', current: false },
      { label: 'Sleep', href: '/goals/sleep', current: true },
    ])
  })
})
