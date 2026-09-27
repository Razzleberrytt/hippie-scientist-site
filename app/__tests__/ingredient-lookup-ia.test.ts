import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getActivePrimaryNavigationItem } from '../../lib/primary-navigation'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('ingredient lookup information architecture', () => {
  it('shares lookup navigation across Herbs, Compounds, Search, and Evidence Lookup', () => {
    expect(read('app/herbs/page.tsx')).toContain("LookupFamilyNav active='herbs'")
    expect(read('app/compounds/page.tsx')).toContain("LookupFamilyNav active='compounds'")
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

  it('owns sitewide search under Ingredients while Evidence Lookup remains Research-owned', () => {
    expect(getActivePrimaryNavigationItem('/search/')?.label).toBe('Ingredients')
    expect(getActivePrimaryNavigationItem('/evidence/evidence-checker/')?.label).toBe('Research')
  })
})
