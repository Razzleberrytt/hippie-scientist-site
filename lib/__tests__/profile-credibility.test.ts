import { describe, expect, it } from 'vitest'
import { profileCommonName, profileEvidence } from '../profile-credibility'
import { summarizeEvidenceStudies } from '../evidence-study'
import { getSafetyClassifications } from '../safety-classification'
import { getRuntimeVisibility } from '../runtime-visibility'
import { generateDetailMetadata, shouldIndexRoute } from '../seo'
import { collapseRepeatedNouns } from '../display-utils'
import { toLeanProfileIndexRecord } from '../profile-index-records'

describe('public profile credibility', () => {
  it('counts publications rather than repeating a source for each claim', () => {
    const source = { pmid: '12345678', title: 'Synthetic trial', studyType: 'RCT' }
    const { citations, metrics } = profileEvidence({ sources: [source, source], claims: [{ id: 'claim:a' }, { id: 'claim:b' }] })
    expect(citations).toHaveLength(1)
    expect(metrics.humanTrials).toBe(1)
  })
  it('does not manufacture a participant total by adding reviews', () => {
    const metrics = summarizeEvidenceStudies([400, 558].map((n, i) => ({
      id: `review:${i}`, title: 'Synthetic review', sampleSize: n,
      evidenceClass: 'meta_analysis', relationship: 'background', confidence: 'unknown',
    })))
    expect(metrics.approximateParticipants).toBe(0)
    expect(metrics.studiesWithParticipantCounts).toBe(0)
  })
  it('does not turn mechanism or efficacy prose into safety cautions', () => {
    expect(getSafetyClassifications({ summary: 'Thyroid and clotting mechanisms', description: 'Liver antioxidant activity' })).toEqual([])
    expect(getSafetyClassifications({ safetyNotes: 'Avoid with warfarin; bleeding risk.' }).some(x => x.label === 'Anticoagulant Caution')).toBe(true)
  })
  it('keeps common names distinct from botanical names without moving URLs', () => {
    expect(profileCommonName({ slug: 'ashwagandha', name: 'Ashwagandha Withania Somnifera' })).toBe('Ashwagandha')
    expect(profileCommonName({ slug: 'brassica-juncea', name: 'Brassica Juncea' })).toBe('Indian mustard')
  })
  it('withholds discovery for explicit zero-human records while preserving their URLs', () => {
    const record = { slug: 'brassica-juncea', name: 'Brassica Juncea', indexability_status: 'PUBLISH', evidence_human_study_count: 0 }
    expect(getRuntimeVisibility(record)).toMatchObject({ canRender: true, canIndex: false, canFeature: false, canMonetize: false })
    expect(shouldIndexRoute('/herbs/brassica-juncea/', record).index).toBe(false)
    const metadata = generateDetailMetadata(record, 'herb')
    expect(metadata.title).toBe('Indian mustard: Research Gaps & Safety')
    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.alternates?.canonical).toBe('https://thehippiescientist.net/herbs/brassica-juncea/')
  })
  it('does not infer a missing human-evidence count is zero', () => {
    expect(getRuntimeVisibility({ slug: 'synthetic-reviewed', indexability_status: 'PUBLISH' }).canRender).toBe(true)
  })
  it('keeps complete sentences in index summaries and bounds long tokens', () => {
    expect(toLeanProfileIndexRecord({ slug: 'synthetic', name: 'Synthetic', summary: 'A complete sentence. ' + 'x'.repeat(260) }).summary).toBe('A complete sentence.')
    expect(String(toLeanProfileIndexRecord({ slug: 'synthetic', name: 'Synthetic', summary: 'x'.repeat(300) }).summary).length).toBeLessThanOrEqual(240)
    expect(collapseRepeatedNouns('NF-kB modulation and NF-kB')).toBe('NF-kB modulation')
  })
})
