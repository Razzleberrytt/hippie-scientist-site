import { describe, expect, it } from 'vitest'

import {
  generateDynamicBreadcrumbs,
  getRouteMetadata,
  validateRoute,
} from '@/lib/navigation-config'

describe('route metadata alignment', () => {
  it('recognizes the start router as a first-class route', () => {
    expect(validateRoute('/start')).toBe(true)
    expect(getRouteMetadata('/start')).toMatchObject({
      label: 'Start Here',
      parent: '/',
    })
    expect(generateDynamicBreadcrumbs('/start')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Start Here', href: '/start', current: true },
    ])
  })

  it('recognizes metabolic health as a first-class guide hub', () => {
    expect(validateRoute('/guides/metabolic-health')).toBe(true)
    expect(getRouteMetadata('/guides/metabolic-health')).toMatchObject({
      label: 'Metabolic Health',
      parent: '/guides',
    })
    expect(generateDynamicBreadcrumbs('/guides/metabolic-health')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Topics & Guides', href: '/guides', current: false },
      { label: 'Metabolic Health', href: '/guides/metabolic-health', current: true },
    ])
  })
})
