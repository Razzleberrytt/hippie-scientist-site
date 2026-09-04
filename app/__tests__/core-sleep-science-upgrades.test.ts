import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepCoreCitationOverrides } from '@/data/article-citation-overrides-sleep-core'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const CORE_SLEEP_SLUGS = [
  'sleep-onset-vs-sleep-maintenance',
  'subjective-vs-objective-sleep',
  'why-sleep-studies-disagree',
  'sleep-trackers-accuracy',
  'sleep-regularity-health',
  'weekend-catch-up-sleep',
  'how-much-sleep-do-adults-need',
  '90-minute-sleep-cycle-myth',
]

describe('core sleep science upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all eight pages', () => {
    for (const slug of CORE_SLEEP_SLUGS) {
      const override = sleepCoreCitationOverrides[slug]
      expect(override, `missing core sleep override for ${slug}`).toBeDefined()
      expect(override.relatedSlugs?.length, `${slug} needs curated relationships`).toBeGreaterThanOrEqual(4)
      expect(override.canonicalConcepts?.length, `${slug} needs canonical concepts`).toBeGreaterThanOrEqual(5)
      expect(override.decisionRows?.length, `${slug} needs decision rows`).toBeGreaterThanOrEqual(4)
      expect(override.faqAnswers?.length, `${slug} needs FAQ answers`).toBeGreaterThanOrEqual(3)

      const normalized = normalizeCitationMetadata({ slug })
      expect(normalized.decisionRows).toEqual(override.decisionRows)
      expect(normalized.faqAnswers).toEqual(override.faqAnswers)
    }
  })

  it('exposes batch-2 and core pages through one sleep aggregator', () => {
    expect(sleepCitationOverrides['sleep-paralysis']).toBeDefined()
    expect(sleepCitationOverrides['sleep-environment-evidence-guide']).toBeDefined()
    expect(sleepCitationOverrides['sleep-onset-vs-sleep-maintenance']).toBeDefined()
    expect(sleepCitationOverrides['90-minute-sleep-cycle-myth']).toBeDefined()
  })

  it('preserves the central myth and measurement boundaries', () => {
    expect(sleepCoreCitationOverrides['how-much-sleep-do-adults-need'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Not an exact rule',
          value: expect.stringMatching(/not a universal optimum|exactly eight hours/i),
        }),
      ]),
    )

    expect(sleepCoreCitationOverrides['90-minute-sleep-cycle-myth'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'What is false',
          value: expect.stringMatching(/universal fixed 90-minute duration/i),
        }),
      ]),
    )

    expect(sleepCoreCitationOverrides['sleep-trackers-accuracy'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Not a diagnostic substitute',
          value: expect.stringMatching(/cannot independently diagnose or rule out/i),
        }),
      ]),
    )
  })
})
