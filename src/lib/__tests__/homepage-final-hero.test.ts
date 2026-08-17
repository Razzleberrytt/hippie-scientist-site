import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()
const homeSource = fs.readFileSync(path.join(ROOT, 'components', 'homepage-v2.tsx'), 'utf8')
const finalStyles = fs.readFileSync(path.join(ROOT, 'styles', 'homepage-premium-final.css'), 'utf8')

describe('final homepage hero source', () => {
  it('does not render decorative hero UI that the final design intentionally removed', () => {
    expect(homeSource).not.toContain("className='hs-dial'")
    expect(homeSource).not.toContain('hs-dial-ring')
    expect(homeSource).not.toContain('hs-dial-chip')
    expect(homeSource).not.toContain('hs-stat-num')
  })

  it('does not import build-report data solely for hidden homepage counts', () => {
    expect(homeSource).not.toContain('build-report.json')
    expect(homeSource).not.toContain('heroStats')
  })

  it('keeps the final stylesheet free of suppression rules for removed hero markup', () => {
    expect(finalStyles).not.toMatch(/\.hs-home\s+\.hs-dial\s*\{[^}]*display:\s*none/i)
    expect(finalStyles).not.toContain('.hs-home .hs-hero > dl:not(.hs-rail)')
  })

  it('keeps the hero answer-first with only the two intentional primary actions', () => {
    const heroStart = homeSource.indexOf("<section className='hs-hero")
    const heroEnd = homeSource.indexOf("<dl className='hs-rail", heroStart)
    const hero = homeSource.slice(heroStart, heroEnd)
    const links = [...hero.matchAll(/<Link\b/g)]

    expect(heroStart).toBeGreaterThanOrEqual(0)
    expect(heroEnd).toBeGreaterThan(heroStart)
    expect(links).toHaveLength(2)
    expect(hero).toContain("href='#choose-a-path'")
    expect(hero).toContain("href='/search/'")
  })
})
