import { describe, expect, it } from 'vitest'

import sitemap from '../sitemap'
import { normalizeVisibilityRoute } from '@/lib/sitemap-route-visibility'

describe('article sitemap content-collection discovery', () => {
  it('advertises the live mitragynine monograph even when legacy article JSON lacks it', async () => {
    const entries = await sitemap()
    const paths = new Set(
      entries.map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname)),
    )

    expect(paths.has('/articles/mitragynine')).toBe(true)
  })

  it('keeps an existing content/blog article discoverable through the same article route', async () => {
    const entries = await sitemap()
    const paths = new Set(
      entries.map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname)),
    )

    expect(paths.has('/articles/2c-b-effects')).toBe(true)
  })

  it('does not emit duplicate article URLs when content sources overlap legacy registries', async () => {
    const entries = await sitemap()
    const articlePaths = entries
      .map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname))
      .filter((route) => route.startsWith('/articles/'))

    expect(new Set(articlePaths).size).toBe(articlePaths.length)
  })
})
