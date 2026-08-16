import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue, RESEARCH_GAP_DIMENSION_CAPS } from '@/lib/research-quality-policy'
import { buildResearchQualityTopology } from '@/lib/research-quality-topology'

describe('research-gap dimension scoring', () => {
  it('caps correlated concentration signals while preserving the raw score', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'research-gap-dimensions-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'concentrated.json'), JSON.stringify({
        slug: 'concentrated',
        sources: [
          { id: 'study', pmid: '11111111', year: 2024, studyClass: 'rct' },
        ],
        claimMap: Array.from({ length: 5 }, (_, index) => ({
          id: `claim-${index + 1}`,
          predicate: 'supports_outcome',
          confidence: 0.95,
          reviewStatus: 'approved',
          sourceRefIds: ['study'],
        })),
      }))

      const analysis = analyzeResearchQuality(root)
      const topology = buildResearchQualityTopology(analysis)
      const item = buildResearchGapQueue(analysis, topology)[0]

      expect(item.dimensionRawScores.concentration).toBeGreaterThan(RESEARCH_GAP_DIMENSION_CAPS.concentration)
      expect(item.dimensionScores.concentration).toBe(RESEARCH_GAP_DIMENSION_CAPS.concentration)
      expect(item.cappedDimensions).toContain('concentration')
      expect(item.rawScore).toBeGreaterThan(item.score)
      expect(item.reasons.every((reason) => Boolean(reason.dimension))).toBe(true)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('keeps structural invalidity dominant over a saturated concentration dimension', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'research-gap-structural-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'invalid.json'), JSON.stringify({
        slug: 'invalid',
        sources: [],
        claimMap: [
          { id: 'unsupported-1', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: [] },
          { id: 'unsupported-2', predicate: 'supports_outcome', confidence: 0.8, reviewStatus: 'approved', sourceRefIds: [] },
        ],
      }))
      writeFileSync(path.join(detailDir, 'concentrated.json'), JSON.stringify({
        slug: 'concentrated',
        sources: [
          { id: 'study', pmid: '11111111', year: 2024, studyClass: 'rct' },
        ],
        claimMap: Array.from({ length: 6 }, (_, index) => ({
          id: `claim-${index + 1}`,
          predicate: 'supports_outcome',
          confidence: 0.95,
          reviewStatus: 'approved',
          sourceRefIds: ['study'],
        })),
      }))

      const analysis = analyzeResearchQuality(root)
      const queue = buildResearchGapQueue(analysis, buildResearchQualityTopology(analysis))
      const invalid = queue.find((item) => item.url === '/herbs/invalid/')
      const concentrated = queue.find((item) => item.url === '/herbs/concentrated/')

      expect(invalid?.dimensionScores.structural).toBe(200)
      expect(concentrated?.dimensionScores.concentration).toBe(RESEARCH_GAP_DIMENSION_CAPS.concentration)
      expect(invalid?.score ?? 0).toBeGreaterThan(concentrated?.score ?? 0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
