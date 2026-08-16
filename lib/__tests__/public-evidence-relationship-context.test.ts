import { describe, expect, it } from 'vitest'

import {
  buildPublicEvidenceDatasetFromRecords,
  publicEvidenceDatasetToCsv,
} from '@/lib/public-evidence-dataset'
import type { RuntimeRecord } from '@/src/types/content'

function record(overrides: Partial<RuntimeRecord>): RuntimeRecord {
  return {
    slug: 'example',
    name: 'Example',
    category: 'Stress',
    indexability_status: 'PUBLISH',
    evidence_grade: 'B',
    summary_quality: 'strong',
    profile_status: 'complete',
    ...overrides,
  } as RuntimeRecord
}

describe('public evidence relationship-specific context', () => {
  it('preserves differing ingredient contexts without selecting one at study level', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'alpha',
          name: 'Alpha',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/relationship-context',
            year: 2022,
            study_type: 'randomized controlled trial',
            dose: '300 mg/day',
            duration: '8 weeks',
            population: 'Adults with stress',
            outcome: 'Stress score',
            result: 'Stress score improved',
            limitation: 'Small sample',
            confidence: 'high',
            statistical_consistency: 'consistent',
            extract: 'Extract A',
            conditions: ['stress'],
            safety_outcome: 'No serious adverse events',
            relationship: 'supports',
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'beta',
          name: 'Beta',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/relationship-context',
            pmid: '34559859',
            year: 2022,
            study_type: 'randomized controlled trial',
            dose: '600 mg/day',
            duration: '8 weeks',
            population: 'Adults with stress',
            outcome: 'Sleep score',
            result: 'Sleep score unchanged',
            limitation: 'Secondary endpoint',
            confidence: 'moderate',
            statistical_consistency: 'mixed',
            extract: 'Extract B',
            conditions: ['sleep'],
            safety_outcome: 'Mild gastrointestinal events',
            relationship: 'no_clear_effect',
          }],
        }),
      },
    ])

    expect(dataset.studies).toHaveLength(1)
    const study = dataset.studies[0]
    expect(study.relationships).toHaveLength(2)
    expect(study.dose).toBeUndefined()
    expect(study.outcome).toBeUndefined()
    expect(study.result).toBeUndefined()
    expect(study.limitation).toBeUndefined()
    expect(study.extractName).toBeUndefined()
    expect(study.safetyOutcome).toBeUndefined()
    expect(study.statisticalConsistency).toBeUndefined()
    expect(study.confidence).toBe('unknown')
    expect(study.duration).toBe('8 weeks')
    expect(study.population).toBe('Adults with stress')
    expect(study.conditions.sort()).toEqual(['sleep', 'stress'])

    expect(study.relationships.find(item => item.ingredientSlug === 'alpha')).toMatchObject({
      dose: '300 mg/day',
      outcome: 'Stress score',
      result: 'Stress score improved',
      confidence: 'high',
      extractName: 'Extract A',
      conditions: ['stress'],
    })
    expect(study.relationships.find(item => item.ingredientSlug === 'beta')).toMatchObject({
      dose: '600 mg/day',
      outcome: 'Sleep score',
      result: 'Sleep score unchanged',
      confidence: 'moderate',
      extractName: 'Extract B',
      conditions: ['sleep'],
    })

    const csv = publicEvidenceDatasetToCsv(dataset)
    expect(csv.split('\n')[0]).toContain('relationships_json')
    expect(csv).toContain('Stress score improved')
    expect(csv).toContain('Sleep score unchanged')
    expect(csv).toContain('300 mg/day')
    expect(csv).toContain('600 mg/day')
  })

  it('retains a study-level shortcut when all relationship contexts agree', () => {
    const dataset = buildPublicEvidenceDatasetFromRecords([
      {
        type: 'herb',
        record: record({
          slug: 'alpha',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/consensus-context',
            study_type: 'randomized controlled trial',
            dose: '300 mg/day',
            outcome: 'Stress score',
            result: 'Improved versus placebo',
            confidence: 'high',
          }],
        }),
      },
      {
        type: 'compound',
        record: record({
          slug: 'beta',
          sources: [{
            title: 'Shared publication',
            doi: '10.1000/consensus-context',
            pmid: '34559859',
            study_type: 'randomized controlled trial',
            dose: '300 mg/day',
            outcome: 'Stress score',
            result: 'Improved versus placebo',
            confidence: 'high',
          }],
        }),
      },
    ])

    expect(dataset.studies[0]).toMatchObject({
      dose: '300 mg/day',
      outcome: 'Stress score',
      result: 'Improved versus placebo',
      confidence: 'high',
    })
  })
})
