import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue } from '@/lib/research-quality-policy'
import { buildResearchQualityTopology } from '@/lib/research-quality-topology'

describe('study identity coverage', () => {
  it('surfaces uncertain independence when multi-study support includes fallback identities', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'study-identity-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
        slug: 'example',
        sources: [
          { id: 'stable', pmid: '11111111', studyClass: 'rct' },
          { id: 'anonymous', title: 'Anonymous clinical report', studyClass: 'rct' },
        ],
        claimMap: [
          {
            id: 'outcome',
            predicate: 'supports_outcome',
            confidence: 0.9,
            reviewStatus: 'approved',
            sourceRefIds: ['stable', 'anonymous'],
          },
        ],
      }))

      const analysis = analyzeResearchQuality(root)
      const topology = buildResearchQualityTopology(analysis)
      const claimCoverage = topology.studyIdentityCoverage.claims[0]
      const profileCoverage = topology.studyIdentityCoverage.profiles[0]
      const gap = buildResearchGapQueue(analysis, topology).find((item) => item.url === '/herbs/example/')

      expect(claimCoverage).toMatchObject({
        studyCount: 2,
        stableIdentityCount: 1,
        fallbackIdentityCount: 1,
        stableIdentityCoverage: 0.5,
        uncertainIndependence: true,
        highConfidenceUncertainIndependence: true,
      })
      expect(profileCoverage).toMatchObject({
        approvedStudyCount: 2,
        stableIdentityCoverage: 0.5,
        uncertainMultiStudyClaimCount: 1,
        highConfidenceUncertainClaimCount: 1,
      })
      expect(gap?.reasonCounts['uncertain-study-identity-independence']).toBe(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
