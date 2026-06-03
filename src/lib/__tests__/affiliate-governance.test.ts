import { describe, expect, it } from 'vitest'
import {
  canRenderAffiliateLinks,
  canShowAffiliateModule,
  getAffiliateShopLinks,
  getGovernedCompoundSearchLinks,
} from '../affiliate'
import { isRestrictedRecord } from '../restricted-ingredients'

const baseAffiliateRecord = {
  slug: 'l-theanine',
  displayName: 'L-Theanine',
  affiliate_ready: true,
  profile_status: 'complete',
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
    expect(getGovernedCompoundSearchLinks(record, record.displayName)).toEqual([])
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

  it('allows affiliate links only when governance flags are clear', () => {
    expect(canRenderAffiliateLinks(baseAffiliateRecord)).toBe(true)

    const links = getAffiliateShopLinks(baseAffiliateRecord, baseAffiliateRecord.displayName, 'compound')

    expect(links).toHaveLength(1)
    expect(links[0]?.url).toContain('amazon.com')
    expect(links[0]?.url).toContain('tag=')
  })
})
