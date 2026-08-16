import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { analyzeStudyClassConflicts } from '@/lib/research-study-class-conflicts'

function analyzeWithSources(sources: Array<Record<string, unknown>>) {
  const root = mkdtempSync(path.join(tmpdir(), 'study-class-conflict-'))
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'example.json'), JSON.stringify({
    slug: 'example',
    sources,
    claimMap: [
      { id: 'c1', predicate: 'supports_outcome', reviewStatus: 'approved', sourceRefIds: sources.map((source) => source.id) },
    ],
  }))
  return { root, result: analyzeStudyClassConflicts(analyzeResearchQuality(root)) }
}

describe('canonical study classification conflicts', () => {
  it('marks cross-family alias classifications as severe', () => {
    const { root, result } = analyzeWithSources([
      { id: 'a', pmid: '12345678', studyClass: 'rct' },
      { id: 'b', pmid: '12345678', studyClass: 'narrative-review' },
    ])
    try {
      expect(result.summary).toMatchObject({
        canonicalStudiesChecked: 1,
        studiesWithClassConflict: 1,
        severeClassConflicts: 1,
      })
      expect(result.severeConflicts[0]).toMatchObject({
        classes: ['narrative-review', 'rct'],
        families: ['narrative', 'primary-human'],
        severe: true,
      })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('reports but does not mark near-neighbor primary-human disagreements severe', () => {
    const { root, result } = analyzeWithSources([
      { id: 'a', doi: '10.1000/example', studyClass: 'rct' },
      { id: 'b', doi: '10.1000/example', studyClass: 'controlled-trial' },
    ])
    try {
      expect(result.summary.studiesWithClassConflict).toBe(1)
      expect(result.summary.severeClassConflicts).toBe(0)
      expect(result.conflicts[0].families).toEqual(['primary-human'])
      expect(result.conflicts[0].severe).toBe(false)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('ignores duplicate aliases that agree on classification', () => {
    const { root, result } = analyzeWithSources([
      { id: 'a', pmid: '12345678', studyClass: 'rct' },
      { id: 'b', pmid: '12345678', studyClass: 'rct' },
    ])
    try {
      expect(result.summary.studiesWithClassConflict).toBe(0)
      expect(result.conflicts).toHaveLength(0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
