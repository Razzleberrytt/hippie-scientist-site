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

  it('uses the shared five-destination grid on Home and Start', () => {
    const home = read('components/homepage-v2.tsx')
    const start = read('app/start/page.tsx')

    expect(home).toContain('<SiteDestinationGrid />')
    expect(start).toContain('<SiteDestinationGrid />')
    expect(home).not.toContain('const comparisons')
    expect(home).not.toContain('const principles')
    expect(start).not.toContain('const paths')
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
