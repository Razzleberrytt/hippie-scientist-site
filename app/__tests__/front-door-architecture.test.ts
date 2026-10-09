import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { primaryNavigation } from '../../lib/primary-navigation'
import { siteDestinations } from '../../lib/site-destinations'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('front-door information architecture', () => {
  it('defines exactly the canonical five destinations in navigation order', () => {
    expect(siteDestinations.map(({ label, href }) => ({ label, href }))).toEqual([
      { label: 'Goals', href: '/goals' },
      { label: 'Guides', href: '/guides' },
      { label: 'Ingredients', href: '/herbs' },
      { label: 'Safety', href: '/safety-checker' },
      { label: 'Research', href: '/research' },
    ])

    expect(primaryNavigation.map(({ label, href }) => ({ label, href }))).toEqual(
      siteDestinations.map(({ label, href }) => ({ label, href })),
    )
  })

  it('keeps the five-destination taxonomy canonical while Home progressively discloses it through Explore', () => {
    const home = read('components/homepage-v2.tsx')
    const explore = read('app/explore/page.tsx')
    const start = read('app/start/page.tsx')

    expect(home).toContain("href='/explore/'")
    expect(home).not.toContain('<SiteDestinationGrid />')
    expect(start).toContain('<SiteDestinationGrid />')
    expect(explore).toContain("href: '/goals/'")
    expect(explore).toContain("href: '/safety-checker/'")
    expect(explore).toContain("href: '/research/'")
    expect(home).not.toContain('const comparisons')
    expect(home).not.toContain('const principles')
    expect(start).not.toContain('const paths')
  })

  it('gives a first-time reader a specific ingredient, comparison, and safety choice without replacing the research library', () => {
    const home = read('components/homepage-v2.tsx')

    expect(home).toContain('Which supplements actually work—and what does the research say about their risks?')
    expect(home).toContain('When the research cannot establish an answer, we say so.')
    expect(home).toContain("aria-label='Choose your first step'")
    expect(home).toContain('min-h-12')
    expect(home).toContain('focus-visible:outline')

    for (const [label, href] of [
      ['Find an ingredient', '/herbs/'],
      ['Compare options', '/guides/compare/'],
      ['Check safety concerns', '/safety-checker/'],
    ]) {
      expect(home).toContain(`label: '${label}'`)
      expect(home).toContain(`href: '${href}'`)
    }

    expect(home).toContain("action='/search/'")
    expect(home).toContain("href='/explore/'")
    expect(home).toContain('getPublicSiteMetrics()')
    expect(home).toContain('getResearchSourceRegisterSummary()')
    expect(home).toContain('research-only identities')
  })

  it('keeps Library exhaustive while grouping by the same five destinations plus Site Information', () => {
    const library = read('app/library/page.tsx')

    for (const id of ['goals', 'guides', 'ingredients', 'safety', 'research']) {
      expect(library).toContain(`id: '${id}'`)
    }

    expect(library).toContain('Site Information')
    expect(library).toContain('<details')
    expect(library).toContain('Search everything')
  })
})
