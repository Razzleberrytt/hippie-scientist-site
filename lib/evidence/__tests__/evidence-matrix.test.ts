import { describe, expect, it } from 'vitest'
import {
  auditMarketingAgainstEvidence,
  buildOutcomeEvidenceMatrix,
  quarterlyAuditSnapshot,
  type OutcomeEvidenceCell,
} from '../evidence-matrix'

const cells: OutcomeEvidenceCell[] = [
  {
    ingredientId: 'a', outcomeId: 'sleep-quality', grade: 'B', independentTrialCount: 3,
    publicationCount: 3, participantCount: 280, weightedEvidenceScore: 72, direction: 'benefit', popularityScore: 35,
  },
  {
    ingredientId: 'b', outcomeId: 'sleep-quality', grade: 'C', independentTrialCount: 7,
    publicationCount: 11, participantCount: 900, weightedEvidenceScore: 55, direction: 'mixed', popularityScore: 88,
    marketingClaims: ['sleep deeper', 'sleep faster', 'wake refreshed'],
  },
]

describe('outcome evidence matrix', () => {
  it('does not conflate most studied with best supported', () => {
    const row = buildOutcomeEvidenceMatrix(cells)[0]
    expect(row.mostStudied?.ingredientId).toBe('b')
    expect(row.bestSupported?.ingredientId).toBe('a')
  })

  it('surfaces popular but weak or mixed evidence', () => {
    const row = buildOutcomeEvidenceMatrix(cells)[0]
    expect(row.popularButWeakEvidence.map((cell) => cell.ingredientId)).toContain('b')
  })
})

describe('marketing audit', () => {
  it('flags evidence/marketing mismatch without using publication volume as proof', () => {
    const audit = auditMarketingAgainstEvidence(cells).find((item) => item.ingredientId === 'b')
    expect(audit?.classification).toBe('overmarketed')
    expect(audit?.notes.some((note) => note.includes('independent-trial'))).toBe(true)
  })

  it('produces quarterly visualization-ready snapshots', () => {
    const snapshot = quarterlyAuditSnapshot(cells, '2026-08-15')
    expect(snapshot.asOf).toBe('2026-08-15')
    expect(snapshot.data).toHaveLength(2)
  })
})
