import { describe, expect, it } from 'vitest'

import { classifyHealthContentPurpose } from '@/src/lib/health-content-purpose'

describe('classifyHealthContentPurpose', () => {
  it('keeps general wellness research out of disease-treatment classification', () => {
    expect(classifyHealthContentPurpose({
      path: '/guides/stress/',
      title: 'Supplements for Stress Research',
      description: 'Compare evidence, dose, and safety for everyday stress support.',
    }).purpose).toBe('symptom-education')
  })

  it('classifies named diseases as YMYL education even without treatment language', () => {
    const result = classifyHealthContentPurpose({
      title: 'Berberine evidence in type 2 diabetes',
      description: 'A review of randomized trials and limitations.',
    })

    expect(result.purpose).toBe('disease-education')
    expect(result.ymyl).toBe(true)
  })

  it('escalates disease + treatment language to disease-treatment', () => {
    const result = classifyHealthContentPurpose({
      title: 'Can supplements treat ADHD?',
      description: 'Treatment claims and evidence limits.',
    })

    expect(result.purpose).toBe('disease-treatment')
    expect(result.ymyl).toBe(true)
  })

  it('does not treat a symptom query as a named disease', () => {
    const result = classifyHealthContentPurpose({
      title: 'Supplements for brain fog and fatigue',
    })

    expect(result.purpose).toBe('symptom-education')
    expect(result.ymyl).toBe(false)
  })

  it('allows explicit editorial classification to override heuristics', () => {
    const result = classifyHealthContentPurpose({
      title: 'A deliberately educational diabetes page',
      explicitPurpose: 'disease-education',
    })

    expect(result).toMatchObject({ purpose: 'disease-education', ymyl: true })
  })
})
