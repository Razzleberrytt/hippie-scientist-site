import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { getBuiltCompareSlugs } from '@/lib/compare-pages'
import { BUILT_COMPARE_SLUGS } from '@/lib/comparison-utils'
import { COMPARE_COMBINATIONS } from '@/config/compare-combinations'

/**
 * Guards against re-introducing the `/guides/compare/*` "Not found (404)" cluster.
 *
 * Under static export a `/guides/compare/<slug>` page exists ONLY when
 * `app/guides/compare/<slug>/page.tsx` exists (there is no `[slug]` route). The
 * sitemap must therefore advertise only those built pages — never the config
 * comparison lists (COMPARE_COMBINATIONS et al.), which enumerate intended
 * comparisons that are not built and 404 the moment a crawler follows them.
 */
describe('compare sitemap integrity', () => {
  const built = getBuiltCompareSlugs()
  const builtSet = new Set(built)

  it('BUILT_COMPARE_SLUGS (render-guard source of truth) matches the real page.tsx directories', () => {
    // lib/comparison-utils.ts keeps a pure literal list (it is imported by RSC
    // components and must not use node:fs). This asserts that literal never drifts
    // from what the filesystem actually builds.
    expect([...BUILT_COMPARE_SLUGS].sort()).toEqual([...built].sort())
  })

  it('every built compare slug resolves to a real page.tsx', () => {
    expect(built.length).toBeGreaterThan(0)
    for (const slug of built) {
      const page = path.join(process.cwd(), 'app/guides/compare', slug, 'page.tsx')
      expect(existsSync(page), `${slug} should have a page.tsx`).toBe(true)
    }
  })

  it('does not treat unbuilt config comparison combinations as built pages', () => {
    // COMPARE_COMBINATIONS enumerates intended comparisons that have no static page.
    const unbuilt = COMPARE_COMBINATIONS.filter((slug) => !builtSet.has(slug))
    // The overwhelming majority are unbuilt — that is exactly why emitting them
    // to the sitemap produced hundreds of 404s. Assert they are excluded.
    expect(unbuilt.length).toBeGreaterThan(0)
    for (const slug of unbuilt) {
      expect(existsSync(path.join(process.cwd(), 'app/guides/compare', slug, 'page.tsx'))).toBe(false)
    }
  })
})
