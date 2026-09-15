import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('homepage mobile editorial cohesion', () => {
  it('loads the cohesion layer after the main mobile refinement layer', () => {
    const page = source('app/page.tsx')
    const refinement = page.indexOf("@/styles/homepage-mobile-refinement.css")
    const cohesion = page.indexOf("@/styles/homepage-mobile-cohesion.css")

    expect(refinement).toBeGreaterThan(-1)
    expect(cohesion).toBeGreaterThan(refinement)
  })

  it('keeps Research Lens in the same light editorial flow on phones', () => {
    const css = source('styles/homepage-mobile-cohesion.css')

    expect(css).toContain('@media (max-width: 767px)')
    expect(css).toContain('.hs-evidence-panel {')
    expect(css).toContain('border-top: 1px solid var(--home-line);')
    expect(css).toContain('border-radius: 0;')
    expect(css).toContain('background: transparent;')
    expect(css).toContain('color: var(--home-ink);')
    expect(css).toContain('.hs-evidence-signals {')
    expect(css).toContain('border-bottom: 1px solid var(--home-line);')
    expect(css).toContain('.hs-home-stats {')
    expect(css).toContain('margin-top: 0;')
    expect(css).not.toContain('#131817')
  })
})
