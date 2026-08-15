import { describe, expect, it } from 'vitest'

import {
  buildOutcomeSynthesis,
  listOutcomeChildren,
  normalizeOutcome,
} from '@/lib/evidence/outcomes'

describe('outcome normalization', () => {
  it('maps sleep-quality synonyms without blindly treating subjective wording as identical', () => {
    const direct = normalizeOutcome('sleep quality')
    const subjective = normalizeOutcome('subjective sleep quality')

    expect(direct).toMatchObject({ canonicalOutcomeId: 'sleep-quality', domain: 'sleep', requiresManualReview: false })
    expect(subjective).toMatchObject({ canonicalOutcomeId: 'sleep-quality', domain: 'sleep', requiresManualReview: true })
  })

  it('tracks validated instruments separately', () => {
    expect(normalizeOutcome('Pittsburgh Sleep Quality Index total score')).toMatchObject({
      canonicalOutcomeId: 'sleep-quality',
      instrumentId: 'PSQI',
    })
    expect(normalizeOutcome('HAM-A score')).toMatchObject({ canonicalOutcomeId: 'anxiety-severity', instrumentId: 'HAM-A' })
    expect(normalizeOutcome('GAD-7 score')).toMatchObject({ canonicalOutcomeId: 'anxiety-severity', instrumentId: 'GAD-7' })
    expect(normalizeOutcome('Perceived Stress Scale')).toMatchObject({ canonicalOutcomeId: 'stress-severity', instrumentId: 'PSS' })
  })

  it('keeps memory as a cognition child rather than collapsing cognition into one bucket', () => {
    expect(normalizeOutcome('objective memory recall')).toMatchObject({
      canonicalOutcomeId: 'cognition-memory',
      domain: 'cognition',
      instrumentId: 'MEMORY-OBJECTIVE',
    })
    expect(listOutcomeChildren('cognition').map((node) => node.id)).toContain('cognition-memory')
  })
})

describe('outcome synthesis', () => {
  it('preserves instrument-specific groups and independent-trial counts', () => {
    const groups = buildOutcomeSynthesis([
      {
        studyId: 'paper-a',
        independentUnitId: 'trial-1',
        rawOutcome: 'PSQI total score',
        direction: 'positive',
        participantCount: 40,
      },
      {
        studyId: 'paper-b',
        independentUnitId: 'trial-1',
        rawOutcome: 'Pittsburgh Sleep Quality Index',
        direction: 'positive',
        participantCount: 40,
      },
      {
        studyId: 'paper-c',
        independentUnitId: 'trial-2',
        rawOutcome: 'subjective sleep quality',
        direction: 'null',
        participantCount: 30,
      },
    ])

    const psqi = groups.find((group) => group.instrumentId === 'PSQI')
    const subjective = groups.find((group) => group.instrumentId === null)

    expect(psqi).toMatchObject({ studyCount: 2, independentTrialCount: 1, participantCount: 80 })
    expect(subjective).toMatchObject({ studyCount: 1, independentTrialCount: 1, requiresManualReview: true })
  })
})
