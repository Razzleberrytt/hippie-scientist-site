import { describe, expect, it } from 'vitest'
import { buildMediaFirstCaption } from '../media-first-caption.mjs'

const object = {
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
}
const socialPost = {
  hook: 'Does Ashwagandha hold up when you look at the human studies? 🌿',
  hashtags: ['#Ashwagandha', '#SupplementScience', '#StressResearch'],
}
const tagged = 'https://thehippiescientist.net/herbs/ashwagandha/?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=carousel-pilot'

describe('media-first publication captions', () => {
  it('keeps a carousel caption short and lets the governed media carry the scientific detail', () => {
    const caption = buildMediaFirstCaption(object, socialPost, { format: 'carousel' })
    expect(caption.schemaVersion).toBe('media-first-caption-v1')
    expect(caption.text).toContain('Swipe for what the studies found, the key limitation, and the source trail.')
    expect(caption.text).toContain(object.sourceUrl)
    expect(caption.text).not.toContain('Evidence type:')
    expect(caption.text.split('\n')[0]).toBe(socialPost.hook)
    expect(caption.factualAuthority).toBe('creative-framing-only')
  })

  it('uses an attributed destination without changing the canonical path', () => {
    const caption = buildMediaFirstCaption(object, socialPost, { format: 'carousel', taggedDestination: tagged })
    expect(caption.destinationUrl).toContain('utm_campaign=evidence-to-distribution')
    expect(caption.canonicalSourceUrl).toBe(object.sourceUrl)
    expect(caption.text).toContain('utm_campaign=evidence-to-distribution')
  })

  it('uses a watch cue for vertical video', () => {
    const caption = buildMediaFirstCaption(object, socialPost, { format: 'vertical-video' })
    expect(caption.text).toContain('Watch for what the studies found, the key limitation, and the source trail.')
    expect(caption.text).not.toContain('Swipe for')
  })

  it('fails closed if attribution drifts away from the canonical source path', () => {
    expect(() => buildMediaFirstCaption(object, socialPost, {
      format: 'carousel',
      taggedDestination: 'https://thehippiescientist.net/herbs/bacopa/?utm_campaign=evidence-to-distribution',
    })).toThrow(/preserve canonical origin and path/)
  })
})
