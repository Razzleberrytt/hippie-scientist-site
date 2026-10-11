import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8')
const parsed = (relative: string) => JSON.parse(read(relative))
const json = parsed('public/data/exports/citations.json')
const bib = read('public/data/exports/citations.bib')
const csv = read('public/data/exports/citations.csv')
const ris = read('public/data/exports/citations.ris')

describe('magnesium source relevance and researcher citation exports', () => {
  it('does not cite unrelated bariatric-surgery PMID 31654344 in active magnesium evidence or any export', () => {
    const profile = parsed('public/data/compounds-detail/magnesium.json')
    const claims = parsed('public/data/claims.json')
    expect(profile.sources.some((s: { pmid?: string }) => s.pmid === '31654344')).toBe(false)
    expect(profile.claimMap.some((c: { sourceRefIds?: string[] }) =>
      c.sourceRefIds?.includes('src_a8cddfb5c4db'))).toBe(false)
    expect(claims.some((c: { profile_slug?: string; pmid?: string }) =>
      c.profile_slug === 'magnesium' && c.pmid === '31654344')).toBe(false)
    for (const exportText of [JSON.stringify(json), bib, csv, ris]) {
      expect(exportText).not.toContain('31654344')
    }
  })

  it('keeps all four formats and their visible study counts synchronized', () => {
    const total = json.studies.length
    expect(json.studyCount).toBe(total)
    expect(json.description).toContain(`— ${total} studies.`)
    expect(bib).toContain(`— ${total} studies.`)
    expect((bib.match(/^@(article|misc)\{/gm) ?? [])).toHaveLength(total)
    expect((ris.match(/^TY  - /gm) ?? [])).toHaveLength(total)
    expect((ris.match(/^ER  - /gm) ?? [])).toHaveLength(total)
    expect(csv.trimEnd().split('\n').length - 1).toBe(total)
  })

  it('preserves exact-title PubMed-verified systematic-review and RCT classifications', () => {
    const designs = new Map(json.studies.map((s: { pmid: string; design: string }) => [s.pmid, s.design]))
    expect(designs.get('38817505')).toBe('systematic-review')
    expect(designs.get('23853635')).toBe('rct')
    const rawji = csv.split('\n').find((row: string) => row.startsWith('38817505,'))
    const abbasi = csv.split('\n').find((row: string) => row.startsWith('23853635,'))
    expect(rawji).toContain(',Systematic review,')
    expect(abbasi).toContain(',Randomized controlled trial,')
    const generator = read('scripts/data/build-citation-exports.ts')
    expect(generator).toContain('AUDITED_PUBLICATION_DESIGNS')
    expect(generator).toContain('Audited PMID/title mismatch')
  })
})
