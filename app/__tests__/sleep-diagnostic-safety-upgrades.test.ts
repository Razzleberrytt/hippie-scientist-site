import { describe, expect, it } from 'vitest'

import { sleepCitationOverrides } from '@/data/article-citation-overrides-sleep'
import { sleepSafetyCitationOverrides } from '@/data/article-citation-overrides-sleep-safety'
import { normalizeCitationMetadata } from '@/lib/article-citation-metadata'

const SAFETY_SLUGS = [
  'cbt-i-vs-sleep-supplements',
  'insomnia-vs-sleep-deprivation',
  'sleep-apnea-vs-insomnia',
  'snoring-vs-sleep-apnea',
  'mouth-taping-for-sleep',
  'restless-legs-iron-and-sleep',
  'otc-antihistamines-for-sleep',
  'sleep-position-osa-and-reflux',
]

describe('sleep diagnostic and safety decision upgrades', () => {
  it('keeps decision, FAQ, relationship, and concept metadata for all eight pages', () => {
    for (const slug of SAFETY_SLUGS) {
      const override = sleepSafetyCitationOverrides[slug]
      expect(override, `missing sleep safety override for ${slug}`).toBeDefined()
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

  it('keeps CBT-I above supplement escalation for chronic insomnia', () => {
    expect(sleepSafetyCitationOverrides['cbt-i-vs-sleep-supplements'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Evidence benchmark',
          value: expect.stringMatching(/substantially stronger guideline support than any sleep supplement/i),
        }),
        expect.objectContaining({
          label: 'Not the same thing',
          value: expect.stringMatching(/sleep hygiene education alone is not CBT-I/i),
        }),
      ]),
    )
  })

  it('keeps adequate sleep opportunity central to the insomnia distinction', () => {
    expect(sleepSafetyCitationOverrides['insomnia-vs-sleep-deprivation'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Insomnia',
          value: expect.stringMatching(/despite adequate opportunity/i),
        }),
        expect.objectContaining({
          label: 'Treatment consequence',
          value: expect.stringMatching(/different interventions.*can coexist/i),
        }),
      ]),
    )
  })

  it('keeps sedation separate from airway treatment and COMISA explicit', () => {
    expect(sleepSafetyCitationOverrides['sleep-apnea-vs-insomnia'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'They can coexist',
          value: expect.stringMatching(/COMISA/i),
        }),
        expect.objectContaining({
          label: 'Sedation boundary',
          value: expect.stringMatching(/does not open an obstructed airway/i),
        }),
      ]),
    )
  })

  it('keeps snoring and consumer tools below the OSA diagnostic boundary', () => {
    expect(sleepSafetyCitationOverrides['snoring-vs-sleep-apnea'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Screening boundary',
          value: expect.stringMatching(/cannot independently diagnose or exclude OSA/i),
        }),
        expect.objectContaining({
          label: 'Negative-test boundary',
          value: expect.stringMatching(/may not close the case/i),
        }),
      ]),
    )
  })

  it('keeps mouth taping narrow and preserves nasal-obstruction safety', () => {
    expect(sleepSafetyCitationOverrides['mouth-taping-for-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Evidence size',
          value: expect.stringMatching(/10 eligible studies.*213 total patients/i),
        }),
        expect.objectContaining({
          label: 'Safety boundary',
          value: expect.stringMatching(/nasal obstruction.*unrecognized sleep-disordered breathing/i),
        }),
      ]),
    )
  })

  it('keeps RLS iron evaluation laboratory-guided rather than generic', () => {
    expect(sleepSafetyCitationOverrides['restless-legs-iron-and-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Guideline focus',
          value: expect.stringMatching(/ferritin and transferrin saturation/i),
        }),
        expect.objectContaining({
          label: 'Safety boundary',
          value: expect.stringMatching(/not a generic sleep supplement.*not be started blindly/i),
        }),
      ]),
    )
  })

  it('keeps OTC antihistamine sedation separate from chronic-insomnia evidence', () => {
    expect(sleepSafetyCitationOverrides['otc-antihistamines-for-sleep'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'What sedation does not prove',
          value: expect.stringMatching(/not the same as strong, durable evidence/i),
        }),
        expect.objectContaining({
          label: 'Tradeoffs',
          value: expect.stringMatching(/tolerance.*anticholinergic burden.*next-day impairment/i),
        }),
      ]),
    )
  })

  it('rejects a universal best sleep position', () => {
    expect(sleepSafetyCitationOverrides['sleep-position-osa-and-reflux'].decisionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'No universal best side',
          value: expect.stringMatching(/specific mechanism.*not.*healthiest for everyone/i),
        }),
        expect.objectContaining({
          label: 'Generalization boundary',
          value: expect.stringMatching(/does not prove better overall sleep quality/i),
        }),
      ]),
    )
  })
})
