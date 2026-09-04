import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  sleepBatch2CitationOverrides,
  sleepRelationshipSlugAliases,
} from '@/data/article-citation-overrides-sleep-batch2'
import { normalizeCitationMetadata, resolveRelatedArticles } from '@/lib/article-citation-metadata'

const ROOT = process.cwd()
const BATCH2_SLUGS = [
  'advanced-sleep-wake-phase-disorder',
  'nasal-obstruction-snoring-and-sleep-apnea',
  'medications-and-sleep-effects',
  'sleep-paralysis',
  'rem-sleep-behavior-disorder',
  'sleep-environment-evidence-guide',
]

const article = (slug: string) => ({
  slug,
  title: slug,
  category: 'Sleep',
  url: `/articles/${slug}/`,
})

describe('adjacent sleep decision upgrades', () => {
  it('keeps decision, FAQ, semantic, and relationship metadata for all six pages', () => {
    for (const slug of BATCH2_SLUGS) {
      const override = sleepBatch2CitationOverrides[slug]
      expect(override, `missing batch-2 override for ${slug}`).toBeDefined()
      expect(override.relatedSlugs?.length, `${slug} needs curated relationships`).toBeGreaterThanOrEqual(4)
      expect(override.canonicalConcepts?.length, `${slug} needs canonical concepts`).toBeGreaterThanOrEqual(5)
      expect(override.decisionRows?.length, `${slug} needs decision rows`).toBeGreaterThanOrEqual(4)
      expect(override.faqAnswers?.length, `${slug} needs FAQ answers`).toBeGreaterThanOrEqual(3)

      const normalized = normalizeCitationMetadata({ slug })
      expect(normalized.decisionRows.length).toBeGreaterThanOrEqual(4)
      expect(normalized.faqAnswers.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('canonicalizes the two stale sleep relationship slugs', () => {
    expect(sleepRelationshipSlugAliases['medications-and-sleep']).toBe('medications-and-sleep-effects')
    expect(sleepRelationshipSlugAliases['nasal-obstruction-and-sleep-apnea']).toBe(
      'nasal-obstruction-snoring-and-sleep-apnea',
    )

    const pages = [
      article('daytime-sleepiness-vs-fatigue'),
      article('medications-and-sleep-effects'),
      article('cpap-vs-oral-appliance-for-sleep-apnea'),
      article('nasal-obstruction-snoring-and-sleep-apnea'),
      article('snoring-vs-sleep-apnea'),
      article('home-sleep-apnea-test-vs-polysomnography'),
      article('sleep-apnea-in-women'),
      article('sleep-position-osa-and-reflux'),
    ]

    expect(resolveRelatedArticles(pages[0], pages).map((page) => page.slug)).toContain(
      'medications-and-sleep-effects',
    )
    expect(resolveRelatedArticles(pages[2], pages).map((page) => page.slug)).toContain(
      'nasal-obstruction-snoring-and-sleep-apnea',
    )
  })

  it('keeps authored CPAP links on the canonical nasal-obstruction route', () => {
    const cpap = fs.readFileSync(
      path.join(ROOT, 'content/articles/cpap-vs-oral-appliance-for-sleep-apnea.md'),
      'utf8',
    )
    expect(cpap).not.toContain('/articles/nasal-obstruction-and-sleep-apnea/')
    expect(cpap).toContain('/articles/nasal-obstruction-snoring-and-sleep-apnea/')
  })
})
