import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '../research-quality-analysis'
import { buildResearchGapQueue } from '../research-quality-policy'
import { buildResearchQualityTopology } from '../research-quality-topology'

describe('underlying-study adjusted profile dependency policy', () => {
  it('routes false publication diversification into the existing high-study-dependency reason', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'underlying-profile-policy-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
        slug: 'example',
        sources: [
          { id: 'a', pmid: '11111111', studyClass: 'rct', trialRegistrationId: 'NCT01234567' },
          { id: 'b', pmid: '22222222', studyClass: 'rct', trialRegistrationId: 'NCT01234567', cohortId: 'cohort-1' },
          { id: 'c', pmid: '33333333', studyClass: 'rct', cohortId: 'cohort-1' },
        ],
        claimMap: [
          { id: 'claim-ac', predicate: 'supports_outcome', confidence: 0.9, reviewStatus: 'approved', sourceRefIds: ['a', 'c'] },
          { id: 'claim-b', predicate: 'supports_outcome', confidence: 0.9, reviewStatus: 'approved', sourceRefIds: ['b'] },
          { id: 'claim-a', predicate: 'supports_outcome', confidence: 0.9, reviewStatus: 'approved', sourceRefIds: ['a'] },
        ],
      }))

      const analysis = analyzeResearchQuality(root)
      expect(analysis.profileAnalyses[0].overDependentOnSingleStudy).toBe(false)

      const topology = buildResearchQualityTopology(analysis)
      expect(topology.underlyingStudyIndependence.newlyOverDependentProfiles).toHaveLength(1)

      const gap = buildResearchGapQueue(analysis, topology).find((item) => item.url === '/herbs/example/')
      expect(gap?.reasonCounts['high-study-dependency']).toBe(1)
      expect(gap?.reasons.find((reason) => reason.kind === 'high-study-dependency')?.detail)
        .toContain('underlying study after explicit publication-lineage collapse')
      expect(gap?.dimensionRawScores.concentration).toBeGreaterThan(0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
