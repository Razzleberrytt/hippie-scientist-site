import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('components/monetization/NewsletterInterestSignup.tsx', 'utf8')

describe('NewsletterInterestSignup accessibility contract', () => {
  it('keeps research-interest choices keyboard-visible and stateful', () => {
    expect(source).toContain("role='group'")
    expect(source).toContain("aria-label='Newsletter research interest'")
    expect(source).toContain('aria-pressed={active}')
    expect(source).toContain('min-h-11')
    expect(source).toContain('focus-visible:outline-none')
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('focus-visible:ring-[color:var(--hs-gold)]')
    expect(source).toContain('focus-visible:ring-offset-2')
  })
})
