import { describe, expect, it } from 'vitest'
import {
  generateDynamicBreadcrumbs,
  getRouteMetadata,
  validateRoute,
} from '../lib/navigation-config'

describe('stress route metadata', () => {
  it('treats Stress as a first-class guide hub', () => {
    expect(validateRoute('/guides/stress')).toBe(true)
    expect(getRouteMetadata('/guides/stress')).toMatchObject({
      label: 'Stress',
      parent: '/guides',
    })

    expect(generateDynamicBreadcrumbs('/guides/stress')).toEqual([
      { label: 'Home', href: '/', current: false },
      { label: 'Topics & Guides', href: '/guides', current: false },
      { label: 'Stress', href: '/guides/stress', current: true },
    ])
  })

  it('keeps Anxiety metadata distinct from Stress', () => {
    expect(getRouteMetadata('/guides/anxiety')).toMatchObject({
      label: 'Anxiety',
      parent: '/guides',
    })
  })
})
