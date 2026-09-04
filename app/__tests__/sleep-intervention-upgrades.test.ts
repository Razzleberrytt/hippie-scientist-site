import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepInterventionCitationOverrides } from '@/data/article-citation-overrides-sleep-interventions'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const INTERVENTION_SLUGS = [
  'sleep-temperature-and-cooling',
  'warm-bath-shower-before-bed',
  'white-noise-and-sleep',
  'music-for-sleep',
  'weighted-blankets-for-sleep',
  'mindfulness-for-insomnia',
  'time-restricted-eating-and-sleep',
  'naps-and-nighttime-sleep',
]

describe('sleep environment and non-drug intervention upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all eight pages', () => {
    for (const slug of INTERVENTION_SLUGS) {
      const override = sleepInterventionCitationOverrides[slug]
      expect(override, `missing sleep intervention override for ${slug}`).toBeDefined()
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

  it('keeps excess heat separate from colder-is-always-better and cooling-product claims', () => {
    expect(sleepInterventionCitationOverrides['sleep-temperature-and-cooling'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'What does not follow',
          value: expect.stringMatching(/progressively colder|every cooling mattress/i),
        }),
      ]),
    )
  })

  it('keeps warm whole-body heating distinct from weaker foot-bath evidence', () => {
    expect(sleepInterventionCitationOverrides['warm-bath-shower-before-bed'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Generalization limit',
          value: expect.stringMatching(/hot-foot-bath meta-analysis was not significant/i),
        }),
      ]),
    )
  })

  it('keeps sound masking and subjective music benefits separate from sleep architecture', () => {
    expect(sleepInterventionCitationOverrides['white-noise-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Most defensible role',
          value: expect.stringMatching(/mask unpredictable environmental noise/i),
        }),
        expect.objectContaining({
          label: 'Important contradiction',
          value: expect.stringMatching(/pink noise could reduce REM sleep/i),
        }),
      ]),
    )
    expect(sleepInterventionCitationOverrides['music-for-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Weaker endpoints',
          value: expect.stringMatching(/objective sleep measures/i),
        }),
      ]),
    )
  })

  it('keeps weighted blanket subjective and objective evidence separate', () => {
    expect(sleepInterventionCitationOverrides['weighted-blankets-for-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Objective split',
          value: expect.stringMatching(/subjective and objective effects must remain separate/i),
        }),
        expect.objectContaining({
          label: 'Pooled stability',
          value: expect.stringMatching(/nonsignificant.*sensitivity analysis/i),
        }),
      ]),
    )
  })

  it('keeps mindfulness below CBT-I and distinguishes inactive from active controls', () => {
    expect(sleepInterventionCitationOverrides['mindfulness-for-insomnia'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Active-control test',
          value: expect.stringMatching(/much weaker.*active interventions/i),
        }),
        expect.objectContaining({
          label: 'CBT-I boundary',
          value: expect.stringMatching(/does not establish mindfulness as superior or equivalent/i),
        }),
      ]),
    )
  })

  it('keeps TRE controlled comparisons and nap timing/context boundaries explicit', () => {
    expect(sleepInterventionCitationOverrides['time-restricted-eating-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Controlled evidence',
          value: expect.stringMatching(/have not established a reliable improvement/i),
        }),
      ]),
    )
    expect(sleepInterventionCitationOverrides['naps-and-nighttime-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Avoid the blanket rule',
          value: expect.stringMatching(/neither.*never nap.*nor.*always healthy/i),
        }),
      ]),
    )
  })
})
