import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditDuplicateOrganisms, proposeResolution, redirectedSlugs } from '../lib/duplicate-organisms.mjs'
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
      redirects: new Map([['herb:allium-sativum', '/herbs/garlic/']]),
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
      redirects: new Map([['herb:allium-sativum', '/herbs/garlic/']]),
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

  it('keys redirects by namespace, so a compound route cannot retire a herb', () => {
    // `/compounds/lions-mane` 301s, but the herb `lions-mane` does not. An
    // unqualified key conflated the two and marked the herb as redirected away.
    const redirectsPath = path.join(os.tmpdir(), `enrichment-redirects-${process.pid}.txt`)
    fs.writeFileSync(
      redirectsPath,
      ['/compounds/lions-mane /herbs/lions-mane/ 301', '/herbs/garlic /herbs/other/ 301'].join('\n'),
      'utf8',
    )
    try {
      const map = redirectedSlugs({ redirectsPath })
      expect(map.get('compound:lions-mane')).toBe('/herbs/lions-mane/')
      expect(map.get('herb:lions-mane')).toBeUndefined()
      expect(map.get('herb:garlic')).toBe('/herbs/other/')
    } finally {
      fs.rmSync(redirectsPath, { force: true })
    }
  })
})

/**
 * Survivor ranking. The workbook `source_count` column is stale and must not
 * influence any of this — `glycyrrhiza-glabra` claims 24 while rendering the
 * same three citations as `licorice`, which claims 7.
 */
describe('survivor proposals', () => {
  const pair = makeCanonical([
    publishedHerb({ slug: 'licorice', name: 'Licorice', latin_name: 'Glycyrrhiza glabra', source_count: '7' }),
    publishedHerb({
      slug: 'glycyrrhiza-glabra',
      name: 'Glycyrrhiza Glabra',
      latin_name: 'Glycyrrhiza glabra',
      source_count: '24',
    }),
  ])
  const routes = new Set(['licorice', 'glycyrrhiza-glabra'])
  const audit = () => auditDuplicateOrganisms(pair, { redirects: new Map(), routes })
  const evenly = () => ({ built: true, bytes: 100_000, pmids: 3 })

  it('keeps the common-name slug when content is at parity, ignoring source_count', () => {
    const plan = proposeResolution(pair, audit(), { content: evenly })
    expect(plan.proposals).toHaveLength(1)
    expect(plan.proposals[0].survivor).toBe('licorice')
    expect(plan.proposals[0].retire).toEqual(['glycyrrhiza-glabra'])
    expect(plan.proposals[0].basis).toMatch(/precedent/)
    expect(plan.proposals[0].confidence).toBe('high')
  })

  it('lets materially better content override the precedent', () => {
    // The gudmar / gymnema-sylvestre case: the binomial slug renders more.
    const content = (slug) =>
      slug === 'glycyrrhiza-glabra'
        ? { built: true, bytes: 100_000, pmids: 6 }
        : { built: true, bytes: 100_000, pmids: 1 }
    const plan = proposeResolution(pair, audit(), { content })
    expect(plan.proposals[0].survivor).toBe('glycyrrhiza-glabra')
    expect(plan.proposals[0].basis).toMatch(/content decides/)
  })

  it('does not override the precedent for a one-citation difference', () => {
    const content = (slug) =>
      slug === 'glycyrrhiza-glabra'
        ? { built: true, bytes: 100_000, pmids: 4 }
        : { built: true, bytes: 100_000, pmids: 3 }
    expect(proposeResolution(pair, audit(), { content }).proposals[0].survivor).toBe('licorice')
  })

  it('never keeps a side that has no built page', () => {
    // The angelica-sinensis case.
    const content = (slug) =>
      slug === 'licorice' ? { built: false, bytes: 0, pmids: 0 } : { built: true, bytes: 100_000, pmids: 3 }
    const plan = proposeResolution(pair, audit(), { content })
    expect(plan.proposals[0].survivor).toBe('glycyrrhiza-glabra')
    expect(plan.proposals[0].basis).toMatch(/no built page/)
  })

  it('excludes a part/preparation split from the merge proposals', () => {
    const parts = makeCanonical([
      publishedHerb({ slug: 'morus-alba', latin_name: 'Morus alba' }),
      publishedHerb({ slug: 'mulberry-leaf', latin_name: 'Morus alba' }),
    ])
    const plan = proposeResolution(
      parts,
      auditDuplicateOrganisms(parts, { redirects: new Map(), routes: new Set(['morus-alba', 'mulberry-leaf']) }),
      { content: evenly },
    )
    expect(plan.proposals).toHaveLength(0)
    expect(plan.not_duplicates).toHaveLength(1)
    expect(plan.not_duplicates[0].reason).toMatch(/part\/preparation/)
  })
})
