import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { articleCitationOverrides } from '@/data/article-citation-overrides'

const ROOT = process.cwd()

const RECENT_SLEEP_SLUGS = [
  'sleep-debt-and-recovery',
  'daytime-sleepiness-vs-fatigue',
  'sleep-bruxism-and-sleep-apnea',
  'hypersomnolence-vs-insufficient-sleep',
  'sleep-apnea-in-women',
  'cpap-vs-oral-appliance-for-sleep-apnea',
  'home-sleep-apnea-test-vs-polysomnography',
]

describe('recent sleep citation graph', () => {
  it('keeps curated relationships and canonical concepts for every upgraded page', () => {
    for (const slug of RECENT_SLEEP_SLUGS) {
      const override = articleCitationOverrides[slug]
      expect(override, `missing citation override for ${slug}`).toBeDefined()
      expect(override.relatedSlugs?.length, `${slug} needs curated related pages`).toBeGreaterThanOrEqual(4)
      expect(override.canonicalConcepts?.length, `${slug} needs canonical concepts`).toBeGreaterThanOrEqual(5)
    }
  })

  it('keeps the new OSA decision pages connected bidirectionally where it matters', () => {
    expect(articleCitationOverrides['sleep-apnea-in-women'].relatedSlugs).toContain(
      'home-sleep-apnea-test-vs-polysomnography',
    )
    expect(articleCitationOverrides['home-sleep-apnea-test-vs-polysomnography'].relatedSlugs).toContain(
      'sleep-apnea-in-women',
    )
    expect(articleCitationOverrides['cpap-vs-oral-appliance-for-sleep-apnea'].relatedSlugs).toContain(
      'home-sleep-apnea-test-vs-polysomnography',
    )
  })

  it('preserves the 2026 umbrella-review update on bruxism and OSA', () => {
    const article = fs.readFileSync(
      path.join(ROOT, 'content/articles/sleep-bruxism-and-sleep-apnea.md'),
      'utf8',
    )

    expect(article).toContain('pmid: "42447651"')
    expect(article).toMatch(/2026 umbrella review/i)
    expect(article).toMatch(/not.*shortcut.*diagnos|not.*diagnos.*from the other/i)
  })
})
