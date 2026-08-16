import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { analyzeResearchQuality } from '@/lib/research-quality-analysis'
import { buildResearchGapQueue } from '@/lib/research-quality-policy'

function queueForYears(synthesisYear: number, primaryYear: number) {
  const root = mkdtempSync(path.join(tmpdir(), 'synthesis-refresh-policy-'))
  const dir = path.join(root, 'public', 'data', 'herbs-detail')
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'example.json'), JSON.stringify({
    slug: 'example',
    sources: [
      {
        id: 'review',
        title: 'Systematic review of sleep outcomes',
        year: synthesisYear,
        studyClass: 'systematic-review',
      },
      {
        id: 'trial',
        title: 'Randomized controlled trial of sleep outcomes',
        year: primaryYear,
        studyClass: 'rct',
      },
    ],
    claimMap: [{
      id: 'sleep-outcome',
      claim: 'May improve sleep outcomes.',
      predicate: 'supports_outcome',
      confidence: 0.8,
      reviewStatus: 'approved',
      sourceRefIds: ['review', 'trial'],
    }],
  }))

  try {
    return buildResearchGapQueue(analyzeResearchQuality(root))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

describe('synthesis refresh remediation policy', () => {
  it('adds a freshness reason when newer primary-human evidence outpaces synthesis by five years', () => {
    const item = queueForYears(2018, 2023).find((row) => row.url === '/herbs/example/')
    expect(item?.reasonCounts['synthesis-outpaced-by-newer-primary-evidence']).toBe(1)
    expect(item?.dimensionScores.freshness).toBeGreaterThanOrEqual(15)
  })

  it('does not add the synthesis refresh reason below the five-year threshold', () => {
    const item = queueForYears(2019, 2023).find((row) => row.url === '/herbs/example/')
    expect(item?.reasonCounts['synthesis-outpaced-by-newer-primary-evidence'] ?? 0).toBe(0)
  })
})
