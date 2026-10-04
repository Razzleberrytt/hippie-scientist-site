import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import sitemap from '../sitemap'
import { normalizeVisibilityRoute } from '@/lib/sitemap-route-visibility'

const article = fs.readFileSync(
  path.join(process.cwd(), 'content/articles/gruns-gummies-scientific-evidence-review.md'),
  'utf8',
)

describe('Grüns citation winner protection', () => {
  it('keeps the winning article indexable and sitemap-advertised', async () => {
    const entries = await sitemap()
    const paths = new Set(
      entries.map((entry) => normalizeVisibilityRoute(new URL(entry.url).pathname)),
    )

    expect(paths.has(normalizeVisibilityRoute('/articles/gruns-gummies-scientific-evidence-review/'))).toBe(true)
  })

  it('protects the stable identity and early direct answer', () => {
    expect(article).toContain('slug: gruns-gummies-scientific-evidence-review')
    expect(article).toContain('title: "Grüns Gummies Review: What the Scientific Evidence Actually Shows (2026)"')
    expect(article).toContain('profile_status: published')
    expect(article).toContain('> **Bottom line:** Grüns is not an evidence-free product.')
    expect(article.indexOf('> **Bottom line:**')).toBeLessThan(article.indexOf('## Evidence verdict at a glance'))
  })

  it('protects the finished-product evidence and transparency boundaries', () => {
    expect(article).toContain('useful finished-product evidence for **nutrient delivery**')
    expect(article).toContain('It is not the same as evidence that Grüns improves energy, immunity, cognition, digestion, longevity, disease risk, or overall health.')
    expect(article).toContain('8.7 g proprietary Core Nutrients Blend')
    expect(article).toContain('Does third-party testing prove the product works?')
    expect(article).toContain('**No.** Testing can support identity, contaminant, potency, or microbiological quality. It does not prove clinical benefit.')
  })
})
