import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  compareProtectedPageIdentity,
  identityFingerprint,
  normalizeUrlPath,
  outputHtmlPath,
  parseRedirectMap,
  parseRenderedPageIdentity,
  selectProtectedCitationAssets,
} from './ai-citation-protected-assets.mjs'

describe('AI citation protected asset selection', () => {
  it('uses minimum citations OR cumulative citation coverage', () => {
    const result = selectProtectedCitationAssets(
      [
        { url: '/a/', citations: 600 },
        { url: '/b/', citations: 200 },
        { url: '/c/', citations: 100 },
        { url: '/d/', citations: 100 },
      ],
      { minCitations: 250, cumulativeCitationShare: 0.75, maxAssets: 10 },
    )

    expect(result.assets.map((asset) => asset.url)).toEqual(['/a/', '/b/'])
    expect(result.assets[0].protectionReason).toEqual(['min_citations', 'cumulative_coverage'])
    expect(result.assets[1].protectionReason).toEqual(['cumulative_coverage'])
    expect(result.protectedCitationShare).toBeCloseTo(0.8)
  })

  it('selects the measured 2026-08-28 top nine under the default policy', () => {
    const citations = [3575, 2217, 497, 471, 322, 299, 259, 253, 251, 207, 179, 167]
    const result = selectProtectedCitationAssets(
      citations.map((count, index) => ({ url: `/asset-${index + 1}/`, citations: count })),
      { minCitations: 250, cumulativeCitationShare: 0.75, maxAssets: 25 },
    )

    expect(result.assets).toHaveLength(9)
    expect(result.assets.at(-1).citations).toBe(251)
    expect(result.assets.at(-1).protectionReason).toContain('cumulative_coverage')
  })
})

describe('rendered identity protection', () => {
  const baselineHtml = `<!doctype html>
    <html><head>
      <title>Best Natural Sleep Aids That Work: Evidence &amp; Safety</title>
      <link href="https://thehippiescientist.net/guides/sleep/best-natural-sleep-aids-that-work/" rel="canonical">
      <meta name="robots" content="index,follow">
    </head><body>
      <h1>Best Natural Sleep Aids That Work: What the Evidence Actually Supports</h1>
      <p>Body copy can change without changing identity.</p>
    </body></html>`

  const route = '/guides/sleep/best-natural-sleep-aids-that-work/'
  const expected = {
    ...parseRenderedPageIdentity(baselineHtml, route),
    redirectTarget: null,
  }

  it('extracts stable title, H1, canonical and indexability', () => {
    expect(expected).toMatchObject({
      status: 'ready',
      routePath: route,
      title: 'Best Natural Sleep Aids That Work: Evidence & Safety',
      h1: 'Best Natural Sleep Aids That Work: What the Evidence Actually Supports',
      canonical: `https://thehippiescientist.net${route}`,
      indexable: true,
    })
    expect(identityFingerprint(expected)).toMatch(/^[0-9a-f]{64}$/)
  })

  it('allows additive body-copy changes when identity is preserved', () => {
    const changedBody = baselineHtml.replace(
      'Body copy can change without changing identity.',
      'New evidence-bounded answer copy and internal links are allowed.',
    )
    const actual = { ...parseRenderedPageIdentity(changedBody, route), redirectTarget: null }
    expect(compareProtectedPageIdentity(expected, actual)).toEqual([])
  })

  it.each([
    ['title', baselineHtml.replace('<title>Best Natural', '<title>Rewritten Best Natural')],
    ['h1', baselineHtml.replace('<h1>Best Natural', '<h1>Rewritten Best Natural')],
    [
      'canonical',
      baselineHtml.replace(
        'https://thehippiescientist.net/guides/sleep/best-natural-sleep-aids-that-work/',
        'https://thehippiescientist.net/guides/sleep/new-owner/',
      ),
    ],
    ['indexable', baselineHtml.replace('content="index,follow"', 'content="noindex,follow"')],
  ])('detects %s drift', (field, html) => {
    const actual = { ...parseRenderedPageIdentity(html, route), redirectTarget: null }
    expect(compareProtectedPageIdentity(expected, actual).map((item) => item.field)).toContain(field)
  })

  it('detects a new redirect on a protected route', () => {
    const actual = { ...expected, redirectTarget: '/guides/sleep/new-owner/' }
    expect(compareProtectedPageIdentity(expected, actual).map((item) => item.field)).toContain('redirectTarget')
  })
})

describe('route helpers', () => {
  it('normalizes route paths and output locations', () => {
    expect(normalizeUrlPath('https://thehippiescientist.net/articles/valerian-root')).toBe('/articles/valerian-root/')
    expect(outputHtmlPath('/tmp/out', '/articles/valerian-root/')).toBe(
      path.join('/tmp/out', 'articles/valerian-root/index.html'),
    )
  })

  it('ignores host canonicalization rules and records path redirects', () => {
    const redirects = parseRedirectMap(`
      # comment
      https://www.thehippiescientist.net/guides/ https://thehippiescientist.net/guides/ 301
      /old-page/ /new-page/ 301
    `)
    expect(redirects.get('/old-page/')).toBe('/new-page/')
    expect(redirects.has('/guides/')).toBe(false)
  })
})
