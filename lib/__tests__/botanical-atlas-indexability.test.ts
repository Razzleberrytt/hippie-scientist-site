import { describe, expect, it } from 'vitest'
import { CORE_INDEXABLE_ROUTES } from '../index-allowlist'

const ATLAS_ROUTES = [
  '/tools/botanical-activity-atlas',
  '/tools/botanical-activity-atlas/alkaloid-botanicals',
  '/tools/botanical-activity-atlas/natural-stimulants',
  '/tools/botanical-activity-atlas/calming-botanicals',
  '/tools/botanical-activity-atlas/dream-and-perception-herbs',
  '/tools/botanical-activity-atlas/serotonergic-interaction-risk',
] as const

describe('Botanical Activity Atlas indexability', () => {
  it('keeps the atlas and all editorial category guides in the core index allowlist', () => {
    for (const route of ATLAS_ROUTES) {
      expect(CORE_INDEXABLE_ROUTES).toContain(route)
    }
  })

  it('does not contain duplicate atlas routes', () => {
    const routes = CORE_INDEXABLE_ROUTES.filter((route) => route.startsWith('/tools/botanical-activity-atlas'))
    expect(new Set(routes).size).toBe(routes.length)
  })
})
