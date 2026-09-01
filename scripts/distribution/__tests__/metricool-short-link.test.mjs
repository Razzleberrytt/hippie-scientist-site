import { describe, expect, it } from 'vitest'
import { buildMetricoolSchedulerRequest } from '../metricool-provider.mjs'

const base = {
  format: 'carousel',
  networks: 'facebook',
  text: 'Full evidence + sources:\nhttps://thehippiescientist.net/herbs/ashwagandha/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=pilot',
  mediaUrls: ['https://thehippiescientist.net/media/distribution/metricool/example/abc/carousel-01.png'],
  publicationAt: '2026-09-01T14:00:00-04:00',
  timezone: 'America/New_York',
  title: 'Ashwagandha evidence',
  now: new Date('2026-08-31T12:00:00Z'),
  availableNetworks: ['facebook'],
}

describe('Metricool visible-link presentation', () => {
  it('keeps the governed campaign destination in text but tells Metricool to shorten it at publish time', () => {
    const request = buildMetricoolSchedulerRequest(base)

    expect(request.text).toContain('utm_campaign=evidence-to-distribution')
    expect(request.shortener).toBe(true)
    expect(request.media).toHaveLength(1)
  })
})
