import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/seo/HerbCompoundLinks.tsx'),
  'utf8',
)

describe('HerbCompoundLinks accessibility', () => {
  it('uses the shared primitives that own tap sizing and focus', () => {
    // Sizes and focus treatment are pinned in
    // components/ui/__tests__/editorial-primitives.test.ts and the global
    // focus baseline in styles/accessibility-wcag-22.css.
    expect(source).toContain('hs-chip')
    expect(source).toContain('hs-linklist')
  })

  it('lets long compound names wrap instead of clipping them in a rail', () => {
    expect(source).not.toContain('whitespace-nowrap')
    expect(source).not.toContain('overflow-x-auto')
  })

  it('keeps a clear directional action cue on atlas paths', () => {
    expect(source).toMatch(/<span aria-hidden="true" className="hs-linklist__arrow">→<\/span>/)
  })

  it('does not paint atlas links with the low-contrast emerald tint', () => {
    // The emerald-950-on-emerald-50 treatment failed AA once the dark theme
    // repainted the surface; token colours are used instead.
    expect(source).not.toContain('emerald-950')
    expect(source).not.toContain('bg-emerald-50')
  })
})
