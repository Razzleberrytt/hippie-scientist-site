import { describe, it, expect } from 'vitest'
import {
  getSafetyClassifications,
  getSafetyLabels,
  getSafetySensitivity,
} from '../../../lib/safety-classification'

describe('safety-classification', () => {
  it('flags medication interaction language', () => {
    const record = { safetyNotes: 'This herb carries a drug interaction risk with SSRI medication.' }
    const labels = getSafetyLabels(record)
    expect(labels).toContain('Interaction-Aware')
  })

  it('flags liver-related caution language', () => {
    const record = { cautions: 'Case reports of hepatotoxic effects at high doses.' }
    const labels = getSafetyLabels(record)
    expect(labels).toContain('Liver-Sensitive')
  })

  it('flags hormonal activity context', () => {
    const record = { warnings: 'May affect thyroid hormone levels.' }
    const labels = getSafetyLabels(record)
    expect(labels).toContain('Hormonal Activity Context')
  })

  it('flags stimulant-like language', () => {
    const record = { summary: 'Contains caffeine and may cause jitters or insomnia.' }
    const labels = getSafetyLabels(record)
    expect(labels).toContain('Stimulant-Like Profile')
  })

  it('flags anticoagulant/bleeding caution language', () => {
    const record = { interactions: 'Caution with warfarin and other blood thinners.' }
    const labels = getSafetyLabels(record)
    expect(labels).toContain('Anticoagulant Caution')
  })

  it('flags pregnancy/breastfeeding caution language', () => {
    const record = { avoid: 'Avoid during pregnancy and breastfeeding.' }
    const labels = getSafetyLabels(record)
    expect(labels).toContain('Pregnancy/Breastfeeding Caution')
  })

  it('returns no classifications when no caution language is present', () => {
    const record = { summary: 'A well-studied adaptogen with a long history of use.' }
    expect(getSafetyClassifications(record)).toEqual([])
  })

  it('deduplicates repeated mentions of the same category', () => {
    const record = {
      safetyNotes: 'May interact with medications.',
      contraindications: 'Drug interactions have been reported.',
    }
    const labels = getSafetyLabels(record)
    expect(labels.filter(label => label === 'Interaction-Aware')).toHaveLength(1)
  })

  it('respects the limit parameter', () => {
    const record = {
      warnings:
        'Interacts with medications, hepatotoxic in rare cases, affects thyroid hormone, stimulant-like jitters, warfarin bleeding risk, avoid during pregnancy.',
    }
    expect(getSafetyClassifications(record, 2)).toHaveLength(2)
    expect(getSafetyClassifications(record, 0)).toHaveLength(0)
  })

  it('handles missing/undefined fields without throwing', () => {
    expect(getSafetyClassifications({})).toEqual([])
    expect(getSafetyLabels({})).toEqual([])
  })

  describe('getSafetySensitivity', () => {
    it('returns "high" when two or more caution categories are present', () => {
      const record = { warnings: 'Interacts with medications and hepatotoxic in rare cases.' }
      expect(getSafetySensitivity(record)).toBe('high')
    })

    it('returns "high" when explicit avoid/contraindication language is present', () => {
      const record = { summary: 'Contraindicated in patients with liver disease; avoid use.' }
      expect(getSafetySensitivity(record)).toBe('high')
    })

    it('returns "moderate" when exactly one caution category is present', () => {
      const record = { warnings: 'Interacts with medications; consult a doctor before use.' }
      expect(getSafetySensitivity(record)).toBe('moderate')
    })

    it('returns "low" when no caution language is present', () => {
      const record = { summary: 'Widely used botanical with a strong safety record.' }
      expect(getSafetySensitivity(record)).toBe('low')
    })
  })
})
