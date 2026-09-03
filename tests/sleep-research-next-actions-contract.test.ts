import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

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
})
