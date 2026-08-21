import { describe, expect, it } from 'vitest'
import { extractCitationsFromRecord } from '@/lib/citations'

describe('quantitative citation context', () => {
  it('carries effect magnitude, uncertainty, significance, and replication fields into the shared citation model', () => {
    const [citation] = extractCitationsFromRecord({
      sources: [{
        title: 'Quantitative trial',
        pmid: '12345678',
        study_type: 'randomized controlled trial',
        effect_size: 'SMD -0.42',
        confidence_interval: '95% CI -0.65 to -0.19',
        p_value: 'p=0.001',
        absolute_difference: '4.2 points',
        clinical_magnitude: 'small-to-moderate',
        replication_context: 'similar direction in two independent trials',
        statistical_consistency: 'directionally consistent',
      }],
    })

    expect(citation).toMatchObject({
      effectSize: 'SMD -0.42',
      confidenceInterval: '95% CI -0.65 to -0.19',
      statisticalSignificance: 'p=0.001',
      absoluteDifference: '4.2 points',
      clinicalMagnitude: 'small-to-moderate',
      replication: 'similar direction in two independent trials',
      statisticalConsistency: 'directionally consistent',
    })
  })

  it('accepts numeric quantitative fields without dropping them', () => {
    const [citation] = extractCitationsFromRecord({
      sources: [{ title: 'Numeric source', doi: '10.1000/example', effect_size: 0.37, p_value: 0.04 }],
    })

    expect(citation.effectSize).toBe('0.37')
    expect(citation.statisticalSignificance).toBe('0.04')
  })
})
