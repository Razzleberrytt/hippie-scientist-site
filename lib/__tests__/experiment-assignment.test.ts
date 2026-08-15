import { describe, expect, it } from 'vitest'
import { assignExperimentVariant, experimentBucket } from '@/lib/experiment-assignment'

describe('experiment assignment', () => {
  it('returns a stable bucket for the same experiment and anonymous subject', () => {
    expect(experimentBucket('newsletter-v1', 'anonymous-123')).toBe(
      experimentBucket('newsletter-v1', 'anonymous-123'),
    )
  })

  it('keeps the bucket inside the half-open unit interval', () => {
    for (let index = 0; index < 100; index += 1) {
      const bucket = experimentBucket('newsletter-v1', `subject-${index}`)
      expect(bucket).toBeGreaterThanOrEqual(0)
      expect(bucket).toBeLessThan(1)
    }
  })

  it('assigns the same variant repeatedly for a subject', () => {
    const variants = [{ id: 'a' }, { id: 'b' }] as const
    const first = assignExperimentVariant('newsletter-v1', 'anonymous-123', variants)
    const second = assignExperimentVariant('newsletter-v1', 'anonymous-123', variants)
    expect(second).toBe(first)
  })

  it('respects a zero-weight variant', () => {
    const variants = [
      { id: 'disabled', weight: 0 },
      { id: 'active', weight: 1 },
    ] as const

    for (let index = 0; index < 50; index += 1) {
      expect(assignExperimentVariant('weighted-v1', `subject-${index}`, variants)).toBe('active')
    }
  })

  it('rejects experiments without a usable allocation', () => {
    expect(() => assignExperimentVariant('empty-v1', 'subject', [])).toThrow(/at least one variant/)
    expect(() =>
      assignExperimentVariant('zero-v1', 'subject', [
        { id: 'a', weight: 0 },
        { id: 'b', weight: 0 },
      ]),
    ).toThrow(/positive variant weight/)
  })
})
