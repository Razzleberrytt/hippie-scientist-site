import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const FLAGSHIP = 'app/guides/sleep/best-natural-sleep-aids-that-work/page.tsx'
const SUPPLEMENTS = 'app/guides/sleep/best-supplements-for-sleep/page.tsx'
const HERBS = 'app/guides/sleep/best-herbs-for-sleep/page.tsx'
const HUB = 'app/guides/sleep/page.tsx'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('sleep citation winner intent protection', () => {
  it('preserves distinct canonical ownership for the three sleep winners', () => {
    const flagship = read(FLAGSHIP)
    const supplements = read(SUPPLEMENTS)
    const herbs = read(HERBS)

    expect(flagship).toContain("alternates: { canonical: '/guides/sleep/best-natural-sleep-aids-that-work/' }")
    expect(supplements).toContain("alternates: { canonical: '/guides/sleep/best-supplements-for-sleep/' }")
    expect(herbs).toContain("const SLUG = 'best-herbs-for-sleep'")
    expect(herbs).toContain('path: `/guides/sleep/${SLUG}`')
  })

  it('keeps the natural-sleep-aids flagship broader than supplement-only intent', () => {
    const flagship = read(FLAGSHIP)

    expect(flagship).toContain("{ id: 'natural-foundations', text: 'Natural approaches beyond supplements', level: 2 }")
    expect(flagship).toContain('CBT-I')
    expect(flagship).toContain('chronic insomnia')
  })

  it('keeps the supplement winner as a decision shortlist that routes to the broader flagship', () => {
    const supplements = read(SUPPLEMENTS)

    expect(supplements).toContain('Best Supplements for Sleep: Evidence-Ranked Shortlist')
    expect(supplements).toContain('This is the decision page, not the encyclopedia.')
    expect(supplements).toContain('href="/guides/sleep/best-natural-sleep-aids-that-work/"')
    expect(supplements).toContain('natural sleep aids flagship')
  })

  it('keeps the herb winner explicitly herb-focused and evidence-bounded', () => {
    const herbs = read(HERBS)

    expect(herbs).toContain('Best Herbs for Sleep: What Human Evidence Supports in 2026')
    expect(herbs).toContain('Evidence-first guide to ashwagandha, passionflower, valerian, chamomile, and lavender-related sleep evidence')
    expect(herbs).toContain('CBT-I remains the most strongly recommended treatment for insomnia')
  })

  it('keeps all three winners discoverable from the canonical sleep hub', () => {
    const hub = read(HUB)

    expect(hub).toContain("href: '/guides/sleep/best-natural-sleep-aids-that-work/'")
    expect(hub).toContain("href: '/guides/sleep/best-supplements-for-sleep/'")
    expect(hub).toContain("href: '/guides/sleep/best-herbs-for-sleep/'")
  })
})
