import { describe, expect, it } from 'vitest'
import { isPublishQualityDetailPage } from '@/lib/publishQuality'

describe('isPublishQualityDetailPage', () => {
  it('accepts pages with enough references and safety content', () => {
    expect(
      isPublishQualityDetailPage({
        name: 'Valerian',
        summary: 'Useful for sleep support.',
        sources: [
          { title: 'Study A', url: 'https://example.com/a' },
          { title: 'Study B', url: 'https://example.com/b' },
        ],
        safety: ['May cause drowsiness'],
      }),
    ).toBe(true)
  })

  it('rejects placeholder copy', () => {
    expect(
      isPublishQualityDetailPage({
        name: 'Valerian',
        summary: 'Contextual inference only',
        sources: ['https://example.com/a', 'https://example.com/b'],
        safety: ['Use caution with sedatives'],
      }),
    ).toBe(false)
  })

  it('accepts reviewed pages with sparse sources', () => {
    expect(
      isPublishQualityDetailPage({
        name: 'L-Theanine',
        summary: 'A calming amino acid.',
        sourceCount: 1,
        reviewedMeta: { enrichedAndReviewed: true },
        interactions: ['May enhance sedatives'],
      }),
    ).toBe(true)
  })

  it('rejects pages with missing safety details when safety fields are present', () => {
    expect(
      isPublishQualityDetailPage({
        name: 'Kava',
        summary: 'Traditional anxiolytic herb.',
        sources: ['https://example.com/a', 'https://example.com/b'],
        safety: 'nan',
      }),
    ).toBe(false)
  })
})
