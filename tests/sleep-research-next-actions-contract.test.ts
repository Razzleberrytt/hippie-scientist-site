import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'components', 'SleepResearchNextActions.tsx'), 'utf8')

describe('SleepResearchNextActions contract', () => {
  it('keeps canonical research and newsletter destinations', () => {
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
    expect(source).not.toMatch(/className="[^"]*\b(?:fixed|sticky)\b/)
  })
})
