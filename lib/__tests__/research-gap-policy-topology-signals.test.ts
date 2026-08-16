import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue } from '@/lib/research-quality-policy'
import { buildResearchQualityTopology } from '@/lib/research-quality-topology'

function setupRoot() {
  const root = mkdtempSync(path.join(tmpdir(), 'gap-policy-topology-'))
  const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
  const cacheDir = path.join(root, 'ops', 'cache')
  mkdirSync(detailDir, { recursive: true })
  mkdirSync(cacheDir, { recursive: true })

  writeFileSync(path.join(cacheDir, 'pubmed-metadata.json'), JSON.stringify({
    records: {
      '11111111': { authorList: ['Smith A'], journal: 'Journal X' },
      '22222222': { authorList: ['Smith A'], journal: 'Journal X' },
      '33333333': { authorList: ['Smith A'], journal: 'Journal X' },
      '44444444': { authorList: ['Jones B'], journal: 'Journal Y' },
    },
  }))

  writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
    slug: 'example',
    sources: [
      { id: 'n1', pmid: '11111111', studyClass: 'narrative-review' },
      { id: 'n2', pmid: '22222222', studyClass: 'narrative-review' },
      { id: 'n3', pmid: '33333333', studyClass: 'narrative-review' },
      { id: 'r1', pmid: '44444444', studyClass: 'rct' },
    ],
    claimMap: [
      { id: 'c1', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['n1', 'n2', 'r1'] },
      { id: 'c2', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['n1', 'n2'] },
      { id: 'c3', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: ['n1', 'n3'] },
    ],
  }))

  return root
}

describe('declarative research-gap topology signals', () => {
  it('routes edge-weighted design and provenance concentration into capped dimensions', () => {
    const root = setupRoot()
    try {
      const analysis = analyzeResearchQuality(root)
      const topology = buildResearchQualityTopology(analysis)
      const gap = buildResearchGapQueue(analysis, topology)[0]

      expect(gap.reasonCounts['edge-weighted-narrative-dominance']).toBe(1)
      expect(gap.reasonCounts['provenance-concentrated-evidence']).toBe(1)
      expect(gap.dimensionRawScores['evidence-mix']).toBeGreaterThanOrEqual(12)
      expect(gap.dimensionRawScores.concentration).toBeGreaterThanOrEqual(10)
      expect(gap.dimensionScores['evidence-mix']).toBeLessThanOrEqual(60)
      expect(gap.dimensionScores.concentration).toBeLessThanOrEqual(80)
      expect(gap.rawScore).toBeGreaterThanOrEqual(gap.score)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
