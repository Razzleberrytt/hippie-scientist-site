import { describe, expect, it } from 'vitest'

import {
  ALKALOID_DIRECTORY,
  COMMONLY_MISTAKEN_FOR_ALKALOIDS,
  HIGHER_CAUTION_IDS,
  PRODUCT_SCREENING_CRITERIA,
} from '../alkaloids'

describe('alkaloid commerce-readiness data', () => {
  it('keeps required higher-caution entries conservative', () => {
    const higherCautionIds = ALKALOID_DIRECTORY
      .filter((entry) => entry.safetyTier === 'higher')
      .map((entry) => entry.id)
      .sort()

    expect(higherCautionIds).toEqual([...HIGHER_CAUTION_IDS].sort())
    for (const entry of ALKALOID_DIRECTORY.filter((item) => item.safetyTier === 'higher')) {
      expect(entry.safetyLabel).toBe('Higher caution')
      expect(entry.safetySummary.length).toBeGreaterThan(80)
    }
  })

  it('does not misclassify L-theanine as an alkaloid', () => {
    expect(ALKALOID_DIRECTORY.some((entry) => entry.id === 'l-theanine')).toBe(false)
    expect(COMMONLY_MISTAKEN_FOR_ALKALOIDS).toContainEqual(
      expect.objectContaining({
        name: 'L-theanine',
        classification: expect.stringContaining('not an alkaloid'),
      }),
    )
  })

  it('contains no commerce activation fields and covers every screening requirement', () => {
    const serialized = JSON.stringify(ALKALOID_DIRECTORY).toLowerCase()

    expect(serialized).not.toContain('affiliateurl')
    expect(serialized).not.toContain('trackingid')
    expect(serialized).not.toContain('merchant')
    expect(serialized).not.toContain('"price"')
    expect(PRODUCT_SCREENING_CRITERIA.map((criterion) => criterion.title)).toEqual([
      'Botanical identity',
      'Plant part',
      'Standardization',
      'Supplement Facts',
      'Responsible manufacturer',
      'COA and testing',
      'No opaque blends',
      'No high-risk positioning',
    ])
  })

  it('keeps risk filters and evidence-lane citations populated', () => {
    for (const entry of ALKALOID_DIRECTORY) {
      expect(entry.riskTags.length).toBeGreaterThan(0)
      expect(entry.evidenceReferences.human.length).toBeGreaterThan(0)
      expect(entry.evidenceReferences.mechanistic.length).toBeGreaterThan(0)
      expect(entry.evidenceReferences.safety.length).toBeGreaterThan(0)

      const citedReferences = Object.values(entry.evidenceReferences).flat()
      expect(citedReferences.every(reference => Number.isInteger(reference) && reference > 0)).toBe(true)
    }
  })

  it('keeps blue lotus and cat’s claw out of withdrawal substitution guidance', () => {
    const blueLotus = ALKALOID_DIRECTORY.find((entry) => entry.id === 'blue-lotus')
    const catsClaw = ALKALOID_DIRECTORY.find((entry) => entry.id === 'cats-claw')

    expect(blueLotus?.safetySummary).toContain('Reject')
    expect(blueLotus?.safetySummary).toContain('substitution')
    expect(catsClaw?.humanEvidence).toContain('no reliable human evidence')
    expect(catsClaw?.labelChecks.join(' ')).toContain('No withdrawal')
  })
})
