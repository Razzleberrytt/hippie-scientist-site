import { describe, expect, it } from 'vitest'

import { analyzeEffectCertainty } from '@/lib/research-effect-certainty'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysis(claimText: string, abstract: string): ResearchQualityAnalysis {
  return {
    cache: {
      '123': { abstract },
    },
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: {
        slug: 'example',
        sources: [{ id: 's1', pmid: '123', studyClass: 'rct', title: 'Randomized trial' }],
        claimMap: [{
          id: 'c1',
          claim: claimText,
          predicate: 'supports_outcome',
          confidence: 0.9,
          reviewStatus: 'approved',
          sourceRefIds: ['s1'],
        }],
      },
    }],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
    profileAnalyses: [],
  }
}

describe('effect-size and certainty calibration', () => {
  it('flags strong magnitude wording when linked human evidence explicitly reports only a small effect', () => {
    const report = analyzeEffectCertainty(analysis(
      'Strongly improves sleep quality',
      'The randomized trial found a small improvement in sleep quality.',
    ))
    expect(report.findings[0]).toMatchObject({ magnitudeOverstatement: true, certaintyOverstatement: false })
  })

  it('does not equate statistical significance with clinical importance', () => {
    const report = analyzeEffectCertainty(analysis(
      'Produces a clinically meaningful improvement in symptoms',
      'The between-group difference was statistically significant (p=0.03).',
    ))
    expect(report.findings[0]).toMatchObject({ clinicalImportanceOverstatement: true })
  })

  it('flags reliability wording when linked human evidence explicitly reports mixed results', () => {
    const report = analyzeEffectCertainty(analysis(
      'Reliably improves symptoms',
      'Results were mixed, with inconsistent findings across measured outcomes.',
    ))
    expect(report.findings[0]).toMatchObject({ certaintyOverstatement: true })
  })

  it('does not invent an overstatement when effect magnitude and certainty are not described', () => {
    const report = analyzeEffectCertainty(analysis(
      'Strongly improves symptoms',
      'Participants were randomized to treatment or placebo for eight weeks.',
    ))
    expect(report.summary.findings).toBe(0)
  })
})
