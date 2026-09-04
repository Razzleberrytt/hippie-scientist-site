import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { articleCitationOverrides } from '@/data/article-citation-overrides'
import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'

const ROOT = process.cwd()

const ROOT_REGISTRY_SLEEP_SLUGS = [
  'sleep-debt-and-recovery',
  'daytime-sleepiness-vs-fatigue',
  'sleep-bruxism-and-sleep-apnea',
  'hypersomnolence-vs-insufficient-sleep',
  'sleep-apnea-in-women',
  'cpap-vs-oral-appliance-for-sleep-apnea',
  'home-sleep-apnea-test-vs-polysomnography',
]

function assertDecisionMetadata(slug: string, override: typeof sleepCitationOverrides[string]) {
  expect(override, `missing citation override for ${slug}`).toBeDefined()
  expect(override.relatedSlugs?.length, `${slug} needs curated related pages`).toBeGreaterThanOrEqual(4)
  expect(override.canonicalConcepts?.length, `${slug} needs canonical concepts`).toBeGreaterThanOrEqual(5)
  expect(override.decisionRows?.length, `${slug} needs decision rows`).toBeGreaterThanOrEqual(4)
  expect(override.faqAnswers?.length, `${slug} needs FAQ answers`).toBeGreaterThanOrEqual(3)

  for (const row of override.decisionRows ?? []) {
    expect(row.label.trim().length, `${slug} decision row needs a label`).toBeGreaterThan(2)
    expect(row.value.trim().length, `${slug} decision row needs a nontrivial value`).toBeGreaterThan(10)
  }

  for (const faq of override.faqAnswers ?? []) {
    expect(faq.question.trim().length, `${slug} FAQ needs a question`).toBeGreaterThan(8)
    expect(faq.answer.trim().length, `${slug} FAQ needs a substantive answer`).toBeGreaterThan(30)
  }

  expect(
    fs.existsSync(path.join(ROOT, 'content/articles', `${slug}.md`)),
    `${slug} decision metadata must map to a canonical article file`,
  ).toBe(true)
}

describe('sleep cluster decision coverage', () => {
  it('keeps at least 60 modular sleep overrides plus the seven earlier root-registry pages', () => {
    const modularSlugs = Object.keys(sleepCitationOverrides)

    expect(modularSlugs.length).toBeGreaterThanOrEqual(60)
    expect(ROOT_REGISTRY_SLEEP_SLUGS).toHaveLength(7)

    for (const slug of ROOT_REGISTRY_SLEEP_SLUGS) {
      expect(sleepCitationOverrides[slug], `${slug} should remain outside the modular sleep registry`).toBeUndefined()
      expect(articleCitationOverrides[slug], `missing root-registry sleep override for ${slug}`).toBeDefined()
    }

    const combined = new Set([...modularSlugs, ...ROOT_REGISTRY_SLEEP_SLUGS])
    expect(combined.size).toBeGreaterThanOrEqual(67)
  })

  it('keeps decision-quality metadata and canonical article files for the entire upgraded sleep graph', () => {
    for (const [slug, override] of Object.entries(sleepCitationOverrides)) {
      assertDecisionMetadata(slug, override)
    }

    for (const slug of ROOT_REGISTRY_SLEEP_SLUGS) {
      assertDecisionMetadata(slug, articleCitationOverrides[slug])
    }
  })

  it('keeps the sleep hub routed through the evidence matrix rather than supplement-only navigation', () => {
    const hub = fs.readFileSync(path.join(ROOT, 'app/guides/sleep/page.tsx'), 'utf8')

    expect(hub).toContain("href: '/articles/sleep-interventions-evidence-matrix/'")
    expect(hub).toContain("href: '/articles/cbt-i-vs-sleep-supplements/'")
    expect(hub).toContain("href: '/articles/insomnia-vs-sleep-deprivation/'")
    expect(hub).toContain("href: '/articles/sleep-environment-evidence-guide/'")
    expect(hub).toContain("href: '/articles/shift-work-sleep-disorder/'")
  })
})
