import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue } from '@/lib/research-quality-policy'

describe('primary-human evidence mapping states', () => {
  it('flags truly unmapped human evidence separately from true absence', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'unmapped-human-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
        slug: 'example',
        sources: [
          { id: 'orphan-rct', pmid: '11111111', studyClass: 'rct' },
          { id: 'review-1', pmid: '22222222', studyClass: 'narrative-review' },
          { id: 'review-2', pmid: '33333333', studyClass: 'narrative-review' },
        ],
        claimMap: [
          {
            id: 'outcome',
            predicate: 'supports_outcome',
            confidence: 0.7,
            reviewStatus: 'approved',
            sourceRefIds: ['review-1', 'review-2'],
          },
        ],
      }))

      const analysis = analyzeResearchQuality(root)
      const profile = analysis.profileAnalyses[0]
      const gap = buildResearchGapQueue(analysis).find((item) => item.url === '/herbs/example/')

      expect(profile).toMatchObject({
        primaryHuman: 1,
        claimLinkedPrimaryHuman: 0,
        structuredClaimLinkedPrimaryHuman: 0,
        unmappedPrimaryHuman: 1,
        unapprovedOnlyPrimaryHuman: 0,
        noPrimaryHuman: true,
      })
      expect(gap?.reasonCounts['unmapped-primary-human-evidence']).toBe(1)
      expect(gap?.reasonCounts['primary-human-evidence-only-on-unapproved-claims']).toBeUndefined()
      expect(gap?.reasonCounts['approved-claims-without-primary-human-study']).toBe(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('distinguishes human evidence already mapped to an unapproved claim', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'pending-human-'))
    try {
      const detailDir = path.join(root, 'public', 'data', 'herbs-detail')
      mkdirSync(detailDir, { recursive: true })
      writeFileSync(path.join(detailDir, 'example.json'), JSON.stringify({
        slug: 'example',
        sources: [
          { id: 'rct', pmid: '11111111', studyClass: 'rct' },
          { id: 'review-1', pmid: '22222222', studyClass: 'narrative-review' },
          { id: 'review-2', pmid: '33333333', studyClass: 'narrative-review' },
        ],
        claimMap: [
          {
            id: 'approved-outcome',
            predicate: 'supports_outcome',
            confidence: 0.7,
            reviewStatus: 'approved',
            sourceRefIds: ['review-1', 'review-2'],
          },
          {
            id: 'pending-human',
            predicate: 'supports_outcome',
            confidence: 0.7,
            reviewStatus: 'pending',
            sourceRefIds: ['rct'],
          },
        ],
      }))

      const analysis = analyzeResearchQuality(root)
      const profile = analysis.profileAnalyses[0]
      const gap = buildResearchGapQueue(analysis).find((item) => item.url === '/herbs/example/')

      expect(profile).toMatchObject({
        primaryHuman: 1,
        claimLinkedPrimaryHuman: 0,
        structuredClaimLinkedPrimaryHuman: 1,
        unmappedPrimaryHuman: 0,
        unapprovedOnlyPrimaryHuman: 1,
        noPrimaryHuman: true,
      })
      expect(gap?.reasonCounts['unmapped-primary-human-evidence']).toBeUndefined()
      expect(gap?.reasonCounts['primary-human-evidence-only-on-unapproved-claims']).toBe(1)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
