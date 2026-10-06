import { describe, expect, it } from 'vitest'
import { scheduleMetricoolPublicationFromArtifacts } from '../schedule-metricool-publication.mjs'

describe('Metricool publication freeze', () => {
  it('refuses every new Metricool scheduling attempt before provider work', async () => {
    await expect(scheduleMetricoolPublicationFromArtifacts()).rejects.toThrow(
      /Metricool publication is frozen by THS SocialOS/i,
    )
  })
})
