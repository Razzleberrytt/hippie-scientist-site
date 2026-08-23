import { describe, expect, it } from 'vitest'
import { auditDuplicateOrganisms } from '../lib/duplicate-organisms.mjs'
import { makeCanonical, publishedHerb } from './fixtures.mjs'

/**
 * The audit's whole job is deciding what "published" means. The workbook column
 * is the wrong answer — a redirected entity keeps `full_public_runtime` while
 * the build emits nothing for it — so these pin the liveness rules.
 */

const canonical = makeCanonical([
  publishedHerb({ slug: 'garlic', name: 'Garlic', latin_name: 'Allium sativum' }),
  publishedHerb({ slug: 'allium-sativum', name: 'Allium Sativum', latin_name: 'Allium sativum' }),
  publishedHerb({ slug: 'saffron', name: 'Saffron', latin_name: 'Crocus sativus' }),
  publishedHerb({ slug: 'crocus-sativus', name: 'Crocus Sativus', latin_name: 'Crocus sativus' }),
  publishedHerb({ slug: 'solo', name: 'Solo', latin_name: 'Unica solitaria' }),
])

const allRouted = new Set(['garlic', 'allium-sativum', 'saffron', 'crocus-sativus', 'solo'])

describe('duplicate-organism audit', () => {
  it('groups entities that share a value and ignores unique ones', () => {
    const report = auditDuplicateOrganisms(canonical, { redirects: new Map(), routes: allRouted })
    expect(report.shared_values).toBe(2)
    expect(report.groups.map((g) => g.value).sort()).toEqual(['Allium sativum', 'Crocus sativus'])
  })

  it('counts a pair as live when both actually emit a route', () => {
    const report = auditDuplicateOrganisms(canonical, { redirects: new Map(), routes: allRouted })
    expect(report.live_duplicates).toBe(2)
    expect(report.already_redirected).toBe(0)
  })

  it('does not count a pair as live when one side is redirected away', () => {
    const report = auditDuplicateOrganisms(canonical, {
      redirects: new Map([['allium-sativum', '/herbs/garlic/']]),
      routes: allRouted,
    })
    expect(report.live_duplicates).toBe(1)
    expect(report.already_redirected).toBe(1)

    const resolved = report.groups.find((g) => g.value === 'Allium sativum')
    expect(resolved.severity).toBe('already-redirected')
    expect(resolved.entities.find((e) => e.slug === 'allium-sativum').redirects_to).toBe('/herbs/garlic/')
  })

  it('does not count a pair as live when one side emits no route', () => {
    const report = auditDuplicateOrganisms(canonical, {
      redirects: new Map(),
      routes: new Set(['garlic', 'saffron', 'crocus-sativus', 'solo']),
    })
    expect(report.live_duplicates).toBe(1)
  })

  it('keeps reporting what the workbook column alone would have said', () => {
    const report = auditDuplicateOrganisms(canonical, {
      redirects: new Map([['allium-sativum', '/herbs/garlic/']]),
      routes: allRouted,
    })
    // Both are still full_public_runtime in the workbook even though one is 301'd.
    expect(report.workbook_published_duplicates).toBe(2)
    expect(report.live_duplicates).toBe(1)
  })

  it('falls back to the workbook column when no route data is available', () => {
    const report = auditDuplicateOrganisms(canonical, { redirects: new Map(), routes: null })
    expect(report.liveness_source).toBe('workbook-column')
    expect(report.live_duplicates).toBe(2)
  })

  it('labels the liveness source it actually used', () => {
    expect(
      auditDuplicateOrganisms(canonical, { redirects: new Map(), routes: allRouted }).liveness_source,
    ).toBe('route-manifest')
  })
})
