import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'guides', 'page.tsx'), 'utf8')

describe('guides hub editorial parity', () => {
  it('uses the canonical hero, card, and section surfaces', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain('section-frame')
  })

  it('does not return to the old color-coded dashboard treatment', () => {
    expect(source).not.toContain('border-l-cyan-600')
    expect(source).not.toContain('border-l-blue-500')
    expect(source).not.toContain('border-l-indigo-500')
    expect(source).not.toContain('border-l-orange-500')
    expect(source).not.toContain('md:bg-white')
  })

  it('keeps every existing evidence-library destination in the hub', () => {
    const expectedRoutes = [
      '/guides/mental-health/',
      '/guides/adhd/',
      '/guides/sleep/',
      '/guides/stress/',
      '/guides/anxiety/',
      '/guides/focus/',
      '/guides/metabolic-health/',
      '/guides/herbs/',
      '/guides/compare/',
      '/guides/best/',
      '/learn/',
      '/guides/other/',
    ]

    for (const route of expectedRoutes) expect(source).toContain(`href: '${route}'`)
  })

  it('keeps keyboard-visible focus treatment on subject cards', () => {
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('Explore section')
  })
})
