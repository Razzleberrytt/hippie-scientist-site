import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const primitives = readFileSync(join(process.cwd(), 'styles/editorial-primitives.css'), 'utf8')

/**
 * The shared vocabulary owns the accessibility guarantees that used to be
 * repeated as per-component Tailwind utilities. These assertions are the
 * single place those guarantees are pinned, so component tests can assert
 * "uses the primitive" instead of restating tap sizes and focus rules.
 */
describe('editorial primitives contract', () => {
  it('keeps navigation link rows at a full 44px tap target', () => {
    const rule = primitives.match(/\.hs-linklist a \{[\s\S]*?\}/)?.[0] || ''
    expect(rule).toContain('min-height: 2.75rem')
  })

  it('keeps chips tappable and wrapping instead of cropping', () => {
    const chip = primitives.match(/\.hs-chip \{[\s\S]*?\}/)?.[0] || ''
    const row = primitives.match(/\.hs-chips \{[\s\S]*?\}/)?.[0] || ''

    expect(chip).toContain('min-height: 2.5rem')
    expect(chip).toContain('overflow-wrap: anywhere')
    expect(row).toContain('flex-wrap: wrap')
    // A chip row must never become a horizontal rail again: that is what
    // pushed goal and cluster links permanently offscreen on narrow phones.
    expect(row).not.toContain('overflow-x')
    expect(row).not.toContain('nowrap')
  })

  it('keeps disclosure summaries at a full tap target with no nested card', () => {
    const summary = primitives.match(/details\.hs-disclosure > summary \{[\s\S]*?\}/)?.[0] || ''
    const disclosure = primitives.match(/details\.hs-disclosure \{[\s\S]*?\}/)?.[0] || ''

    expect(summary).toContain('min-height: 2.75rem')
    expect(disclosure).toContain('background: transparent')
    expect(disclosure).toContain('box-shadow: none')
  })

  it('derives every surface colour from tokens rather than fixed light-mode values', () => {
    // A literal #fff/white background is what left bare <details> painted white
    // in dark mode. Semantic tier colours on the caution band are exempt.
    const surfaces = primitives.replace(/\.hs-caution__step\[[\s\S]*?\}/g, '')
    expect(surfaces).not.toMatch(/background:\s*(#fff|#ffffff|white)\b/i)
  })

  it('respects reduced-motion for the only animated primitive', () => {
    expect(primitives).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
