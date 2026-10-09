import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const foundation = read('styles/premium-foundation.css')
const surfaces = read('styles/premium-surfaces.css')
const controls = read('styles/premium-controls.css')
const chrome = read('styles/premium-chrome.css')
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

  it('keeps the homepage hero as an unmistakable flagship composition', () => {
    expect(homepage).toContain("className='hero-shell rounded-[2rem] border px-5 py-7 sm:p-10'")
    expect(homepage).toContain('Which supplements actually work—and what does the research say about their risks?')
    expect(homepage).toContain("aria-label='Choose your first step'")
    expect(homepage).toContain("label: 'Find an ingredient'")
    expect(homepage).toContain("label: 'Compare options'")
    expect(homepage).toContain("label: 'Check safety concerns'")
    expect(homepage).toContain("bg-[var(--surface-elevated)]")
    expect(homepage).toContain("role='search'")
    expect(homepage).toContain("href='/explore/'")
    expect(homepage).not.toContain('<SiteDestinationGrid />')
    expect(homepage).toContain("id='home-trust-heading'")
    expect(homepage).toContain('getPublicSiteMetrics')
  })

  it('renders the canonical destination chooser as a balanced responsive decision grid', () => {
    const destinations = read('components/navigation/SiteDestinationGrid.tsx')

    expect(destinations).toContain('siteDestinations.map')
    expect(destinations).toContain("className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'")
    expect(destinations).toContain("className='card-premium group flex min-h-[12rem] flex-col p-5")
  })

  it('keeps obsolete homepage comparison and methodology mini-hubs retired', () => {
    expect(homepage).not.toContain('const comparisons')
    expect(homepage).not.toContain('const principles')
    expect(homepage).not.toContain('hs-comparison-index')
  })

  it('retains reduced-motion support across shared and homepage interactions', () => {
    expect(surfaces).toContain('@media (prefers-reduced-motion: reduce)')
    expect(controls).toContain('@media (prefers-reduced-motion: reduce)')
    expect(chrome).toContain('@media (prefers-reduced-motion: reduce)')
    expect(homeVisual).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
