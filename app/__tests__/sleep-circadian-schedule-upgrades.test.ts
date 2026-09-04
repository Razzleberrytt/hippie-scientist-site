import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepScheduleCitationOverrides } from '@/data/article-citation-overrides-sleep-schedule'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const SCHEDULE_SLUGS = [
  'night-owl-chronotype-vs-delayed-sleep-phase',
  'delayed-sleep-wake-phase-vs-insomnia',
  'jet-lag-light-melatonin-and-sleep',
  'shift-work-sleep-disorder',
  'teen-sleep-and-school-start-times',
  'sleep-inertia-grogginess-after-waking',
]

describe('sleep circadian and schedule upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all six pages', () => {
    for (const slug of SCHEDULE_SLUGS) {
      const override = sleepScheduleCitationOverrides[slug]
      expect(override, `missing sleep schedule override for ${slug}`).toBeDefined()
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

  it('keeps evening chronotype separate from clinically impairing DSWPD', () => {
    expect(sleepScheduleCitationOverrides['night-owl-chronotype-vs-delayed-sleep-phase'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Chronotype',
          value: expect.stringMatching(/not a disorder/i),
        }),
        expect.objectContaining({
          label: 'When DSWPD becomes different',
          value: expect.stringMatching(/required schedules.*meaningful impairment/i),
        }),
      ]),
    )
  })

  it('keeps later-normal sleep central to the delayed-phase vs insomnia boundary', () => {
    expect(sleepScheduleCitationOverrides['delayed-sleep-wake-phase-vs-insomnia'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Strong diagnostic clue',
          value: expect.stringMatching(/more normal.*later.*preferred schedule/i),
        }),
        expect.objectContaining({
          label: 'Circadian tools',
          value: expect.stringMatching(/neither.*generic bedtime sedative rule/i),
        }),
      ]),
    )
  })

  it('keeps jet-lag direction and short-trip strategy explicit', () => {
    expect(sleepScheduleCitationOverrides['jet-lag-light-melatonin-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Direction matters',
          value: expect.stringMatching(/eastward.*advancing.*westward.*delaying/i),
        }),
        expect.objectContaining({
          label: 'Short-trip boundary',
          value: expect.stringMatching(/full adaptation is not always desirable/i),
        }),
      ]),
    )
  })

  it('keeps shift-work management as a targeted toolbox and preserves post-nap safety', () => {
    expect(sleepScheduleCitationOverrides['shift-work-sleep-disorder'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Guideline approach',
          value: expect.stringMatching(/targeted toolbox.*rather than one universal fix/i),
        }),
        expect.objectContaining({
          label: 'Safety boundary',
          value: expect.stringMatching(/sleep inertia.*driving.*safety-sensitive/i),
        }),
      ]),
    )
  })

  it('keeps later school starts as a sleep-opportunity intervention rather than a universal teen treatment', () => {
    expect(sleepScheduleCitationOverrides['teen-sleep-and-school-start-times'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Best-supported effect',
          value: expect.stringMatching(/increase adolescent weekday sleep duration/i),
        }),
        expect.objectContaining({
          label: 'Treatment boundary',
          value: expect.stringMatching(/does not treat every case/i),
        }),
      ]),
    )
  })

  it('rejects universal nap-length and instant-reset claims for sleep inertia', () => {
    expect(sleepScheduleCitationOverrides['sleep-inertia-grogginess-after-waking'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Nap-rule boundary',
          value: expect.stringMatching(/20- to 30-minute rule.*context-dependent.*guarantee/i),
        }),
        expect.objectContaining({
          label: 'Countermeasure boundary',
          value: expect.stringMatching(/neither is a guaranteed instant reset/i),
        }),
      ]),
    )
  })
})
