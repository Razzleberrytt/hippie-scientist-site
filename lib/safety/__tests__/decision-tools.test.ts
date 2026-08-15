import { describe, expect, it } from 'vitest'
import { analyzeSupplementLabel, compareLabels } from '../supplement-label-decoder'
import { analyzeSupplementStack, summarizeStackRisk } from '../supplement-stack-checker'
import {
  exploreMedicationClassInteractions,
  groupInteractionsByEvidence,
  validateInteractionRecord,
  type IngredientMedicationInteraction,
} from '../medication-class-interactions'
import {
  exploreMechanisms,
  mechanismEntry,
  validateMechanismRecord,
  type MechanismRecord,
} from '../../evidence/mechanism-explorer'

describe('supplement label decoder', () => {
  it('penalizes proprietary blends and missing amounts without claiming efficacy', () => {
    const quality = analyzeSupplementLabel({
      ingredients: [{ name: 'Herbal complex', proprietaryBlend: true }],
      manufacturerClaims: ['clinically proven to cure stress'],
    })
    expect(quality.grade).toBe('D')
    expect(quality.issues.some((issue) => issue.code === 'PROPRIETARY_BLEND')).toBe(true)
    expect(quality.issues.some((issue) => issue.code === 'CLAIM_LANGUAGE')).toBe(true)
    expect(quality.disclaimer).toContain('not whether a product is safe, effective')
  })

  it('uses label transparency, not efficacy, to compare products', () => {
    const comparison = compareLabels(
      { ingredients: [{ name: 'Magnesium', amount: 200, unit: 'mg', form: 'glycinate' }] },
      { ingredients: [{ name: 'Magnesium blend', proprietaryBlend: true }] },
    )
    expect(comparison.winner).toBe('left')
    expect(comparison.explanation).toContain('not an efficacy ranking')
  })
})

describe('supplement stack checker', () => {
  it('separates known duplicate signals from theoretical overlap', () => {
    const analysis = analyzeSupplementStack([
      { id: 'a', name: 'A', duplicateKey: 'same', serotonergic: true },
      { id: 'b', name: 'B', duplicateKey: 'same', serotonergic: true },
    ])
    expect(analysis.knownInteractions.some((item) => item.kind === 'duplicate')).toBe(true)
    expect(analysis.theoreticalInteractions.some((item) => item.kind === 'theoretical-overlap')).toBe(true)
    expect(analysis.privacy).toBe('local-only')
    expect(summarizeStackRisk(analysis).caution).toBeGreaterThan(0)
  })
})

describe('medication class interaction explorer', () => {
  const records: IngredientMedicationInteraction[] = [
    {
      ingredientId: 'example',
      medicationClassId: 'ssri-snri',
      evidenceLevel: 'theoretical',
      severity: 'moderate',
      effect: 'Possible overlapping serotonergic activity',
      evidenceSummary: 'Mechanistic concern without direct clinical interaction evidence.',
      sourceIds: ['source-1'],
    },
  ]

  it('labels theoretical interactions explicitly', () => {
    const result = exploreMedicationClassInteractions('example', 'ssri-snri', records)[0]
    expect(result.actionLabel).toBe('theoretical-only')
    expect(result.confidenceLabel).toContain('Theoretical')
    expect(groupInteractionsByEvidence([result]).theoretical).toHaveLength(1)
  })

  it('rejects unsupported major-theoretical labels', () => {
    expect(validateInteractionRecord({ ...records[0], severity: 'major' })).toContain(
      'Theoretical interactions cannot be labeled major without stronger evidence; use unknown/moderate and explain uncertainty.',
    )
  })
})

describe('mechanism explorer', () => {
  const preclinical: MechanismRecord = {
    ingredientId: 'example',
    pathwayId: 'gaba',
    pathwayLabel: 'GABA signaling',
    evidenceType: 'animal',
    evidenceSummary: 'Observed in an animal model.',
    linkedOutcomeIds: ['sleep-quality'],
  }

  it('does not let preclinical mechanisms support efficacy claims', () => {
    const entry = mechanismEntry(preclinical)
    expect(entry.evidenceTier).toBe('preclinical')
    expect(entry.canSupportEfficacyClaim).toBe(false)
    expect(entry.implicationLabel).toContain('should not be translated into a human efficacy claim')
  })

  it('supports explicit human-outcome versus mechanistic views', () => {
    const human: MechanismRecord = {
      ingredientId: 'example', pathwayId: 'sleep', pathwayLabel: 'Sleep pathway',
      evidenceType: 'human-outcome', evidenceSummary: 'Human outcome evidence.', humanOutcomeDemonstrated: true,
      sourceIds: ['trial-1'], linkedOutcomeIds: ['sleep-quality'],
    }
    expect(exploreMechanisms([preclinical, human], 'human-outcomes')).toHaveLength(1)
    expect(exploreMechanisms([preclinical, human], 'mechanistic-context')).toHaveLength(1)
  })

  it('requires human outcome flags to match human outcome evidence', () => {
    expect(validateMechanismRecord({ ...preclinical, humanOutcomeDemonstrated: true })).toContain(
      'humanOutcomeDemonstrated may only be true for human-outcome evidence.',
    )
  })
})
