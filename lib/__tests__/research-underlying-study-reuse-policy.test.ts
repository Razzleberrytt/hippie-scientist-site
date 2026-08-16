import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue } from '@/lib/research-quality-policy'
import { buildResearchQualityTopology } from '@/lib/research-quality-topology'

describe('underlying study publication reuse policy', () => {
  it('aggregates trial-registration and explicit lineage reuse into one concentration signal', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'underlying-study-reuse-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
        slug: 'example',
        sources: [
          {
            id: 'publication-a',
            pmid: '11111111',
            studyClass: 'rct',
            trialRegistrationId: 'NCT00001234',
            parentStudyId: 'parent-alpha',
          },
          {
            id: 'publication-b',
            pmid: '22222222',
            studyClass: 'rct',
            trialRegistrationId: 'NCT00001234',
            parentStudyId: 'parent-alpha',
          },
        ],
        claimMap: [
          {
            id: 'outcome',
            predicate: 'supports_outcome',
            confidence: 0.9,
            reviewStatus: 'approved',
            sourceRefIds: ['publication-a', 'publication-b'],
          },
        ],
      }))

      const analysis = analyzeResearchQuality(root)
      const topology = buildResearchQualityTopology(analysis)
      expect(topology.trialRegistrationIndependence.sameTrialReuseClaims).toHaveLength(1)
      expect(topology.evidenceLineage.sharedNonRegistryLineageClaims).toHaveLength(1)

      const gap = buildResearchGapQueue(analysis, topology).find((item) => item.url === '/herbs/example/')
      expect(gap?.reasonCounts['underlying-study-publication-reuse']).toBe(1)
      expect(gap?.reasonCounts['claim-support-underlying-study-publication-reuse']).toBeUndefined()
      expect(gap?.dimensionRawScores.concentration).toBeGreaterThanOrEqual(18)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
