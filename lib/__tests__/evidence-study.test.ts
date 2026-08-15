import { describe, expect, it } from 'vitest'
import {
  evidenceStudyId,
  normalizeEvidenceRelationship,
  normalizeEvidenceStudyClass,
  parseSampleSize,
  summarizeEvidenceStudies,
  type EvidenceStudyRecord,
} from '@/lib/evidence-study'

function study(overrides: Partial<EvidenceStudyRecord> = {}): EvidenceStudyRecord {
  return {
    id: 'study:test',
    title: 'Test study',
    evidenceClass: 'randomized_controlled_trial',
    relationship: 'supports',
    confidence: 'moderate',
    ...overrides,
  }
}

describe('evidence-study', () => {
  it('normalizes common evidence classes without flattening preclinical work into human evidence', () => {
    expect(normalizeEvidenceStudyClass('double-blind randomized placebo-controlled trial')).toBe('randomized_controlled_trial')
    expect(normalizeEvidenceStudyClass('systematic review')).toBe('systematic_review')
    expect(normalizeEvidenceStudyClass('murine in vivo study')).toBe('animal')
    expect(normalizeEvidenceStudyClass('in vitro cell assay')).toBe('in_vitro')
  })

  it('normalizes directional evidence relationships', () => {
    expect(normalizeEvidenceRelationship('supportive')).toBe('supports')
    expect(normalizeEvidenceRelationship('partially supports')).toBe('mixed')
    expect(normalizeEvidenceRelationship('contradicting')).toBe('contradicts')
    expect(normalizeEvidenceRelationship('null')).toBe('no_clear_effect')
  })

  it('parses participant counts conservatively', () => {
    expect(parseSampleSize('n=1,240 adults')).toBe(1240)
    expect(parseSampleSize(72)).toBe(72)
    expect(parseSampleSize('not reported')).toBeNull()
  })

  it('prefers stable source identifiers for study identity', () => {
    expect(evidenceStudyId({ pmid: '12345678', doi: '10.1000/test' })).toBe('pmid:12345678')
    expect(evidenceStudyId({ doi: '10.1000/Test' })).toBe('doi:10.1000/test')
  })

  it('surfaces heterogeneity instead of averaging disagreement away', () => {
    const metrics = summarizeEvidenceStudies([
      study({ id: 'a', relationship: 'supports', sampleSize: 100 }),
      study({ id: 'b', relationship: 'contradicts', sampleSize: 120 }),
      study({ id: 'c', evidenceClass: 'animal', relationship: 'background', sampleSize: 40 }),
    ])

    expect(metrics.humanTrials).toBe(2)
    expect(metrics.approximateParticipants).toBe(220)
    expect(metrics.supportive).toBe(1)
    expect(metrics.contradicting).toBe(1)
    expect(metrics.consistency).toBe('conflicting')
  })
})
