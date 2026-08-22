import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const foundation = read('styles/premium-foundation.css')
const surfaces = read('styles/premium-surfaces.css')
const controls = read('styles/premium-controls.css')
const chrome = read('styles/premium-chrome.css')
const homeStructure = read('styles/homepage-structure.css')
const homeVisual = read('styles/homepage-premium-final.css')
const homepage = read('components/homepage-v2.tsx')

describe('premium visual refinement contracts', () => {
  it('keeps the global paper treatment in the canonical foundation layer', () => {
    expect(foundation).toContain('background: var(--hs-canvas)')
    expect(foundation).toContain('background-image: radial-gradient(circle, var(--hs-dot)')
    expect(foundation).toContain('opacity: var(--hs-dot-opacity)')
  })

  it('keeps shared surfaces materially refined without creating another surface owner', () => {
    expect(surfaces).toContain('linear-gradient(180deg')
    expect(surfaces).toContain('var(--hs-lift)')
    expect(surfaces).toContain('html .section-frame')
    expect(surfaces).toContain('html .chip-readable')
  })

  it('preserves canonical controls and chrome as the only global presentation owners', () => {
    expect(controls).toContain('.button-primary')
    expect(controls).toContain('.button-secondary')
    expect(controls).toContain("[aria-disabled='true']")
    expect(chrome).toContain('.site-primary-nav')
    expect(chrome).toContain("a[aria-label^='The Hippie Scientist'] .editorial-icon-disc")
  })

  it('renders the homepage goal chooser as a balanced mobile decision matrix', () => {
    expect(homeStructure).toContain('@media (max-width: 767px)')
    expect(homeStructure).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(homeVisual).toContain('.hs-goal-link:nth-child(even)')
    expect(homeVisual).toContain('.hs-goal-link:nth-child(n + 3)')
  })

  it('keeps comparison rows visibly indexed without adding screen-reader noise', () => {
    expect(homepage).toContain("className='hs-comparison-index' aria-hidden='true'")
    expect(homepage).toContain("String(index + 1).padStart(2, '0')")
    expect(homeVisual).toContain('.hs-comparison-index')
  })

  it('retains reduced-motion support across shared and homepage interactions', () => {
    expect(surfaces).toContain('@media (prefers-reduced-motion: reduce)')
    expect(controls).toContain('@media (prefers-reduced-motion: reduce)')
    expect(chrome).toContain('@media (prefers-reduced-motion: reduce)')
    expect(homeVisual).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
