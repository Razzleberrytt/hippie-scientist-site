import { describe, expect, it } from 'vitest'

import { canonical, classify, matchKey, toPath } from '../triage-404-export.mjs'

// Mirrors buildIndex() in the script.
function indexOf(routes) {
  const byKey = new Map()
  const bySegment = new Map()
  for (const route of routes) {
    const key = matchKey(route)
    byKey.set(key, route)
    const segment = key.split('/').filter(Boolean).pop() ?? ''
    if (!segment) continue
    if (!bySegment.has(segment)) bySegment.set(segment, [])
    bySegment.get(segment).push(route)
  }
  return { byKey, bySegment }
}

const ROUTES = [
  '/herbs/ashwagandha/',
  '/herbs/kava/',
  '/compounds/l-theanine/',
  '/compounds/artichoke-extract/',
  '/guides/adhd/iron-ferritin-and-adhd/',
  '/de/kraeuter/ashwagandha/',
  '/es/hierbas/ashwagandha/',
  '/articles/ashwagandha/',
]
const index = indexOf(ROUTES)

describe('toPath', () => {
  it('accepts site URLs on both the apex and www hosts', () => {
    expect(toPath('https://thehippiescientist.net/herbs/kava')).toBe('/herbs/kava')
    expect(toPath('https://www.thehippiescientist.net/herbs/kava')).toBe('/herbs/kava')
  })

  it('rejects other hosts so a stray row cannot become a redirect', () => {
    expect(toPath('https://example.com/herbs/kava')).toBeNull()
  })

  it('accepts bare paths and rejects non-paths', () => {
    expect(toPath('/herbs/kava')).toBe('/herbs/kava')
    expect(toPath('Aug 27, 2026')).toBeNull()
    expect(toPath('')).toBeNull()
  })
})

describe('canonical', () => {
  it('normalizes to a trailing slash and strips query/hash', () => {
    expect(canonical('/herbs/kava')).toBe('/herbs/kava/')
    expect(canonical('/herbs/kava/')).toBe('/herbs/kava/')
    expect(canonical('/herbs/kava?utm=x')).toBe('/herbs/kava/')
    expect(canonical('/')).toBe('/')
  })
})

describe('classify', () => {
  it('never emits a redirect from a path to itself', () => {
    // The single worst possible output: an infinite redirect loop on a page
    // that was already fine. A slashless export row canonicalizes onto a live
    // route, so it must be reported, not rewritten.
    const verdict = classify('/herbs/ashwagandha', index)
    expect(verdict.confidence).toBe('already-live')
    expect(canonical('/herbs/ashwagandha')).toBe(verdict.target)
  })

  it('fixes case and percent-encoding differences', () => {
    expect(classify('/Compounds/L-Theanine/', index)).toMatchObject({
      target: '/compounds/l-theanine/',
      confidence: 'exact',
    })
    expect(classify('/compounds/artichoke%20extract', index)).toMatchObject({
      target: '/compounds/artichoke-extract/',
      confidence: 'exact',
    })
  })

  it('follows a slug that moved to exactly one new location', () => {
    expect(classify('/articles/iron-ferritin-and-adhd', index)).toMatchObject({
      target: '/guides/adhd/iron-ferritin-and-adhd/',
      confidence: 'slug-moved',
    })
  })

  it('resolves a singular/plural section rename instead of guessing a locale', () => {
    // "ashwagandha" is live in eight places. Only /herbs/ is one edit from the
    // dead /herb/ section, so that is the honest answer.
    expect(classify('/herb/ashwagandha/', index)).toMatchObject({
      target: '/herbs/ashwagandha/',
      confidence: 'slug-moved',
    })
  })

  it('sends a genuinely ambiguous slug to review rather than picking one', () => {
    const verdict = classify('/wiki/ashwagandha/', index)
    expect(verdict.confidence).toBe('ambiguous')
    expect(verdict.target).toBeNull()
  })

  it('suggests a same-section typo fix as a reviewable near miss', () => {
    expect(classify('/herbs/ashwaganda/', index)).toMatchObject({
      target: '/herbs/ashwagandha/',
      confidence: 'near-miss',
    })
  })

  it('does not invent a target for a URL with no live equivalent', () => {
    // Redirecting these to a hub would be a soft 404, which is worse than the
    // 404 it replaces. Staying 404 is the correct answer.
    for (const dead of ['/totally-made-up-page/', '/old/legacy/thing/']) {
      const verdict = classify(dead, index)
      expect(verdict.confidence).toBe('none')
      expect(verdict.target).toBeNull()
    }
  })

  it('does not cross sections when fixing a typo', () => {
    // "l-theanin" is close to the live /compounds/l-theanine/, but the dead URL
    // claims to be a herb, so it must not be redirected into /compounds/.
    const verdict = classify('/herbs/l-theanin/', index)
    expect(verdict.target).not.toBe('/compounds/l-theanine/')
  })
})
