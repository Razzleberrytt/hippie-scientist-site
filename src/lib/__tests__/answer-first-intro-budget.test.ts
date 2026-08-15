import { describe, expect, it } from 'vitest'

import { evaluateIntroBudget } from '@/src/lib/answer-first-intro-budget'

describe('evaluateIntroBudget', () => {
  it('passes a short setup followed by a direct answer', () => {
    const result = evaluateIntroBudget({
      intro: 'Magnesium forms differ in absorption, tolerability, and evidence. The useful choice depends on the outcome and form actually studied.',
      directAnswerPresent: true,
      directAnswerBeforeLongBody: true,
    })

    expect(result.passes).toBe(true)
    expect(result.reasons).toEqual([])
  })

  it('flags intros that become a wall of setup copy', () => {
    const intro = Array.from({ length: 90 }, (_, index) => `word${index}`).join(' ')
    const result = evaluateIntroBudget({ intro, directAnswerPresent: true, directAnswerBeforeLongBody: true })

    expect(result.passes).toBe(false)
    expect(result.reasons).toContain('intro-too-long')
  })

  it('flags too many setup sentences even when the word count is low', () => {
    const result = evaluateIntroBudget({
      intro: 'First point. Second point. Third point. Fourth point.',
      directAnswerPresent: true,
      directAnswerBeforeLongBody: true,
    })

    expect(result.reasons).toContain('too-many-intro-sentences')
  })

  it('fails when the answer is missing or appears after the long body', () => {
    const result = evaluateIntroBudget({
      intro: 'Short intro.',
      directAnswerPresent: false,
      directAnswerBeforeLongBody: false,
    })

    expect(result.reasons).toEqual(expect.arrayContaining(['missing-direct-answer', 'answer-after-long-body']))
  })
})
