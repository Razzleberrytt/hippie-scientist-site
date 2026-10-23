import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  MELATONIN_IDENTITY_HOLD, MELATONIN_MISATTRIBUTED_PMIDS,
  isMisattributedMelatoninCitation, quarantineMelatoninDetail,
} from './melatonin-citation-quarantine'

describe('melatonin source identity quarantine', () => {
  const contaminated = {
    slug: 'melatonin',
    sources: [
      { id: 'bad', pmid: '25128263', title: 'Wound ballistics' },
      { id: 'good', pmid: '23691095', title: 'Melatonin sleep meta-analysis' },
    ],
    claimMap: [
      { id: 'badclaim', sourceRefIds: ['bad'] },
      { id: 'goodclaim', sourceRefIds: ['good'] },
    ],
    evidence: { sourceIds: ['bad', 'good'], sourceCount: 2, claimIds: ['badclaim', 'goodclaim'], claimCount: 2 },
  }
  it('drops proven wrong-source claims but retains legitimate melatonin studies', () => {
    const result = quarantineMelatoninDetail(contaminated)
    expect(result.sources.map(s => s.pmid)).toEqual(['23691095'])
    expect(result.claimMap.map(c => c.id)).toEqual(['goodclaim'])
    expect(result.evidence.sourceIds).toEqual(['good'])
    expect(result.evidence.sourceCount).toBe(1)
    expect(result.evidence.claimCount).toBe(1)
    expect(contaminated.sources).toHaveLength(2)
  })
  it('matches all three misattributed PMID records and URL fallback', () => {
    for (const pmid of MELATONIN_MISATTRIBUTED_PMIDS) {
      expect(isMisattributedMelatoninCitation({ pmid }, 'melatonin')).toBe(true)
      expect(isMisattributedMelatoninCitation({ source_url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` }, 'melatonin')).toBe(true)
      expect(isMisattributedMelatoninCitation({ pmid }, 'other-compound')).toBe(false)
    }
    expect(isMisattributedMelatoninCitation({ pmid: '23691095' }, 'melatonin')).toBe(false)
  })
  it('holds public Grade A/consistency in the saved profile and removes bad references', () => {
    const record = JSON.parse(readFileSync('public/data/compounds-detail/melatonin.json', 'utf8'))
    expect(record.evidence_grade).toBeNull()
    expect(record.evidence_grade_backed).toBe(false)
    expect(record.evidence_grade_backing_gap).toBe(MELATONIN_IDENTITY_HOLD)
    expect(record.evidence_consistency).toBeNull()
    expect(record.evidence.sourceCount).toBe(record.evidence.sourceIds.length)
    expect(record.evidence.claimCount).toBe(record.claimMap.length)
    expect(record.sources.some((source: { pmid?: string }) => MELATONIN_MISATTRIBUTED_PMIDS.has(String(source.pmid)))).toBe(false)
    const keptIds = new Set(record.sources.map((source: { id: string }) => source.id))
    expect(record.evidence.sourceIds.every((id: string) => keptIds.has(id))).toBe(true)
    expect(record.claimMap.every((claim: { sourceRefIds: string[] }) => claim.sourceRefIds.every(id => keptIds.has(id)))).toBe(true)
    expect(record.sources.some((source: { pmid?: string }) => source.pmid === '23691095')).toBe(true)
  })
})
