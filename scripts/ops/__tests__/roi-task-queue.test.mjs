import { describe, expect, it } from 'vitest'

import { normalizeConfidence, rankTasks, scoreTask } from '../roi-task-queue.mjs'

/**
 * These four cases were written against `node:test`, but nothing in the
 * repository runs `node --test`, so they had never executed. Vitest collected
 * the file by extension, found no suite it recognised, and failed the run.
 * Converted so the assertions actually guard the scoring rules they describe.
 */

describe('roi task queue', () => {
  it('normalizes percentage confidence values', () => {
    expect(normalizeConfidence(80)).toBe(0.8)
    expect(normalizeConfidence(0.8)).toBe(0.8)
  })

  it('uses impact × confidence / effort as the assumption score', () => {
    const scored = scoreTask({ id: 1, title: 'Example', impact: 10, confidence: 80, effort: 2 })
    expect(scored.assumptionScore).toBe(4)
    expect(scored.priorityScore).toBe(4)
  })

  it('lets fresh observed performance outrank assumptions', () => {
    const ranked = rankTasks([
      { id: 'assumed', title: 'Assumed winner', impact: 10, confidence: 90, effort: 2 },
      {
        id: 'measured',
        title: 'Measured winner',
        impact: 8,
        confidence: 70,
        effort: 2,
        performance: { sampleSize: 5000, observationDays: 28, organicClicksDeltaPct: 50, revenueDeltaPct: 60 },
      },
    ])
    expect(ranked[0].id).toBe('measured')
    expect(ranked[0].rankingBasis).toBe('blended-with-observed-performance')
  })

  it('rejects tasks without confidence', () => {
    // Scoring divides by confidence, so a missing value must fail loudly rather
    // than silently rank the task as if it were certain.
    expect(() => scoreTask({ id: 1, title: 'Missing confidence', impact: 10, effort: 2 })).toThrow(/confidence/)
  })
})
