import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { extractCitationsFromRecord } from '@/lib/citations'
import { analyzeResearchQuality } from '@/lib/research-quality-analysis'

const roots: string[] = []

afterEach(() => {
  while (roots.length) rmSync(roots.pop() as string, { recursive: true, force: true })
})

describe('packed PMID study splitting', () => {
  it('expands one packed research source into distinct canonical studies and claim edges', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'ths-packed-pmid-'))
    roots.push(root)
    const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
    mkdirSync(detailDir, { recursive: true })

    writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
      slug: 'example',
      sources: [{
        id: 's1',
        pmid: '15070181; 22167571',
        doi: '10.1000/ambiguous-packed-doi',
        studyClass: 'rct',
        title: 'Legacy packed trial row',
      }],
      claimMap: [{
        id: 'claim-1',
        predicate: 'supports_outcome',
        reviewStatus: 'approved',
        confidence: 0.8,
        sourceRefIds: ['s1'],
      }],
    }))

    const analysis = analyzeResearchQuality(root)
    const profile = analysis.profiles[0]
    const claim = analysis.claimAnalyses[0]

    expect(profile.record.sources).toHaveLength(2)
    expect(profile.record.sources?.map((source) => source.pmid)).toEqual(['15070181', '22167571'])
    expect(profile.record.sources?.map((source) => source.id)).toEqual(['s1', 's1::pmid:22167571'])
    expect(profile.record.sources?.every((source) => source.doi === undefined)).toBe(true)
    expect(profile.record.claimMap?.[0].sourceRefIds).toEqual(['s1', 's1::pmid:22167571'])
    expect(claim).toMatchObject({
      sourceRefCount: 2,
      validSourceRefCount: 2,
      studyCount: 2,
      structuredSupportTier: 'adequate',
      singleStudy: false,
    })
    expect(analysis.profileAnalyses[0].canonicalStudyCount).toBe(2)
  })

  it('emits separate public citation entities for packed structured PMIDs', () => {
    const citations = extractCitationsFromRecord({
      sources: [{
        title: 'Legacy packed trial row',
        pmid: '15070181; 22167571',
        doi: '10.1000/ambiguous-packed-doi',
        study_type: 'randomized controlled trial',
      }],
    })

    expect(citations).toHaveLength(2)
    expect(citations.map((citation) => citation.id)).toEqual(['pmid:15070181', 'pmid:22167571'])
    expect(citations.map((citation) => citation.pmid)).toEqual(['15070181', '22167571'])
    expect(citations.every((citation) => citation.doi === undefined)).toBe(true)
  })

  it('splits packed entries in the legacy pmids array too', () => {
    const citations = extractCitationsFromRecord({ pmids: ['15070181; 22167571'] })

    expect(citations.map((citation) => citation.id)).toEqual(['pmid:15070181', 'pmid:22167571'])
  })
})
