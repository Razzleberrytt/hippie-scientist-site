import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { analyzeResearchSemanticAlignment } from '@/lib/research-semantic-alignment'

function runWithSources(
  sources: Array<Record<string, unknown>>,
  confidence = 0.8,
  abstracts: Record<string, string> = {},
  claim = 'Improves sleep symptoms in adults',
) {
  const root = mkdtempSync(path.join(tmpdir(), 'semantic-coverage-'))
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'example.json'), JSON.stringify({
    slug: 'example',
    sources,
    claimMap: [{
      id: 'sleep-outcome',
      claim,
      predicate: 'supports_outcome',
      confidence,
      reviewStatus: 'approved',
      sourceRefIds: sources.map((source) => source.id),
    }],
  }))
  if (Object.keys(abstracts).length) {
    const cacheDir = path.join(root, 'ops', 'cache')
    mkdirSync(cacheDir, { recursive: true })
    writeFileSync(path.join(cacheDir, 'pubmed-abstracts.json'), JSON.stringify({ abstracts }))
  }
  return { root, report: analyzeResearchSemanticAlignment(analyzeResearchQuality(root)) }
}

describe('research semantic metadata coverage', () => {
  it('does not count linked-but-uninformative sources as semantically comparable', () => {
    const { root, report } = runWithSources([
      { id: 's1', pmid: '11111111', studyClass: 'rct', title: '' },
      { id: 's2', pmid: '22222222', studyClass: 'rct', title: '' },
    ])
    try {
      expect(report.summary).toMatchObject({
        semanticallyAssessableClaims: 1,
        semanticallyComparableClaims: 0,
        fullySemanticallyAssessableClaims: 0,
        semanticCoverageGapClaims: 1,
        highConfidenceSemanticCoverageGaps: 1,
      })
      expect(report.coverageGapFindings[0]).toMatchObject({
        sourceCount: 2,
        comparableSourceCount: 0,
        uncertainSourceCount: 2,
        semanticMetadataCoverage: 0,
        semanticCoverageGap: true,
      })
      expect(report.summary.anyMismatch).toBe(0)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('separates partial semantic coverage from explicit mismatch', () => {
    const { root, report } = runWithSources([
      { id: 's1', pmid: '11111111', studyClass: 'rct', title: 'Randomized placebo trial improved sleep symptoms' },
      { id: 's2', pmid: '22222222', studyClass: 'rct', title: '' },
      { id: 's3', pmid: '33333333', studyClass: 'rct', title: '' },
    ])
    try {
      const gap = report.coverageGapFindings[0]
      expect(gap.comparableSourceCount).toBe(1)
      expect(gap.semanticMetadataCoverage).toBeCloseTo(1 / 3, 3)
      expect(gap.alignedSourceCount).toBe(1)
      expect(gap.explicitMismatchSourceCount).toBe(0)
      expect(gap.semanticCoverageGap).toBe(true)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('does not flag well-described linked evidence as a coverage gap', () => {
    const { root, report } = runWithSources([
      { id: 's1', pmid: '11111111', studyClass: 'rct', title: 'Randomized placebo trial improved sleep symptoms' },
      { id: 's2', pmid: '22222222', studyClass: 'rct', title: 'Clinical trial of insomnia treatment and sleep outcomes' },
    ])
    try {
      expect(report.summary.semanticCoverageGapClaims).toBe(0)
      expect(report.summary.fullySemanticallyAssessableClaims).toBe(1)
      expect(report.coverageGapFindings).toHaveLength(0)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('uses cached abstracts for domain/population context without letting incidental safety text change study role', () => {
    const { root, report } = runWithSources(
      [
        { id: 's1', pmid: '11111111', studyClass: 'rct', title: 'Randomized placebo-controlled trial' },
        { id: 's2', pmid: '22222222', studyClass: 'rct', title: 'Double-blind clinical trial' },
      ],
      0.9,
      {
        '11111111': 'Older adults with insomnia were randomized. Sleep outcomes improved. Adverse events were monitored.',
        '22222222': 'Elderly participants with insomnia completed a placebo-controlled sleep study. Safety and tolerability were also assessed.',
      },
      'Improves sleep symptoms in older adults',
    )
    try {
      expect(report.summary).toMatchObject({
        semanticallyComparableClaims: 1,
        fullySemanticallyAssessableClaims: 1,
        semanticCoverageGapClaims: 0,
        anyMismatch: 0,
      })
      expect(report.coverageGapFindings).toHaveLength(0)
      const finding = report.concentrationFindings[0] ?? report.findings[0]
      expect(finding).toBeUndefined()

      // Re-run from the report's internally analyzed claim via summary-facing
      // behavior: both sources were assessable/aligned despite sparse titles.
      expect(report.summary.semanticSingleSourceClaims).toBe(0)
      expect(report.summary.semanticSupportConcentratedClaims).toBe(0)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})
