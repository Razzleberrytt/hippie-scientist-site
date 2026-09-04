import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepLifeStageCitationOverrides } from '@/data/article-citation-overrides-sleep-life-stage'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const LIFE_STAGE_SLUGS = [
  'teen-adolescent-sleep',
  'menopause-and-sleep',
  'pregnancy-postpartum-and-sleep',
  'sleep-in-older-adults',
  'chronic-pain-and-sleep',
  'migraine-and-sleep',
  'anxiety-and-sleep',
  'depression-and-sleep',
  'tinnitus-and-sleep',
]

describe('sleep life-stage and comorbidity upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all nine pages', () => {
    for (const slug of LIFE_STAGE_SLUGS) {
      const override = sleepLifeStageCitationOverrides[slug]
      expect(override, `missing sleep life-stage override for ${slug}`).toBeDefined()
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

  it('keeps adolescent circadian biology separate from laziness and disorder', () => {
    expect(sleepLifeStageCitationOverrides['teen-adolescent-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Biology matters',
          value: expect.stringMatching(/biological-social mismatch.*rather than simple laziness/i),
        }),
        expect.objectContaining({
          label: 'Timing-tool boundary',
          value: expect.stringMatching(/late chronotype is not automatically DSWPD/i),
        }),
      ]),
    )
  })

  it('keeps menopause sleep disturbance multi-causal and hormone therapy individualized', () => {
    expect(sleepLifeStageCitationOverrides['menopause-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Not one mechanism',
          value: expect.stringMatching(/vasomotor symptoms.*chronic insomnia.*OSA.*restless legs/i),
        }),
        expect.objectContaining({
          label: 'Hormone-therapy boundary',
          value: expect.stringMatching(/objective sleep changes are less consistent.*individualized/i),
        }),
      ]),
    )
  })

  it('keeps postpartum sleep deprivation distinct from insomnia and depression prevention', () => {
    expect(sleepLifeStageCitationOverrides['pregnancy-postpartum-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Postpartum distinction',
          value: expect.stringMatching(/sleep deprivation.*does not have insomnia disorder/i),
        }),
        expect.objectContaining({
          label: 'Mental-health boundary',
          value: expect.stringMatching(/has not been shown to reliably prevent postpartum depression/i),
        }),
      ]),
    )
  })

  it('keeps age-related sleep change separate from dismissing treatable insomnia and apnea', () => {
    expect(sleepLifeStageCitationOverrides['sleep-in-older-adults'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Normal aging',
          value: expect.stringMatching(/persistent insomnia is not simply an untreatable consequence/i),
        }),
        expect.objectContaining({
          label: 'Breathing boundary',
          value: expect.stringMatching(/OSA is common.*adding sedation.*miss/i),
        }),
      ]),
    )
  })

  it('keeps better sleep from being sold as a chronic-pain cure', () => {
    expect(sleepLifeStageCitationOverrides['chronic-pain-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Pain-outcome boundary',
          value: expect.stringMatching(/should not be promised to erase chronic pain/i),
        }),
      ]),
    )
  })

  it('keeps migraine subjective sleep, CBT-I, and OSA clues in separate evidence lanes', () => {
    expect(sleepLifeStageCitationOverrides['migraine-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Measurement boundary',
          value: expect.stringMatching(/subjective sleep problems.*objective PSG.*heterogeneous/i),
        }),
        expect.objectContaining({
          label: 'OSA clue boundary',
          value: expect.stringMatching(/morning headache alone does not diagnose sleep apnea/i),
        }),
      ]),
    )
  })

  it('keeps insomnia treatment from replacing anxiety- or depression-specific care', () => {
    expect(sleepLifeStageCitationOverrides['anxiety-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Treatment-target boundary',
          value: expect.stringMatching(/insomnia treatment does not replace anxiety-specific care/i),
        }),
      ]),
    )
    expect(sleepLifeStageCitationOverrides['depression-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Treatment-target boundary',
          value: expect.stringMatching(/does not replace assessment and treatment of major depression/i),
        }),
      ]),
    )
  })

  it('keeps tinnitus loudness, sound masking, and insomnia treatment distinct', () => {
    expect(sleepLifeStageCitationOverrides['tinnitus-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Loudness is not severity',
          value: expect.stringMatching(/loudness alone does not explain.*severe insomnia/i),
        }),
        expect.objectContaining({
          label: 'Sound boundary',
          value: expect.stringMatching(/masking tinnitus is not the same as treating chronic insomnia/i),
        }),
      ]),
    )
  })
})
