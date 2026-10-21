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
    expect((ris.match(/^TY[ ]{2}- /gm) ?? [])).toHaveLength(total)
    expect((ris.match(/^ER[ ]{2}- /gm) ?? [])).toHaveLength(total)
    expect(csv.trimEnd().split('\n').length - 1).toBe(total)
    // Counts alone cannot detect a missing row paired with a duplicated one.
    // Match exact unique PMID sets across all four output formats.
    const sorted = (ids: string[]) => [...ids].sort()
    const jsonIds: string[] = json.studies.map((item: { pmid: string }) => String(item.pmid))
    const csvIds = [...csv.matchAll(/^(\d+),/gm)].map(match => match[1])
    const bibIds = [...bib.matchAll(/\bpmid\s*=\s*\{(\d+)\}/g)].map(match => match[1])
    const risIds = [...ris.matchAll(/^AN[ ]{2}- (\d+)$/gm)].map(match => match[1])
    expect(new Set(jsonIds).size).toBe(total)
    for (const ids of [csvIds, bibIds, risIds]) {
      expect(new Set(ids).size).toBe(total)
      expect(sorted(ids)).toEqual(sorted(jsonIds))
    }
  })

  it('exports the same unique PMID set in JSON, BibTeX, CSV, and RIS', () => {
    const sets = [
      json.studies.map((s: { pmid: string }) => String(s.pmid)),
      [...bib.matchAll(/\bpmid\s*=\s*\{(\d+)\}/g)].map((match) => match[1]),
      [...csv.matchAll(/^(\d+),/gm)].map((match) => match[1]),
      [...ris.matchAll(/^AN[ ]{2}- (\d+)$/gm)].map((match) => match[1]),
    ]
    const canonical = [...sets[0]].sort()
    expect(new Set(canonical).size).toBe(canonical.length)
    for (const ids of sets.slice(1)) {
      expect(new Set(ids).size).toBe(ids.length)
      expect([...ids].sort()).toEqual(canonical)
    }
  })

  it('matches the citation generator current source-of-truth, without orphaned studies', () => {
    const cache = parsed('ops/cache/pubmed-metadata.json').records as Record<string, { pmid: string; title?: string }>
    const referenced = new Set<string>()
    for (const directory of ['herbs-detail', 'compounds-detail']) {
      const folder = path.join(root, 'public/data', directory)
      for (const filename of fs.readdirSync(folder).filter(name => name.endsWith('.json'))) {
        const record = JSON.parse(fs.readFileSync(path.join(folder, filename), 'utf8'))
        for (const source of Array.isArray(record.sources) ? record.sources : []) {
          const pmid = String(source?.pmid ?? source?.pubmedId ?? '').trim()
          if (pmid) referenced.add(pmid)
        }
      }
    }
    const expected = Object.values(cache)
      .filter(study => referenced.has(String(study.pmid)) && Boolean(study.title))
      .map(study => String(study.pmid))
      .sort()
    const actual = json.studies.map((study: { pmid: string }) => String(study.pmid)).sort()
    // Report exact orphaned PMIDs, not merely a stale top-line count.
    const extra = actual.filter((pmid: string) => !expected.includes(pmid))
    const missing = expected.filter(pmid => !actual.includes(pmid))
    expect(extra).toEqual([])
    expect(missing).toEqual([])
    expect(actual).toEqual(expected)
  })

  it('excludes melatonin-misattributed citations from profiles, claims and every exported format', () => {
    const disallowed = ['20091037', '25128263', '12467979']
    const detail = parsed('public/data/compounds-detail/melatonin.json')
    const claims = parsed('public/data/claims.json')
    const exported = [JSON.stringify(json), bib, csv, ris]
    for (const pmid of disallowed) {
      expect(detail.sources.some((s: { pmid?: string }) => s.pmid === pmid)).toBe(false)
      expect(claims.some((c: { profile_slug?: string; pmid?: string }) =>
        c.profile_slug === 'melatonin' && c.pmid === pmid)).toBe(false)
      for (const text of exported) expect(text).not.toContain(pmid)
    }
    const generator = read('scripts/data/build-citation-exports.ts')
    expect(generator).toContain('isMisattributedMelatoninCitation(source, slug)')
    expect(detail.sources.some((s: { pmid?: string }) => s.pmid === '23691095')).toBe(true)
    expect(detail.evidence_grade).toBeNull()
    expect(detail.evidence_consistency).toBeNull()
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
