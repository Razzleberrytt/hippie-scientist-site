import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { applyCitationIntegrityHold } from '../citation-integrity-holds.mjs'
import { resolveRuntimeRecordLayers } from '../runtime-record-resolver.mjs'
import { extractCitationsFromRecord } from '../citations'
import { getEvidenceLetterGrade, getEvidenceTier } from '../evidence'
import { getRuntimeVisibility } from '../runtime-visibility'
import type { RuntimeRecord } from '../../types/content'

const contaminated = {
  slug: 'tyrosine', entityType: 'herb', name: 'L-Tyrosine',
  evidence_grade: 'A', evidence_tier: 'Strong Human Evidence',
  sources: [{ pmid: '30000526' }, { pmid: '8629725' }, { pmid: '22554242' }, { pmid: '12482446' }],
  claimMap: [{ id: 'bad-claim', sourceRefIds: ['bad-source'] }],
  evidence: { sourceCount: 4, claimCount: 1 },
  safety: 'Headache, nausea', contraindications: ['MAO inhibitors', 'thyroid meds'],
  indexability_status: 'PUBLISH', runtime_export_decision: 'full_public_runtime',
  governance: { recommendationAllowed: true, monetizationAllowed: true, indexingAllowed: true },
}

describe('Tyrosine citation-integrity containment', () => {
  it('withholds accepted sources, claims and strength without erasing safety or grade provenance', () => {
    const held = applyCitationIntegrityHold(contaminated) as RuntimeRecord
    expect(extractCitationsFromRecord(held)).toEqual([])
    expect(held.evidence).toMatchObject({ sourceCount: 0, sourceIds: [], claimCount: 0, claimIds: [] })
    expect(held.claimMap).toEqual([])
    expect(getEvidenceLetterGrade(held)).toBe('Unassigned')
    expect(getEvidenceTier(held)).toBe('review')
    expect(held.evidence_grade_source).toBe('A')
    expect(held.safety).toBe(contaminated.safety)
    expect(held.contraindications).toEqual(contaminated.contraindications)
    expect(getRuntimeVisibility(held)).toMatchObject({ canRender: true, canIndex: false, canMonetize: false })
    expect(held.governance).toMatchObject({ recommendationAllowed: false, requiresHumanReview: true })
  })

  it('does not let a stale detail layer resurrect held evidence or permissions', () => {
    const held = applyCitationIntegrityHold(contaminated)
    const merged = resolveRuntimeRecordLayers(held, [contaminated])
    expect(merged.sources).toEqual([])
    expect(merged.evidence_grade).toBeNull()
    expect(merged.evidence_human_study_count).toBe(0)
    expect(merged.governance.monetizationAllowed).toBe(false)
    expect(applyCitationIntegrityHold(merged)).toEqual(merged)
  })

  it('preserves the distinct compound authority and unrelated profiles', () => {
    for (const record of [
      { ...contaminated, slug: 'l-tyrosine', entityType: 'compound' },
      { ...contaminated, slug: 'rosemary' },
      { ...contaminated, entityType: 'compound' },
    ]) expect(applyCitationIntegrityHold(record)).toBe(record)
  })

  it.each([false, 'false'])('honors explicit governance denials (%s) across published profiles', denied => {
    const record = { slug: 'unrelated', indexability_status: 'PUBLISH', governance: {
      indexingAllowed: denied, recommendationAllowed: denied, monetizationAllowed: denied,
    } }
    expect(getRuntimeVisibility(record)).toEqual({ canRender: true, canIndex: false, canFeature: false, canMonetize: false })
    expect(getRuntimeVisibility({ ...record, indexability_status: 'BLOCKED', governance: {
      indexingAllowed: true, recommendationAllowed: true, monetizationAllowed: true,
    } })).toMatchObject({ canIndex: false, canFeature: false, canMonetize: false })
  })

  it('keeps any surviving legacy records held and preserves the existing compound redirect', () => {
    // A full rebuild removes the retired herb owner. A stale committed layer
    // may still contain it; both states must be safe, without recreating it.
    const detailPath = 'public/data/herbs-detail/tyrosine.json'
    const records = existsSync(detailPath) ? [JSON.parse(readFileSync(detailPath, 'utf8'))] : []
    for (const file of ['herbs.json', 'herbs-summary.json', 'summary-indexes/herbs-summary.json']) {
      records.push(...JSON.parse(readFileSync(`public/data/${file}`, 'utf8'))
        .filter((row: { slug: string }) => row.slug === 'tyrosine'))
    }
    for (const row of records) {
      expect(row.evidence_grade).toBeNull()
      expect(row.sources).toEqual([])
      expect(row.robots).toBe('noindex,follow')
    }
    const claims = JSON.parse(readFileSync('public/data/claims.json', 'utf8'))
    expect(claims.filter((row: { profile_slug: string }) => row.profile_slug === 'tyrosine')).toEqual([])
    const compound = JSON.parse(readFileSync('public/data/compounds-detail/l-tyrosine.json', 'utf8'))
    expect(compound.sources.some((source: { pmid: string }) => source.pmid === '32093203')).toBe(true)
    expect(readFileSync('public/_redirects', 'utf8')).toContain('/herbs/tyrosine/ /compounds/l-tyrosine/ 301')
  })
})
