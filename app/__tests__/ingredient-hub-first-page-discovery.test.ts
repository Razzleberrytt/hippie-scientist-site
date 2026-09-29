import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('ingredient hub first-page discovery contract', () => {
  const herbs = read('app/herbs/HerbsIndexClient.tsx')
  const compounds = read('app/compounds/CompoundsIndexClient.tsx')

  it('shows curated starting points on page one but not later paginated pages', () => {
    expect(herbs).toContain("const showFeatured = !hasActiveFilters && (!paginated || page === 1)")
    expect(compounds).toContain("const showFeatured = !hasActiveFilters && (!paginated || page === 1)")
  })

  it('promotes only profiles already in the current paginated page', () => {
    expect(herbs).toContain("showFeatured ? (paginated ? herbs : baseHerbs).slice(0, 6) : []")
    expect(compounds).toContain("showFeatured ? (paginated ? compounds : baseCompounds).slice(0, 6) : []")
  })

  it('removes promoted profiles from the remaining page-one directory', () => {
    expect(herbs).toContain("herbs.filter((herb) => !featuredHerbSlugs.has(herb.slug))")
    expect(compounds).toContain("compounds.filter((compound) => !featuredCompoundSlugs.has(compound.slug))")
  })

  it('does not claim safety contributes to the compound featured score', () => {
    expect(compounds).toContain('Sorted by evidence signals, profile readiness, and practical browse value.')
    expect(compounds).not.toContain('Sorted by evidence, safety, and profile readiness.')
  })
})
