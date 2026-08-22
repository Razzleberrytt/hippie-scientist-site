import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/sleep/best-supplements-for-sleep/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('best sleep supplements evidence calibration', () => {
  it('anchors the broad guide to current direct evidence', () => {
    const text = source()
    for (const pmid of ['34559859', '40056718', '33865376', '40918053', '38359657', '31714321']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/datePublished="2026-06-16"/)
    expect(text).toMatch(/dateModified="2026-08-\d{2}"|UPDATED_DATE.*2026-08-/i)
  })

  it('keeps extract, population, comparator and duration directness visible', () => {
    const text = source()
    expect(text).toMatch(/ashwagandha/i)
    expect(text).toMatch(/placebo/i)
    expect(text).toMatch(/week|weeks/i)
    expect(text).toMatch(/extract/i)
  })

  it('keeps magnesium trial limitations visible', () => {
    const text = source()
    expect(text).toContain('33865376')
    expect(text).toMatch(/magnesium/i)
    expect(text).toMatch(/limited|low|small|modest|not significant/i)
  })

  it('does not restore symptom-to-supplement winner cards or fixed-dose selectors', () => {
    const text = source()
    expect(text).not.toContain('SLEEP_SUPPLEMENTS')
    expect(text).not.toMatch(/What should you choose first\?/i)
    expect(text).not.toMatch(/Typical dose context/i)
    expect(text).not.toMatch(/L-Theanine.{0,160}100[–-]200 mg.*30[–-]60 minutes before bed/i)
    expect(text).not.toMatch(/Valerian Root.{0,160}300[–-]600 mg before bed/i)
  })

  it('keeps evidence limitations visible across ingredients', () => {
    const text = source()
    for (const ingredient of ['Melatonin', 'Ashwagandha', 'L-theanine', 'Magnesium', 'Valerian', 'Passionflower']) {
      expect(text.toLowerCase()).toContain(ingredient.toLowerCase())
    }
    expect(text).toMatch(/limited|preliminary|heterogeneous|context-specific|uncertain/i)
  })

  it('preserves safety and chronic-insomnia boundaries', () => {
    const text = source()
    expect(text).toMatch(/CBT-I/i)
    expect(text).toMatch(/chronic insomnia/i)
    expect(text).toMatch(/pregnan|kidney|liver|blood thinner|epilep/i)
  })

  it('rejects evidence-free stacks and one-sided broad-page monetization', () => {
    const text = source()
    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).not.toContain('magnesiumProducts')
    expect(text).not.toMatch(/amazon\.com/i)
    expect(text).toMatch(/combination|stack|synergy/i)
    expect(text).toMatch(/EmailCapture|NewsletterCtaBlock/)
  })
})
