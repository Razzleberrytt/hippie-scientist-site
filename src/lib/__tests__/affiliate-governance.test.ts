import { describe, expect, it } from 'vitest'
import {
  canRenderAffiliateLinks,
  canShowAffiliateModule,
  getAffiliateShopLinks,
} from '../affiliate'
import { getGoal } from '@/data/goals'
import { goalContainsRestrictedIngredient, isRestrictedRecord } from '../restricted-ingredients'

// A record that clears the research-maturity gate on its own merits, so these
// cases isolate the governance flags they are about. profile_status alone is a
// maturity signal with no evidence behind it, which resolves to theoretical and
// withdraws purchase intent - correct behaviour, but not what is under test
// here (see affiliate-maturity-governance.test.ts for that boundary).
const baseAffiliateRecord = {
  slug: 'l-theanine',
  displayName: 'L-Theanine',
  affiliate_ready: true,
  profile_status: 'complete',
  evidence_tier: 'Strong human clinical trial evidence',
}

describe('affiliate governance gates', () => {
  it('blocks Amazon links for workbook doNotMonetize records', () => {
    const record = {
      ...baseAffiliateRecord,
      slug: 'noopept',
      displayName: 'Noopept',
      doNotMonetize: true,
    }

    expect(isRestrictedRecord(record)).toBe(true)
    expect(canRenderAffiliateLinks(record)).toBe(false)
    expect(canShowAffiliateModule(record)).toBe(false)
    expect(getAffiliateShopLinks(record, record.displayName, 'compound')).toEqual([])
  })

  it('blocks Amazon links for workbook doNotPromote records with string flags', () => {
    const record = {
      ...baseAffiliateRecord,
      slug: 'fadogia-agrestis',
      displayName: 'Fadogia Agrestis',
      doNotPromote: 'TRUE',
    }

    expect(isRestrictedRecord(record)).toBe(true)
    expect(canRenderAffiliateLinks(record)).toBe(false)
    expect(getAffiliateShopLinks(record, record.displayName, 'compound')).toEqual([])
  })

  it('blocks Amazon links for restricted-name records even without explicit flags', () => {
    const record = {
      ...baseAffiliateRecord,
      slug: 'mitragynine',
      displayName: 'Mitragynine',
    }

    expect(isRestrictedRecord(record)).toBe(true)
    expect(canRenderAffiliateLinks(record)).toBe(false)
    expect(getAffiliateShopLinks(record, record.displayName, 'compound')).toEqual([])
  })

  it('blocks full records that runtime governance marks nonmonetizable', () => {
    const record = {
      ...baseAffiliateRecord,
      summary_quality: 'weak',
    }

    expect(isRestrictedRecord(record)).toBe(false)
    expect(canRenderAffiliateLinks(record)).toBe(false)
    expect(canShowAffiliateModule(record)).toBe(false)
    expect(getAffiliateShopLinks(record, record.displayName, 'compound')).toEqual([])
  })

  it('honors an explicit compact-payload monetization denial', () => {
    const compactRecord = {
      slug: 'l-theanine',
      name: 'L-Theanine',
      monetization_allowed: false,
    }

    expect(canRenderAffiliateLinks(compactRecord)).toBe(false)
  })

  it('allows affiliate links only when governance flags are clear', () => {
    expect(canRenderAffiliateLinks(baseAffiliateRecord)).toBe(true)

    const links = getAffiliateShopLinks(baseAffiliateRecord, baseAffiliateRecord.displayName, 'compound')

    expect(links).toHaveLength(1)
    expect(links[0]?.url).toContain('amazon.com')
    expect(links[0]?.url).toContain('tag=')
  })

  it('blocks sourcing Amazon links for additional restricted (kratom, ibogaine, ketamine, 5-MeO-DMT, fadogia)', () => {
    const kratomRec = { ...baseAffiliateRecord, slug: 'kratom', displayName: 'Kratom' }
    const iboRec = { ...baseAffiliateRecord, slug: 'ibogaine', displayName: 'Ibogaine' }
    const ketRec = { ...baseAffiliateRecord, slug: 'ketamine', displayName: 'Ketamine' }
    const meoRec = { ...baseAffiliateRecord, slug: '5-meo-dmt', displayName: '5-MeO-DMT' }
    const fadRec = { ...baseAffiliateRecord, slug: 'fadogia-agrestis', displayName: 'Fadogia Agrestis' }

    ;[kratomRec, iboRec, ketRec, meoRec, fadRec].forEach(rec => {
      expect(isRestrictedRecord(rec)).toBe(true)
      expect(canRenderAffiliateLinks(rec)).toBe(false)
      expect(getAffiliateShopLinks(rec, rec.displayName, 'compound')).toEqual([])
    })
  })

  it('blocks kava and kavalactone markers for monetization governance', () => {
    expect(isRestrictedRecord({ slug: 'kava' })).toBe(true)
    expect(isRestrictedRecord({ name: 'Piper methysticum' })).toBe(true)
    expect(isRestrictedRecord({ slug: 'kavain' })).toBe(true)
  })

  it('detects the anxiety goal as education-only because it contains kava', () => {
    const anxiety = getGoal('anxiety')

    expect(goalContainsRestrictedIngredient(anxiety)).toBe(true)
  })

  it('keeps sleep, stress, and focus outside education-only mode when their ingredients are unrestricted', () => {
    for (const slug of ['sleep', 'stress', 'focus']) {
      expect(goalContainsRestrictedIngredient(getGoal(slug))).toBe(false)
    }
  })
})
