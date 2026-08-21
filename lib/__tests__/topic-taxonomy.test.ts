import { describe, expect, it } from 'vitest'
import { getProfileIntentRoutes, matchTopicClusters } from '../topic-taxonomy'

describe('topic taxonomy', () => {
  it('uses the same topic match for ecosystem and profile routing', () => {
    const matches = matchTopicClusters(['sleep latency', 'melatonin'])
    expect(matches.some((cluster) => cluster.slug === 'sleep')).toBe(true)

    expect(getProfileIntentRoutes(['sleep latency', 'melatonin'])).toEqual([
      { ifYouWant: 'help sleeping', goTo: 'Sleep guides', href: '/guides/sleep/' },
    ])
  })

  it('deduplicates overlapping anxiety and stress terms into one profile route', () => {
    const routes = getProfileIntentRoutes(['stress', 'cortisol', 'anxiety', 'calm'])
    expect(routes).toEqual([
      { ifYouWant: 'help with anxiety or stress', goTo: 'Anxiety & stress guides', href: '/guides/anxiety/' },
    ])
  })

  it('keeps topic matching explicitly organizational rather than generating evidence claims', () => {
    const [match] = matchTopicClusters(['focus and attention'])
    expect(match?.slug).toBe('cognition')
    expect(match).not.toHaveProperty('evidenceGrade')
    expect(match).not.toHaveProperty('claim')
  })
})
