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

  it('recognizes established named compounds across major botanical families', () => {
    expect(normalizeCompoundClass('withaferin A')).toBe('Withanolides')
    expect(normalizeCompoundClass('CBD and CBG')).toBe('Cannabinoids')
    expect(normalizeCompoundClass('kavain and methysticin')).toBe('Lactones')
    expect(normalizeCompoundClass('EGCG and epicatechin')).toBe('Flavonoids')
    expect(normalizeCompoundClass('linalool and beta-caryophyllene')).toBe('Terpenes / terpenoids')
    expect(normalizeCompoundClass('ginsenosides')).toBe('Glycosides')
    expect(normalizeCompoundClass('rosmarinic acid')).toBe('Phenolics')
    expect(normalizeCompoundClass('berberine and palmatine')).toBe('Alkaloids')
  })

  it('keeps specific classes ahead of broad alkaloid matching', () => {
    expect(normalizeCompoundClass('caffeine alkaloid')).toBe('Methylxanthines')
    expect(normalizeCompoundClass('withanolide lactone')).toBe('Withanolides')
  })

  it('does not invent a class for an unknown compound name', () => {
    expect(normalizeCompoundClass('mystery constituent ZX-41')).toBe('mystery constituent ZX-41')
  })

  it('deduplicates normalized variants', () => {
    expect(uniqueNormalized(['calming', 'anxiolytic', 'relaxing'], normalizeEffect)).toEqual(['Calming'])
  })
})
