import { describe, expect, it } from 'vitest'
import {
  assessQuarantine,
  isWholeSourceQuarantine,
  quarantineIdentity,
} from '../validate-source-quarantines.mjs'

const warning = {
  submissionId: 'sub_session-c-magnesium-bariatric-source-quarantine-20260830',
  entityType: 'compound',
  entitySlug: 'magnesium',
  topicType: 'conflict_note',
  claimType: 'evidence_conflict',
  sourceId: 'src_doi-10-1007-s11695-019-04215-6',
  usageContext: 'Wrong-source quarantine only; no magnesium intervention is present.',
  reviewStatus: 'draft_submission',
  editorialStatus: 'draft',
  active: true,
}
const activeMagnesium = {
  sources: [{
    id: 'src_a8cddfb5c4db',
    pmid: '31654344',
    doi: '10.1007/s11695-019-04215-6',
    reviewStatus: 'approved',
  }],
}
const approved = {
  ...warning,
  reviewStatus: 'approved_for_rollup',
  editorialStatus: 'approved',
  reviewer: 'scientific-editor',
  reviewedAt: '2026-10-10T20:00:00.000Z',
  approvalNotes: 'PubMed title and abstract confirm an unrelated bariatric-drain paper.',
}
const assess = (submission, profile = activeMagnesium, claims = [], pubmedCache = {}) =>
  assessQuarantine({ submission, profile, claims, pubmedCache, fragmentPath: 'fixture.json' })

describe('whole-source quarantine publication reconciliation', () => {
  it('treats the historical August 30 warning as draft, not an automatic ban', () => {
    expect(isWholeSourceQuarantine(warning)).toBe(true)
    expect(assess(warning)?.approved).toBe(false)
    expect(assess(warning)?.problems).toEqual([])
  })

  it('fails closed when an approved quarantine remains cited by an approved source', () => {
    const result = assess(approved)
    expect(result?.approved).toBe(true)
    expect(result?.problems.join(' ')).toMatch(/APPROVED QUARANTINE CONFLICT/)
    expect(result?.problems.join(' ')).toMatch(/magnesium/)
  })

  it('does not accept partial, unauthenticated approval or unresolvable IDs', () => {
    expect(assess({ ...approved, reviewer: '', approvalNotes: '' })?.problems.join(' ')).toContain('incomplete quarantine approval')
    expect(assess({ ...approved, sourceId: 'src_unknown-something' })?.problems.join(' ')).toContain('cannot resolve PMID/DOI')
    expect(assess({ ...warning, editorialStatus: 'approved' })?.problems.join(' ')).toContain('incomplete quarantine approval')
  })

  it('allows a reviewed quarantine when the conflicting source assignment is removed', () => {
    expect(assess(approved, { sources: [] })?.problems).toEqual([])
    // Public citation extraction still renders source rows even if "active" is false.
    expect(assess(approved, { sources: [{ ...activeMagnesium.sources[0], active: false }] })?.problems.join(' ')).toContain('APPROVED QUARANTINE CONFLICT')
  })

  it('catches sources reattached from workbook claims after detail source removal', () => {
    const claim = { profile_slug: 'magnesium', pmid: '31654344', evidence_tier: 'meta_analysis' }
    const cache = { '31654344': { doi: '10.1007/s11695-019-04215-6' } }
    expect(assess(approved, { sources: [] }, [claim], cache)?.problems.join(' ')).toContain('workbook claims')
    expect(assess({ ...approved, sourceId: 'src_pubmed-31654344' }, { sources: [] }, [claim])?.problems.join(' ')).toContain('workbook claims')
    expect(assess(approved, { sources: [] }, [{ ...claim, profile_slug: 'zinc' }], cache)?.problems).toEqual([])
  })

  it('does not quarantine another ingredient or a claim-specific source dispute', () => {
    const otherSource = { sources: [{ doi: '10.9999/unrelated', reviewStatus: 'approved' }] }
    expect(assess(approved, otherSource)?.problems).toEqual([])
    expect(isWholeSourceQuarantine({
      ...warning,
      usageContext: 'Source-to-claim quarantine only; research may support other outcomes.',
    })).toBe(false)
    expect(assess({ ...approved, usageContext: 'Source-to-claim quarantine only' })).toBe(null)
  })

  it('blocks DOI citations surfaced only as profile or workbook URLs', () => {
    const doiUrl = 'https://doi.org/10.1007/s11695-019-04215-6'
    expect(assess(approved, { sources: [{ url: doiUrl }] })?.problems.join(' ')).toContain('detail sources')
    expect(assess(approved, { sources: [] }, [
      { profile_slug: 'magnesium', source_url: doiUrl },
    ])?.problems.join(' ')).toContain('workbook claims')
    // An unreviewed draft is advisory even if that same URL is still exposed.
    expect(assess(warning, { sources: [{ url: doiUrl }] })?.problems).toEqual([])
  })

  it('resolves DOI and PMID prefixes independently of local hashed source IDs', () => {
    expect(quarantineIdentity('src_doi-10-1007-s11695-019-04215-6')).toEqual({
      kind: 'doi', key: '101007s11695019042156',
    })
    expect(quarantineIdentity('src_pubmed-31654344')).toEqual({ kind: 'pmid', key: '31654344' })
    expect(assess({ ...approved, sourceId: 'src_pubmed-31654344' })?.problems.join(' ')).toContain('APPROVED QUARANTINE CONFLICT')
  })
})
