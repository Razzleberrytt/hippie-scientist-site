import { describe, expect, it } from 'vitest'
import {
  normalizeCompoundClass,
  normalizeEffect,
  normalizeEvidence,
  normalizeIntensity,
  normalizeSafetySignal,
  uniqueNormalized,
} from '../botanical-atlas-taxonomy'

describe('botanical atlas taxonomy', () => {
  it('collapses effect synonyms into stable families', () => {
    expect(normalizeEffect('Anxiolytic and stress reducing')).toBe('Calming')
    expect(normalizeEffect('Wakefulness and alertness')).toBe('Stimulating / energy')
    expect(normalizeEffect('Analgesic activity')).toBe('Pain / discomfort')
  })

  it('maps evidence labels to a small controlled scale', () => {
    expect(normalizeEvidence('Strong human evidence')).toBe('Strong')
    expect(normalizeEvidence('Limited pilot trial')).toBe('Preliminary')
    expect(normalizeEvidence('Traditional use and animal evidence')).toBe('Traditional / preclinical')
  })

  it('normalizes noticeability labels', () => {
    expect(normalizeIntensity('high intensity')).toBe('Pronounced')
    expect(normalizeIntensity('mild')).toBe('Subtle')
    expect(normalizeIntensity('dose-dependent')).toBe('Variable')
  })

  it('groups active chemistry and safety concerns', () => {
    expect(normalizeCompoundClass('isoquinoline alkaloids')).toBe('Alkaloids')
    expect(normalizeCompoundClass('kavalactones')).toBe('Lactones')
    expect(normalizeCompoundClass('caffeine and theobromine')).toBe('Methylxanthines')
    expect(normalizeSafetySignal('May interact with SSRIs')).toBe('Serotonergic')
    expect(normalizeSafetySignal('Potential hepatotoxicity')).toBe('Liver')
  })

  it('deduplicates normalized variants', () => {
    expect(uniqueNormalized(['calming', 'anxiolytic', 'relaxing'], normalizeEffect)).toEqual(['Calming'])
  })
})
