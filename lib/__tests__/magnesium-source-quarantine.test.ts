import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const profile = JSON.parse(readFileSync(path.join(root, 'public/data/compounds-detail/magnesium.json'), 'utf8'))
const claims = JSON.parse(readFileSync(path.join(root, 'public/data/claims.json'), 'utf8'))
const archivedIncident = JSON.parse(readFileSync(
  path.join(root, 'ops/enrichment-submissions/sessions/session-c/2026-08-30-magnesium-source-integrity.json'), 'utf8',
))

describe('magnesium source relevance and study-design safety', () => {
  it('never admits unrelated bariatric-drain PMID 31654344 as active magnesium evidence', () => {
    expect(profile.sources.some((source: { pmid?: string }) => source.pmid === '31654344')).toBe(false)
    expect(profile.claimMap.some((claim: { sourceRefIds?: string[] }) => claim.sourceRefIds?.includes('src_a8cddfb5c4db'))).toBe(false)
    expect(claims.some((claim: { profile_slug?: string; pmid?: string }) =>
      claim.profile_slug === 'magnesium' && claim.pmid === '31654344')).toBe(false)
    expect(archivedIncident.submissions.some((row: { findingTextShort?: string }) =>
      row.findingTextShort?.includes('31654344'))).toBe(true)
  })

  it('keeps active claim and source counts and references internally consistent', () => {
    expect(profile.evidence.sourceCount).toBe(profile.sources.length)
    expect(profile.evidence.claimCount).toBe(profile.claimMap.length)
    expect([...profile.evidence.sourceIds].sort()).toEqual(profile.sources.map((s: { id: string }) => s.id).sort())
    expect([...profile.evidence.claimIds].sort()).toEqual(profile.claimMap.map((c: { id: string }) => c.id).sort())
    const ids = new Set(profile.sources.map((source: { id: string }) => source.id))
    for (const claim of profile.claimMap) {
      for (const id of claim.sourceRefIds || []) expect(ids.has(id), `orphan source ${id}`).toBe(true)
    }
  })

  it('retains PubMed-verified study design for magnesium sleep evidence', () => {
    const byPmid = new Map(profile.sources.map((s: { pmid?: string }) => [s.pmid, s]))
    expect(byPmid.get('38817505')).toMatchObject({
      studyType: 'Systematic review',
      studyClass: 'systematic-review',
      url: 'https://pubmed.ncbi.nlm.nih.gov/38817505/',
    })
    expect(byPmid.get('23853635')).toMatchObject({
      studyType: 'Randomized controlled trial',
      studyClass: 'rct',
      url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/',
    })
  })
})
