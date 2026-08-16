import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeClaimCitationMetadata } from '@/lib/research-claim-citation-metadata'
import { analyzeResearchQuality } from '@/lib/research-quality-analysis'

function run(sources: Array<Record<string, unknown>>, sourceRefIds: string[]) {
  const root = mkdtempSync(path.join(tmpdir(), 'claim-citation-metadata-'))
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'example.json'), JSON.stringify({
    slug: 'example',
    sources,
    claimMap: [{
      id: 'c1',
      claim: 'Improves sleep symptoms',
      predicate: 'supports_outcome',
      confidence: 0.85,
      reviewStatus: 'approved',
      sourceRefIds,
    }],
  }))
  return { root, result: analyzeClaimCitationMetadata(analyzeResearchQuality(root)) }
}

const complete = (id: string, pmid: string) => ({
  id,
  pmid,
  title: `Complete study ${pmid}`,
  year: 2024,
  authors: 'Smith A; Jones B',
  journal: 'Journal of Evidence',
  studyClass: 'rct',
})

describe('claim-linked citation metadata coverage', () => {
  it('flags a high-confidence claim when field-level metadata coverage is below 70%', () => {
    const { root, result } = run([
      complete('s1', '11111111'),
      { id: 's2', pmid: '22222222', studyClass: 'rct' },
    ], ['s1', 's2'])
    try {
      expect(result.summary).toMatchObject({
        approvedClaimsWithStudies: 1,
        lowMetadataCoverageClaims: 1,
        highConfidenceLowMetadataCoverageClaims: 1,
        averageMetadataCoverage: 0.5,
        averageFieldMetadataCoverage: 0.6,
      })
      expect(result.claims[0]).toMatchObject({
        studyCount: 2,
        completeStudyCount: 1,
        metadataCoverage: 0.5,
        fieldMetadataCoverage: 0.6,
        lowMetadataCoverage: true,
        highConfidenceLowMetadataCoverage: true,
      })
      expect(result.claims[0].missingFieldCounts).toMatchObject({ title: 1, year: 1, authors: 1, journal: 1 })
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('does not treat mostly-complete citations like empty citation rows', () => {
    const almostComplete = (id: string, pmid: string) => {
      const { authors: _authors, ...source } = complete(id, pmid)
      return source
    }
    const { root, result } = run([
      almostComplete('s1', '11111111'),
      almostComplete('s2', '22222222'),
    ], ['s1', 's2'])
    try {
      expect(result.claims[0]).toMatchObject({
        completeStudyCount: 0,
        metadataCoverage: 0,
        fieldMetadataCoverage: 0.8,
        lowMetadataCoverage: false,
        highConfidenceLowMetadataCoverage: false,
      })
      expect(result.claims[0].missingFieldCounts).toEqual({ authors: 2 })
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('merges alias metadata before judging canonical study completeness', () => {
    const { root, result } = run([
      { id: 's1a', pmid: '11111111', studyClass: 'rct' },
      complete('s1b', '11111111'),
      complete('s2', '22222222'),
    ], ['s1a', 's1b', 's2'])
    try {
      expect(result.claims[0]).toMatchObject({
        studyCount: 2,
        completeStudyCount: 2,
        metadataCoverage: 1,
        fieldMetadataCoverage: 1,
        lowMetadataCoverage: false,
      })
      expect(result.claims[0].missingFieldCounts).toEqual({})
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})
