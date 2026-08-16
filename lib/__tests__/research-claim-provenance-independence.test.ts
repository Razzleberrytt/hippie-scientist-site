import { describe, expect, it } from 'vitest'

import { analyzeClaimProvenanceIndependence } from '@/lib/research-claim-provenance-independence'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysis(
  sources: Array<Record<string, unknown>>,
  studyIds: string[],
  confidence = 0.8,
): ResearchQualityAnalysis {
  return {
    cache: {},
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: { slug: 'example', sources, claimMap: [] },
    }],
    claimAnalyses: [{
      url: '/herbs/example/',
      claimId: 'claim-1',
      predicate: 'supports_outcome',
      confidence,
      studyIds,
      studyCount: studyIds.length,
    }],
    structuredClaimAnalyses: [],
    profileAnalyses: [],
  } as unknown as ResearchQualityAnalysis
}

describe('claim provenance independence calibration', () => {
  it('keeps two same-journal studies with different first authors descriptive rather than narrow', () => {
    const input = analysis([
      { id: 's1', pmid: '111', firstAuthor: 'Alpha A', journal: 'Journal X' },
      { id: 's2', pmid: '222', firstAuthor: 'Beta B', journal: 'Journal X' },
    ], ['pmid:111', 'pmid:222'])

    const result = analyzeClaimProvenanceIndependence(input)[0]
    expect(result.sameJournalLineage).toBe(true)
    expect(result.sameFirstAuthorLineage).toBe(false)
    expect(result.journalOnlyNarrowSupport).toBe(false)
    expect(result.provenanceNarrowMultiStudySupport).toBe(false)
  })

  it('flags journal-only narrowing when three known studies all use the same journal', () => {
    const input = analysis([
      { id: 's1', pmid: '111', firstAuthor: 'Alpha A', journal: 'Journal X' },
      { id: 's2', pmid: '222', firstAuthor: 'Beta B', journal: 'Journal X' },
      { id: 's3', pmid: '333', firstAuthor: 'Gamma C', journal: 'Journal X' },
    ], ['pmid:111', 'pmid:222', 'pmid:333'])

    const result = analyzeClaimProvenanceIndependence(input)[0]
    expect(result.journalOnlyNarrowSupport).toBe(true)
    expect(result.provenanceNarrowMultiStudySupport).toBe(true)
  })

  it('still flags two studies sharing the same first-author lineage', () => {
    const input = analysis([
      { id: 's1', pmid: '111', firstAuthor: 'Alpha A', journal: 'Journal X' },
      { id: 's2', pmid: '222', firstAuthor: 'Alpha A', journal: 'Journal Y' },
    ], ['pmid:111', 'pmid:222'])

    const result = analyzeClaimProvenanceIndependence(input)[0]
    expect(result.sameFirstAuthorLineage).toBe(true)
    expect(result.provenanceNarrowMultiStudySupport).toBe(true)
  })
})
