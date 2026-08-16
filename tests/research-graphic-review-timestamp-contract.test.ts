import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'scripts/media/promote-reviewed-research-graphics.mjs'),
  'utf8',
)

describe('research graphic review timestamp contract', () => {
  it('rejects approval timestamps beyond a small future clock-skew allowance', () => {
    expect(source).toContain('const MAX_FUTURE_REVIEW_SKEW_MS = 5 * 60 * 1000')
    expect(source).toContain('function hasValidReviewTimestamp(reviewedAt)')
    expect(source).toContain('reviewedAtMs <= Date.now() + MAX_FUTURE_REVIEW_SKEW_MS')
    expect(source).toContain('if (!hasValidReviewTimestamp(review.reviewedAt)) return false')
  })

  it('keeps all four review verification flags required for promotion', () => {
    expect(source).toContain(
      'return review.evidenceVerified && review.attributionVerified && review.destinationVerified && review.visualVerified',
    )
  })
})
