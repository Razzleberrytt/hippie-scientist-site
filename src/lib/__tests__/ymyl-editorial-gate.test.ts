import { describe, expect, it } from 'vitest'

import { evaluateYmylEditorialGate } from '@/src/lib/ymyl-editorial-gate'

describe('evaluateYmylEditorialGate', () => {
  it('keeps the baseline lightweight for ordinary wellness content', () => {
    const result = evaluateYmylEditorialGate({
      title: 'Everyday stress research',
      hasDirectAnswer: true,
    })

    expect(result).toMatchObject({ ymyl: false, canPublish: true })
    expect(result.required).toEqual(['direct-answer'])
  })

  it('blocks disease education that lacks safety and evidence context', () => {
    const result = evaluateYmylEditorialGate({
      title: 'Berberine evidence in type 2 diabetes',
      hasDirectAnswer: true,
      primarySourceCount: 2,
      hasEvidenceLimitations: true,
      hasSafetySection: false,
      hasMedicationContext: false,
      hasEditorialReview: true,
    })

    expect(result.purpose).toBe('disease-education')
    expect(result.canPublish).toBe(false)
    expect(result.missing).toEqual(expect.arrayContaining(['safety-section', 'medication-context']))
  })

  it('requires a higher source count and treatment boundary for disease-treatment intent', () => {
    const result = evaluateYmylEditorialGate({
      title: 'Can supplements treat ADHD?',
      hasDirectAnswer: true,
      primarySourceCount: 2,
      hasEvidenceLimitations: true,
      hasSafetySection: true,
      hasMedicationContext: true,
      hasTreatmentBoundary: false,
      hasEditorialReview: true,
    })

    expect(result.purpose).toBe('disease-treatment')
    expect(result.canPublish).toBe(false)
    expect(result.missing).toEqual(expect.arrayContaining(['primary-sources', 'treatment-boundary']))
  })

  it('passes disease-treatment content only after every stricter requirement is met', () => {
    const result = evaluateYmylEditorialGate({
      title: 'Can supplements treat ADHD?',
      hasDirectAnswer: true,
      primarySourceCount: 3,
      hasEvidenceLimitations: true,
      hasSafetySection: true,
      hasMedicationContext: true,
      hasTreatmentBoundary: true,
      hasEditorialReview: true,
    })

    expect(result).toMatchObject({ purpose: 'disease-treatment', ymyl: true, canPublish: true })
    expect(result.missing).toEqual([])
  })
})
