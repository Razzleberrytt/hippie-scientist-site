import assert from 'node:assert/strict'
import {
  countCautionSignals,
  formatReviewDate,
  getEvidenceTier,
  getTrustNote,
  inferContentFlags,
} from '@/lib/trust'

async function run() {
  assert.equal(
    getEvidenceTier({ confidence: 'high', sourceCount: 3, completenessScore: 100 }),
    'strong'
  )
  assert.equal(
    getEvidenceTier({ confidence: 'medium', sourceCount: 1, completenessScore: 75 }),
    'moderate'
  )
  assert.equal(
    getEvidenceTier({ confidence: 'low', sourceCount: 0, completenessScore: 25 }),
    'limited'
  )

  assert.equal(formatReviewDate('2026-03-01'), 'Mar 1, 2026')
  assert.equal(formatReviewDate(''), 'Not listed')

  assert.equal(
    countCautionSignals({ contraindications: ['A'], interactions: ['B'], sideEffects: ['C', 'D'] }),
    4
  )

  const inferredFlags = inferContentFlags({
    mechanism: 'This is inferred from related species and limited evidence.',
  })
  assert.equal(inferredFlags.hasInferredContent, true)

  const fallbackFlags = inferContentFlags({
    description: 'No direct mechanism data. Contextual inference: nan.',
  })
  assert.equal(fallbackFlags.hasFallbackContent, true)

  assert.match(
    getTrustNote({
      evidenceTier: 'limited',
      sourceCount: 0,
      hasInferredContent: false,
      hasFallbackContent: false,
    }),
    /sparse/i
  )
}

run()
