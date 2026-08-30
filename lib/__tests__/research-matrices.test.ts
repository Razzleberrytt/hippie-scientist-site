import { describe, expect, it } from 'vitest'
import { rowsForRiskMatrix, type ResearchMatrixRow } from '../research-matrices'

const row = (overrides: Partial<ResearchMatrixRow>): ResearchMatrixRow => ({
  slug: 'example',
  name: 'Example',
  entityType: 'herb',
  href: '/herbs/example/',
  evidenceGrade: 'C',
  humanEvidenceCount: 0,
  humanPublicationCount: 0,
  collapsedHumanPublicationCount: 0,
  humanEvidenceCountCanonical: false,
  outcomes: [],
  mechanisms: [],
  safetySignals: [],
  ...overrides,
})

const rows = [
  row({ slug: 'sedative', name: 'Sedative herb', safetySignals: ['Sedation', 'Pregnancy / breastfeeding'] }),
  row({ slug: 'serotonergic', name: 'Serotonergic herb', safetySignals: ['Serotonergic'] }),
  row({ slug: 'bleeding', name: 'Bleeding herb', safetySignals: ['Bleeding', 'Liver'] }),
  row({ slug: 'empty', name: 'No mapped flags' }),
]

describe('research safety matrices', () => {
  it('includes any structured safety record in the interaction matrix', () => {
    expect(rowsForRiskMatrix(rows, 'interaction').map((item) => item.slug)).toEqual(['sedative', 'serotonergic', 'bleeding'])
  })

  it('filters sedation without treating unrelated flags as matches', () => {
    expect(rowsForRiskMatrix(rows, 'sedation').map((item) => item.slug)).toEqual(['sedative'])
  })

  it('filters pregnancy using the canonical normalized safety label', () => {
    expect(rowsForRiskMatrix(rows, 'pregnancy').map((item) => item.slug)).toEqual(['sedative'])
  })

  it('does not convert missing safety data into a positive match', () => {
    expect(rowsForRiskMatrix(rows, 'liver').some((item) => item.slug === 'empty')).toBe(false)
  })
})
