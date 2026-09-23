import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('components/seo/CompoundSourceHerbs.tsx', 'utf8')
const pageSource = readFileSync('app/compounds/[slug]/page.tsx', 'utf8')

describe('compound botanical context links', () => {
  it('uses accessible tap targets with visible focus treatment', () => {
    expect(source).toContain('min-h-11')
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('<span aria-hidden="true">→</span>')
  })

  it('derives atlas links from the compound record', () => {
    expect(source).toContain('getCompoundBySlug(compoundSlug)')
    expect(source).toContain('getAtlasProfileLinks(compound as RuntimeRecord)')
  })

  it('reuses the profile page\'s resolved compound while keeping a resolver fallback', () => {
    expect(source).toContain('compoundRecord?: RuntimeRecord')
    expect(source).toContain('compoundRecord ? Promise.resolve(compoundRecord) : getCompoundBySlug(compoundSlug)')
    expect(pageSource).toContain('compoundRecord={compound}')
  })

  it('does not show a generic atlas link for compounds without botanical relevance', () => {
    expect(source).toContain("link.href !== '/tools/botanical-activity-atlas/'")
    expect(source).toContain('hasSpecificAtlasPath || sourceHerbs.length > 0')
    expect(source).toContain('sourceHerbs.length === 0 && atlasLinks.length === 0')
  })

  it('preserves both source-herb and atlas discovery sections', () => {
    expect(source).toContain('Found in')
    expect(source).toContain('Compare active botanicals')
  })
})
