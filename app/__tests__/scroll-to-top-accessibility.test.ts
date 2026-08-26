import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('scroll-to-top accessibility contract', () => {
  it('keeps the inactive global control out of both keyboard and accessibility navigation', () => {
    const source = read('src/components/ScrollToTopButton.tsx')

    expect(source).toContain('aria-hidden={!visible}')
    expect(source).toContain('tabIndex={visible ? 0 : -1}')
    expect(source).toContain("visible ? 'opacity-100' : 'pointer-events-none opacity-0'")
  })

  it('releases focus before activation can hide the control', () => {
    const source = read('src/components/ScrollToTopButton.tsx')

    expect(source).toContain('const scrollToTop = (event: React.MouseEvent<HTMLButtonElement>) => {')
    expect(source).toContain('event.currentTarget.blur()')
    expect(source.indexOf('event.currentTarget.blur()')).toBeLessThan(source.indexOf('window.scrollTo({ top: 0'))
  })

  it('preserves the localized label, touch target, and reduced-motion behavior', () => {
    const source = read('src/components/ScrollToTopButton.tsx')

    expect(source).toContain('aria-label={label}')
    expect(source).toContain('min-h-11 min-w-11')
    expect(source).toContain("window.matchMedia('(prefers-reduced-motion: reduce)').matches")
    expect(source).toContain("behavior: prefersReducedMotion ? 'auto' : 'smooth'")
  })
})
