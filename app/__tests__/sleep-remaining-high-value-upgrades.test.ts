import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepRemainingCitationOverrides } from '@/data/article-citation-overrides-sleep-remaining'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const REMAINING_SLUGS = [
  'ptsd-nightmares-and-sleep',
  'sleepwalking-nrem-parasomnias',
  'narcolepsy-excessive-daytime-sleepiness',
  'idiopathic-hypersomnia-vs-narcolepsy',
  'nocturia-and-sleep',
  'eye-masks-earplugs-and-sleep',
  'bedroom-air-quality-ventilation-and-sleep',
]

describe('remaining high-value sleep page upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all seven pages', () => {
    for (const slug of REMAINING_SLUGS) {
      const override = sleepRemainingCitationOverrides[slug]
      expect(override, `missing remaining sleep override for ${slug}`).toBeDefined()
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

  it('keeps PTSD insomnia, nightmares, and core PTSD symptoms as separate treatment targets', () => {
    expect(sleepRemainingCitationOverrides['ptsd-nightmares-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Insomnia target',
          value: expect.stringMatching(/sleep gains do not automatically mean.*PTSD symptoms/i),
        }),
        expect.objectContaining({
          label: 'Treatment-target boundary',
          value: expect.stringMatching(/overlapping but different targets.*not.*interchangeable/i),
        }),
      ]),
    )
  })

  it('keeps NREM sleepwalking distinct from REM dream enactment and prioritizes safety', () => {
    expect(sleepRemainingCitationOverrides['sleepwalking-nrem-parasomnias'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Physiology',
          value: expect.stringMatching(/NREM.*different from REM/i),
        }),
        expect.objectContaining({
          label: 'First priority',
          value: expect.stringMatching(/injury prevention.*adequate sleep opportunity.*trigger/i),
        }),
      ]),
    )
  })

  it('keeps narcolepsy diagnostic testing above ordinary tiredness and protects MSLT confounders', () => {
    expect(sleepRemainingCitationOverrides['narcolepsy-excessive-daytime-sleepiness'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Core disorder',
          value: expect.stringMatching(/neurologic disorder.*not simply severe tiredness/i),
        }),
        expect.objectContaining({
          label: 'Testing boundary',
          value: expect.stringMatching(/insufficient sleep.*shift work.*circadian disorders.*misleading MSLT/i),
        }),
      ]),
    )
  })

  it('keeps idiopathic hypersomnia versus narcolepsy type 2 as a diagnostic gray zone', () => {
    expect(sleepRemainingCitationOverrides['idiopathic-hypersomnia-vs-narcolepsy'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Type 1 separation',
          value: expect.stringMatching(/cataplexy.*orexin deficiency.*narcolepsy type 1/i),
        }),
        expect.objectContaining({
          label: 'Gray-zone boundary',
          value: expect.stringMatching(/MSLT test-retest reliability is limited.*unstable number of SOREMPs/i),
        }),
      ]),
    )
  })

  it('keeps nocturia multi-mechanistic rather than bladder-only', () => {
    expect(sleepRemainingCitationOverrides['nocturia-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Symptom, not one diagnosis',
          value: expect.stringMatching(/nighttime urine production.*storage.*sleep disorder/i),
        }),
        expect.objectContaining({
          label: 'Direction can reverse',
          value: expect.stringMatching(/wakes because sleep is disrupted.*already awake/i),
        }),
      ]),
    )
  })

  it('keeps ICU eye-mask and earplug evidence from becoming a universal home rule', () => {
    expect(sleepRemainingCitationOverrides['eye-masks-earplugs-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Strongest setting',
          value: expect.stringMatching(/ICUs.*bright or noisy/i),
        }),
        expect.objectContaining({
          label: 'Home generalization boundary',
          value: expect.stringMatching(/smaller.*already dark and quiet bedroom/i),
        }),
      ]),
    )
  })

  it('keeps bedroom CO2 as a ventilation marker without a magic threshold or open-window rule', () => {
    expect(sleepRemainingCitationOverrides['bedroom-air-quality-ventilation-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'CO2 interpretation',
          value: expect.stringMatching(/marker of ventilation and occupancy.*rather than proving/i),
        }),
        expect.objectContaining({
          label: 'Threshold boundary',
          value: expect.stringMatching(/does not establish one universal clinical bedroom-CO2 target/i),
        }),
        expect.objectContaining({
          label: 'Open-window boundary',
          value: expect.stringMatching(/not universally better.*pollution.*noise.*allergens/i),
        }),
      ]),
    )
  })
})
