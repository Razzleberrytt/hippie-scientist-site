import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'components', 'SleepResearchNextActions.tsx'), 'utf8')
const trackedLinkSource = fs.readFileSync(path.join(process.cwd(), 'components', 'SleepResearchNextActionLink.tsx'), 'utf8')
const analyticsSource = fs.readFileSync(path.join(process.cwd(), 'lib', 'sleep-next-actions-analytics.ts'), 'utf8')

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

  it('tracks both actions through a consent-gated non-blocking attribution contract', () => {
    expect(source).toContain("action: 'research-hub'")
    expect(source).toContain("action: 'newsletter-interest'")
    expect(trackedLinkSource).toContain('trackSleepNextActionClick')
    expect(analyticsSource).toContain('canTrackAnalytics()')
    expect(analyticsSource).toContain("'sleep_next_action_click'")
    expect(analyticsSource).toContain('source_path: params.sourcePath')
    expect(analyticsSource).toContain('Measurement must never block navigation.')
  })
})
