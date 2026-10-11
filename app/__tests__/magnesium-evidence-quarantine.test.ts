import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (name: string) => readFileSync(path.join(root, name), 'utf8')
const magnesium = JSON.parse(read('public/data/compounds-detail/magnesium.json'))
const claims = JSON.parse(read('public/data/claims.json'))
const quarantine = JSON.parse(read('ops/evidence-quarantine/magnesium-pmid-31654344.json'))
const wrongPmid = '31654344'

describe('magnesium evidence source integrity', () => {
  it('never presents the unrelated bariatric PMID in active magnesium evidence', () => {
    expect(magnesium.sources.some((source: { pmid?: string }) => source.pmid === wrongPmid)).toBe(false)
    expect(magnesium.claimMap.some((claim: { sourceRefIds?: string[] }) =>
      claim.sourceRefIds?.includes('src_a8cddfb5c4db')
    )).toBe(false)
    expect(magnesium.evidence.sourceIds).not.toContain('src_a8cddfb5c4db')
    expect(magnesium.evidence.claimIds).not.toContain('clm_82032f33663c')
    expect(magnesium.evidence.sourceCount).toBe(magnesium.sources.length)
    expect(magnesium.evidence.claimCount).toBe(magnesium.claimMap.length)
  })

  it('does not classify the unrelated PMID as a magnesium sleep meta-analysis', () => {
    expect(claims.some((claim: { pmid?: string; profile_slug?: string }) =>
      claim.pmid === wrongPmid && claim.profile_slug === 'magnesium'
    )).toBe(false)
    for (const extension of ['csv', 'bib', 'ris']) {
      expect(read(`public/data/exports/citations.${extension}`)).not.toContain(wrongPmid)
    }
  })

  it('preserves the error as quarantined provenance, not an approved source', () => {
    expect(quarantine.pmid).toBe(wrongPmid)
    expect(quarantine.status).toBe('quarantined')
    expect(quarantine.previous_source_id).toBe('src_a8cddfb5c4db')
    expect(quarantine.re_admission_requirements).toContain('Documented human review sign-off')
  })

  it('retains verified magnesium trial and review classifications', () => {
    const byPmid = Object.fromEntries(magnesium.sources.map((source: { pmid: string }) => [source.pmid, source]))
    expect(byPmid['23853635'].studyClass).toBe('rct')
    expect(byPmid['38817505'].studyClass).toBe('systematic-review')
    expect(byPmid['38817505'].studyType).toBe('Systematic review')
  })
})
