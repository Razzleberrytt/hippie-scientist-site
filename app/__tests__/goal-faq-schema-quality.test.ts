import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(join(process.cwd(), 'app/goals/[slug]/page.tsx'), 'utf8')

describe('goal detail FAQ schema quality', () => {
  it('uses the canonical meaningful-answer filter before emitting FAQPage schema', () => {
    expect(source).toContain('isMeaningfulFaqAnswer')
    expect(source).toMatch(/faqItems\.filter\(\(item\)\s*=>\s*\n?\s*isMeaningfulFaqAnswer\(item\.answer\)/)
  })

  it('requires at least two meaningful FAQ items', () => {
    expect(source).toContain('meaningfulFaqItems.length >= 2')
  })

  it('passes only the filtered FAQ set into faqPageJsonLd', () => {
    expect(source).toContain('questions: meaningfulFaqItems.map')
    expect(source).not.toContain('questions: extension.faqItems.map')
  })
})
