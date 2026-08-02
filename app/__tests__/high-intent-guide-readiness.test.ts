import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('high-intent guide readiness', () => {
  it('keeps completed guide sources free of editorial citation placeholders', () => {
    const pages = [
      'app/guides/sleep/sleep-stack-guide/page.tsx',
      'app/guides/anxiety/l-theanine-for-anxiety/page.tsx',
      'app/guides/herbs/rhodiola-extract-vs-powder/page.tsx',
    ]

    for (const page of pages) {
      expect(read(page)).not.toMatch(/References being compiled|Citations pending/i)
    }
  })

  it('keeps the rhodiola guide on the stable herbs route with one product module', () => {
    const source = read('app/guides/herbs/rhodiola-extract-vs-powder/page.tsx')

    expect(source).toContain('https://thehippiescientist.net/guides/herbs/rhodiola-extract-vs-powder')
    expect(source).toContain('<AffiliateProductBox')
    expect(source).not.toContain('RecommendationSection')
    expect(source).not.toMatch(/href="\/guides\/rhodiola-/)
  })

  it('uses the curated recommendation module instead of generic searches on the L-theanine guide', () => {
    const source = read('app/guides/anxiety/l-theanine-for-anxiety/page.tsx')

    expect(source).toContain("getRevenueProductSet('l-theanine')")
    expect(source).not.toContain('amazon.com/s?k=')
    expect(source).not.toContain('AFFILIATE_TAGS')
  })

  it('keeps the ADHD checklist CTA on both the hub and primary supplement guide', () => {
    expect(read('app/guides/adhd/page.tsx')).toContain('/lead-magnets/adhd-supplement-starter-checklist/')
    expect(read('app/guides/adhd/adhd-supplements/page.tsx')).toContain('<AdhdInlineCta type="checklist" />')
  })
})
