import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getActivePrimaryNavigationItem } from '../../lib/primary-navigation'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('ingredient lookup information architecture', () => {
  it('shares lookup navigation across first and paginated Herbs and Compounds plus Search and Evidence Lookup', () => {
    expect(read('app/herbs/page.tsx')).toContain("LookupFamilyNav active='herbs'")
    expect(read('app/herbs/page/[page]/page.tsx')).toContain("LookupFamilyNav active='herbs'")
    expect(read('app/compounds/page.tsx')).toContain("LookupFamilyNav active='compounds'")
    expect(read('app/compounds/page/[page]/page.tsx')).toContain("LookupFamilyNav active='compounds'")
    expect(read('app/search/page.tsx')).toContain("LookupFamilyNav active='search'")
    expect(read('app/evidence/evidence-checker/page.tsx')).toContain("LookupFamilyNav active='evidence'")
  })

  it('keeps lookup surfaces focused on lookup instead of duplicating guide directories', () => {
    const herbs = read('app/herbs/HerbsIndexClient.tsx')
    const compounds = read('app/compounds/CompoundsIndexClient.tsx')
    const search = read('app/search/page.tsx')

    expect(herbs).not.toContain('Common starting points')
    expect(compounds).not.toContain('Common starting points')
    expect(compounds).not.toContain('Explore compound profiles')
    expect(search).not.toContain('Browse by goal')
    expect(search).not.toContain('Research tools')
  })

  it('describes Search according to the content actually present in the search index', () => {
    const search = read('app/search/page.tsx')
    const lookupNav = read('components/navigation/LookupFamilyNav.tsx')
    const primaryNav = read('lib/primary-navigation.ts')

    expect(search).toContain('Search profiles & learning')
    expect(search).toContain('herb and compound profiles plus educational pages')
    expect(search).not.toContain('profiles, guides, and educational')
    expect(lookupNav).toContain("label: 'Search'")
    expect(lookupNav).not.toContain("label: 'Search all'")
    expect(primaryNav).toContain("label: 'Search profiles & learning'")
  })

  it('keeps narrow-phone lookup navigation compact without removing destinations', () => {
    const lookupNav = read('components/navigation/LookupFamilyNav.tsx')

    expect(lookupNav).toContain("grid grid-cols-2 gap-2 lg:grid-cols-4")
    expect(lookupNav).toContain("hidden text-xs leading-5 text-muted sm:block")
    expect(lookupNav).toContain("hidden rounded-full")
    expect(lookupNav).toContain("sm:inline-flex")
    expect(lookupNav).toContain("min-h-14")
  })

  it('owns search under Ingredients while Evidence Lookup remains Research-owned', () => {
    expect(getActivePrimaryNavigationItem('/search/')?.label).toBe('Ingredients')
    expect(getActivePrimaryNavigationItem('/evidence/evidence-checker/')?.label).toBe('Research')
  })
})
