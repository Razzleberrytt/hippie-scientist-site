import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readPage = (name: string) => fs.readFileSync(path.join(process.cwd(), 'app', 'info', name, 'page.tsx'), 'utf8')
const freeGuide = readPage('free-guide')
const privacy = readPage('privacy')
const newsletter = readPage('newsletter')
const pages = [
  ['free guide', freeGuide],
  ['privacy', privacy],
  ['newsletter', newsletter],
] as const

describe('info support-page editorial parity', () => {
  it.each(pages)('%s uses the canonical hierarchy', (_name, source) => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain('section-frame')
    expect(source).toContain('chip-readable')
  })

  it.each(pages)('%s does not return to the old white/pale-brand/shadow layer', (_name, source) => {
    expect(source).not.toContain('bg-white/90')
    expect(source).not.toContain('bg-white/85')
    expect(source).not.toContain('bg-white/80')
    expect(source).not.toContain('bg-brand-50/60')
    expect(source).not.toContain('bg-brand-50/40')
    expect(source).not.toContain('border-brand-900/10')
    expect(source).not.toContain('shadow-sm')
    expect(source).not.toContain('hover:bg-white')
  })

  it('keeps the free guide educational rather than product-pushy', () => {
    expect(freeGuide).toContain('It is an educational framework')
    expect(freeGuide).toContain('not push readers toward a product')
    expect(freeGuide).toContain('SafetyDisclaimerBox')
    expect(freeGuide).toContain("AffiliateDisclosure variant='full'")
  })

  it('keeps the privacy page account, health-data, and unsubscribe boundaries visible', () => {
    expect(privacy).toContain('No account required')
    expect(privacy).toContain('does not require readers to submit personal health information')
    expect(privacy).toContain('unsubscribe option')
  })

  it('keeps the newsletter explicitly research-first instead of sales-first', () => {
    expect(newsletter).toContain('without sales-first ranking language')
    expect(newsletter).toContain('Any product or affiliate context should remain secondary')
  })
})
