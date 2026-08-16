import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeClaimLanguageCalibration } from '@/lib/research-claim-language-calibration'
import { analyzeResearchQuality } from '@/lib/research-quality-analysis'

function run(studyClass: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'claim-language-direct-'))
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'example.json'), JSON.stringify({
    slug: 'example',
    sources: [{ id: 's1', pmid: '12345678', studyClass }],
    claimMap: [{
      id: 'c1',
      claim: 'Improves sleep symptoms in adults',
      predicate: 'supports_outcome',
      confidence: 0.85,
      reviewStatus: 'approved',
      sourceRefIds: ['s1'],
    }],
  }))
  return { root, report: analyzeClaimLanguageCalibration(analyzeResearchQuality(root)) }
}

describe('direct controlled evidence for causal claim language', () => {
  it('separates synthesis-only causal support from directly linked controlled-human support', () => {
    const { root, report } = run('systematic-review')
    try {
      expect(report.summary).toMatchObject({
        directCausalOutcomeClaims: 1,
        causalWithoutDirectControlledSupport: 1,
        highConfidenceCausalWithoutDirectControlledSupport: 1,
        synthesisOnlyCausalSupport: 1,
        highConfidenceSynthesisOnlyCausalSupport: 1,
        causalWithoutControlledSupport: 0,
      })
      expect(report.synthesisOnlyFindings[0]).toMatchObject({
        controlledHuman: 0,
        synthesis: 1,
        causalWithoutDirectControlledSupport: true,
        synthesisOnlyCausalSupport: true,
        causalWithoutControlledSupport: false,
      })
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('does not flag direct causal language when a controlled human trial is linked', () => {
    const { root, report } = run('rct')
    try {
      expect(report.summary.causalWithoutDirectControlledSupport).toBe(0)
      expect(report.directEvidenceFindings).toHaveLength(0)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })

  it('preserves the stricter legacy finding for causal language backed only by narrative evidence', () => {
    const { root, report } = run('narrative-review')
    try {
      expect(report.summary.causalWithoutDirectControlledSupport).toBe(1)
      expect(report.summary.causalWithoutControlledSupport).toBe(1)
      expect(report.summary.synthesisOnlyCausalSupport).toBe(0)
      expect(report.findings).toHaveLength(1)
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
})
