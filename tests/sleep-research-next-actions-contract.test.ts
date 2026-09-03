import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8')
const componentPath = path.join(process.cwd(), 'components', 'SleepResearchNextActions.tsx')
const source = fs.readFileSync(componentPath, 'utf8')

describe('SleepResearchNextActions contract', () => {
  it('keeps the canonical sleep hub and newsletter-interest destinations', () => {
    expect(source).toContain("href: '/guides/sleep/'")
    expect(source).toContain("href: '/info/newsletter/#research-interests'")
  })

  it('preserves labelled section semantics and visible keyboard focus', () => {
    expect(source).toContain('aria-labelledby="sleep-research-next-actions-heading"')
    expect(source).toContain('id="sleep-research-next-actions-heading"')
    expect(source).toContain('focus-visible:ring-2')
  })

  it('preserves mobile-safe target sizing without sticky or fixed obstruction', () => {
    expect(source).toContain('min-h-11')
    expect(source).not.toMatch(/\b(?:fixed|sticky)\b/)
  })

  it('keeps answer-first placement explicit for page integrations', () => {
    expect(source).toContain("Keep this after the page's direct answer and critical evidence/safety boundary.")
  })

  it('keeps magnesium next actions after references and bottom line but before existing email capture', () => {
    const page = read('app', 'guides', 'sleep', 'magnesium-vs-melatonin', 'page.tsx')
    expect(page.indexOf('<References refs={MAGNESIUM_VS_MELATONIN_REFS} />')).toBeLessThan(page.indexOf('<SleepResearchNextActions />'))
    expect(page.indexOf('id="bottom-line"')).toBeLessThan(page.indexOf('<SleepResearchNextActions />'))
    expect(page.indexOf('<SleepResearchNextActions />')).toBeLessThan(page.indexOf('<EmailCapture location="guides-magnesium-vs-melatonin"'))
  })

  it('keeps glycine next actions outside and after the complete page payload', () => {
    const layout = read('app', 'guides', 'sleep', 'glycine-for-sleep', 'layout.tsx')
    expect(layout.indexOf('{children}')).toBeLessThan(layout.indexOf('<SleepResearchNextActions />'))
  })

  it('keeps apigenin next actions after references', () => {
    const page = read('app', 'guides', 'sleep', 'apigenin-for-sleep', 'page.tsx')
    expect(page.indexOf('>References</h2>')).toBeLessThan(page.indexOf('<SleepResearchNextActions />'))
  })
})
