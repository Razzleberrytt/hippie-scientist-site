import { describe, expect, it } from 'vitest'
import { buildMetricoolSchedulerRequest } from '../metricool-provider.mjs'

const base = {
  format: 'vertical-video',
  networks: 'youtube',
  text: 'Governed evidence caption.',
  mediaUrls: ['https://thehippiescientist.net/media/distribution/metricool/example/abc/short.mp4'],
  publicationAt: '2026-08-31T14:00:00-04:00',
  timezone: 'America/New_York',
  title: 'Ashwagandha evidence',
  now: new Date('2026-08-30T12:00:00Z'),
  availableNetworks: ['youtube'],
}

describe('Metricool YouTube metadata boundary', () => {
  it('requires explicit privacy instead of defaulting a public publication', () => {
    expect(() => buildMetricoolSchedulerRequest({
      ...base,
      youtubeMadeForKids: false,
      youtubeAiGeneratedContent: false,
    })).toThrow(/explicit privacy/i)
  })

  it('requires explicit audience and AI-content declarations instead of inferring false', () => {
    expect(() => buildMetricoolSchedulerRequest({
      ...base,
      youtubePrivacy: 'private',
      youtubeAiGeneratedContent: false,
    })).toThrow(/made-for-kids.*explicitly true or false/i)

    expect(() => buildMetricoolSchedulerRequest({
      ...base,
      youtubePrivacy: 'private',
      youtubeMadeForKids: false,
    })).toThrow(/AI-content declaration.*explicitly true or false/i)
  })

  it('preserves the exact caller declarations in the provider payload', () => {
    const request = buildMetricoolSchedulerRequest({
      ...base,
      youtubePrivacy: 'private',
      youtubeMadeForKids: true,
      youtubeAiGeneratedContent: true,
    })

    expect(request.youtubeData).toEqual({
      title: 'Ashwagandha evidence',
      type: 'short',
      privacy: 'private',
      tags: [],
      madeForKids: true,
      isAiGeneratedContent: true,
    })
  })

  it('accepts the provider-supported unlisted privacy declaration without inferring it', () => {
    const request = buildMetricoolSchedulerRequest({
      ...base,
      youtubePrivacy: 'unlisted',
      youtubeMadeForKids: false,
      youtubeAiGeneratedContent: false,
    })
    expect(request.youtubeData.privacy).toBe('unlisted')
  })

  it('rejects privacy values outside the governed provider contract', () => {
    expect(() => buildMetricoolSchedulerRequest({
      ...base,
      youtubePrivacy: 'friends-only',
      youtubeMadeForKids: false,
      youtubeAiGeneratedContent: false,
    })).toThrow(/public, unlisted, or private/i)
  })
})
