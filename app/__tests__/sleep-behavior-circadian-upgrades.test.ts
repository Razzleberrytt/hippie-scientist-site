import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepBehaviorCitationOverrides } from '@/data/article-citation-overrides-sleep-behavior'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const BEHAVIOR_SLUGS = [
  'caffeine-and-sleep-timing',
  'alcohol-and-sleep',
  'cannabis-cannabinoids-and-sleep',
  'nicotine-vaping-and-sleep',
  'morning-light-and-sleep-timing',
  'melatonin-timing-vs-dose',
  'blue-light-screens-and-sleep',
  'exercise-timing-and-sleep',
]

describe('sleep behavior and circadian upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all eight pages', () => {
    for (const slug of BEHAVIOR_SLUGS) {
      const override = sleepBehaviorCitationOverrides[slug]
      expect(override, `missing behavior sleep override for ${slug}`).toBeDefined()
      expect(override.relatedSlugs?.length, `${slug} needs curated relationships`).toBeGreaterThanOrEqual(4)
      expect(override.canonicalConcepts?.length, `${slug} needs canonical concepts`).toBeGreaterThanOrEqual(5)
      expect(override.decisionRows?.length, `${slug} needs decision rows`).toBeGreaterThanOrEqual(4)
      expect(override.faqAnswers?.length, `${slug} needs FAQ answers`).toBeGreaterThanOrEqual(3)

      const normalized = normalizeCitationMetadata({ slug })
      expect(normalized.decisionRows).toEqual(override.decisionRows)
      expect(normalized.faqAnswers).toEqual(override.faqAnswers)
      expect(sleepCitationOverrides[slug]).toBe(override)
    }
  })

  it('keeps alcohol sedation separate from restorative sleep', () => {
    expect(sleepBehaviorCitationOverrides['alcohol-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Early-night effect',
          value: expect.stringMatching(/sedation is not the same endpoint as restorative sleep/i),
        }),
      ]),
    )
  })

  it('keeps cannabinoid evidence formulation-specific and non-universal', () => {
    expect(sleepBehaviorCitationOverrides['cannabis-cannabinoids-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Formulation matters',
          value: expect.stringMatching(/different interventions|not be transferred automatically/i),
        }),
      ]),
    )
  })

  it('keeps melatonin timing and dose from becoming a universal prescription', () => {
    expect(sleepBehaviorCitationOverrides['melatonin-timing-vs-dose'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Dose is not linear',
          value: expect.stringMatching(/not automatically more effective|not universal personal dosing instructions/i),
        }),
      ]),
    )
  })

  it('rejects blanket screen and nighttime-exercise rules', () => {
    expect(sleepBehaviorCitationOverrides['blue-light-screens-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Not only wavelength',
          value: expect.stringMatching(/brightness|content|staying up later/i),
        }),
      ]),
    )
    expect(sleepBehaviorCitationOverrides['exercise-timing-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'General rule',
          value: expect.stringMatching(/does not justify a blanket ban/i),
        }),
      ]),
    )
  })
})
