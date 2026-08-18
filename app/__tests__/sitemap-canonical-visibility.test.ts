import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import sitemap from '../sitemap'
import { RUNTIME_COMPARISON_SIDES } from '@/lib/runtime-comparison-sides'
import {
  buildRouteVisibilityIndex,
  declaresSelfCanonicalIndexable,
  normalizeVisibilityRoute,
} from '@/lib/sitemap-route-visibility'
import { canRenderRuntimeComparison } from '@/src/lib/runtime-comparison-resolution'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import { LOCALIZED_ROUTES } from '@/src/lib/international-seo'
import { shouldIndexRoute } from '@/src/lib/seo'

/**
 * The sitemap must advertise a URL if and only if the page agrees it should be
 * indexed there. Both directions had live failures before these guards:
 * `validate:sitemap` failed on four URLs contradicting their own canonical/robots,
 * and `validate:sitemap-completeness` failed on 23 real pages nobody had added to
 * the literal lists in app/sitemap.ts.
 */
describe('sitemap canonical visibility', () => {
  const entryPaths = async () => {
    const entries = await sitemap()
    return new Set(entries.map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname)))
  }

  it('keeps the comparison-sides registry in step with the pages that render comparisons', () => {
    const compareDir = path.join(process.cwd(), 'app/guides/compare')
    const runtimePages = readdirSync(compareDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(path.join(compareDir, entry.name, 'page.tsx')))
      .filter((entry) =>
        readFileSync(path.join(compareDir, entry.name, 'page.tsx'), 'utf8').includes('RuntimeEvidenceComparison'),
      )
      .map((entry) => entry.name)
      .sort()

    expect(Object.keys(RUNTIME_COMPARISON_SIDES).sort()).toEqual(runtimePages)
  })

  it('never advertises a page that declares noindex or a different canonical', async () => {
    const paths = await entryPaths()
    const visibility = buildRouteVisibilityIndex()

    for (const [route, declared] of visibility) {
      if (!paths.has(route)) continue
      expect(declared.indexable, `${route} declares noindex but is in the sitemap`).toBe(true)
      if (declared.canonicalPath) {
        expect(declared.canonicalPath, `${route} canonicalises elsewhere but is in the sitemap`).toBe(route)
      }
    }

    // The two that were live in the sitemap while canonicalising away.
    expect(paths.has('/articles/best-supplements-for-sleep')).toBe(false)
    expect(paths.has('/guides/focus/best-supplements-for-focus')).toBe(false)
  })

  it('never advertises a comparison whose ingredient records will not render', async () => {
    const paths = await entryPaths()

    for (const [slug, sides] of Object.entries(RUNTIME_COMPARISON_SIDES)) {
      const available = await canRenderRuntimeComparison(sides.left, sides.right, getUnifiedRuntimeRecords)
      if (available) continue
      expect(
        paths.has(`/guides/compare/${slug}`),
        `${slug} cannot resolve both ingredients and must not be advertised`,
      ).toBe(false)
    }
  })

  it('advertises every static page that declares itself indexable and self-canonical', async () => {
    const paths = await entryPaths()
    const visibility = buildRouteVisibilityIndex()
    const localizedTranslations = new Set(
      LOCALIZED_ROUTES.flatMap((route) =>
        Object.values(route.translations)
          .filter((translated): translated is string => Boolean(translated))
          .map(normalizeVisibilityRoute),
      ),
    )

    // Comparisons resolve their ingredients from runtime records, so a page that
    // looks indexable in source may still refuse to render; that case has its own
    // test above.
    const unavailableComparisons = new Set<string>()
    for (const [slug, sides] of Object.entries(RUNTIME_COMPARISON_SIDES)) {
      const available = await canRenderRuntimeComparison(sides.left, sides.right, getUnifiedRuntimeRecords)
      if (!available) unavailableComparisons.add(`/guides/compare/${slug}`)
    }

    const missing = [...visibility.keys()]
      .filter((route) => declaresSelfCanonicalIndexable(route, visibility))
      .filter((route) => !localizedTranslations.has(route))
      .filter((route) => !unavailableComparisons.has(route))
      // Routes the site deliberately keeps out of the index (internal, utility)
      // rather than ones that merely fall outside a generated route family.
      .filter((route) => {
        const decision = shouldIndexRoute(route)
        return decision.index || decision.reason === 'not-priority-index-route'
      })
      .filter((route) => !paths.has(route))

    expect(missing, `these pages publish themselves as indexable but are not advertised: ${missing.join(', ')}`).toEqual([])
  })

  it('leaves translated URLs to the localized sitemap that carries their hreflang cluster', async () => {
    const paths = await entryPaths()

    for (const route of LOCALIZED_ROUTES) {
      for (const translated of Object.values(route.translations)) {
        if (!translated) continue
        expect(paths.has(normalizeVisibilityRoute(translated))).toBe(false)
      }
    }
  })
})
