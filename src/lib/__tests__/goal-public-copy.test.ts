import { describe, expect, it } from 'vitest'
import type { GoalContentExtension } from '@/data/goal-content'
import { getPublicGoalContentExtension } from '../goal-public-copy'

const fixture: GoalContentExtension = {
  faqItems: [
    {
      question: 'How do melatonin, valerian, and magnesium compare for sleep?',
      answer: 'Valerian helps reduce sleep latency over weeks.',
    },
  ],
  dosingNotes: [
    {
      compound: 'Valerian Root',
      note: 'Typically 300–600 mg before bed.',
    },
  ],
  evidenceRows: [
    {
      compound: 'Valerian Root',
      evidence: 'Limited to moderate',
      humanData: 'Subjective scales',
      limitation: 'Requires 2–4 weeks for cumulative effect',
    },
  ],
  safetyBullets: ['Review safety.'],
}

describe('getPublicGoalContentExtension', () => {
  it('removes unsupported valerian efficacy and cumulative-effect claims from sleep public copy', () => {
    const result = getPublicGoalContentExtension('sleep', fixture)

    expect(result.faqItems[0].answer).toMatch(/evidence for valerian in insomnia is inconsistent/i)
    expect(result.faqItems[0].answer).not.toMatch(/helps reduce sleep latency/i)
    expect(result.evidenceRows[0].evidence).toBe('Inconsistent / insufficient')
    expect(result.evidenceRows[0].limitation).not.toMatch(/requires 2–4 weeks/i)
    expect(result.dosingNotes[0].note).toMatch(/evidence for insomnia remains inconsistent/i)
  })

  it('does not mutate the source extension', () => {
    const original = fixture.faqItems[0].answer
    getPublicGoalContentExtension('sleep', fixture)
    expect(fixture.faqItems[0].answer).toBe(original)
  })

  it('leaves unrelated goal content unchanged', () => {
    const result = getPublicGoalContentExtension('focus', fixture)
    expect(result.faqItems[0].answer).toBe(fixture.faqItems[0].answer)
    expect(result.evidenceRows[0]).toEqual(fixture.evidenceRows[0])
  })
})
