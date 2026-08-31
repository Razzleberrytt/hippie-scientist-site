import { describe, expect, it } from 'vitest'
import {
  buildFeedNativeSocialPost,
  buildSocialHook,
  deriveSocialSubject,
  validateFeedNativeSocialPost,
} from '../social-post-copy.mjs'

const fixture = {
  id: 'bacopa-memory-domains',
  title: 'Bacopa Monnieri: Memory, Cognition & Evidence — 2026 Review',
  finding: 'Bacopa is not a general brain boost. The clearest human signal is narrower: selected memory-retention and free-recall outcomes. Attention and processing-speed results are less consistent.',
  limitation: 'A recent trial missed its primary cognitive outcomes, and results should not be generalized across extracts or every cognitive domain.',
  evidenceType: 'randomized human trials',
  evidenceGrade: 'B',
  sourceUrl: 'https://thehippiescientist.net/articles/bacopa-monnieri/',
  tags: ['bacopa-monnieri', 'memory', 'cognition', 'human-evidence'],
}

describe('feed-native social copy', () => {
  it('turns governed research into a curiosity-first readable post without rewriting the facts', () => {
    const post = buildFeedNativeSocialPost(fixture)
    expect(post.schemaVersion).toBe('feed-native-social-copy-v1')
    expect(post.text.split('\n')[0].length).toBeLessThanOrEqual(130)
    expect(post.text).toContain(fixture.finding.split('. ')[0])
    expect(post.text.replace(/\s+/g, ' ')).toContain(fixture.finding.replace(/\s+/g, ' '))
    expect(post.text.replace(/\s+/g, ' ')).toContain(`${fixture.limitation}.`.replace(/\.\.$/, '.'))
    expect(post.text).toContain('Full evidence + sources:')
    expect(post.text).not.toMatch(/Read the evidence map/i)
    expect(post.hashtags.length).toBeLessThanOrEqual(3)
  })

  it('derives a human-readable subject and deterministic hook', () => {
    expect(deriveSocialSubject(fixture)).toBe('Bacopa Monnieri')
    expect(buildSocialHook(fixture)).toBe(buildSocialHook(fixture))
    expect(buildSocialHook(fixture)).toMatch(/Bacopa Monnieri/)
  })

  it('keeps sentence-level factual text intact while adding breathing room', () => {
    const post = buildFeedNativeSocialPost(fixture)
    expect(post.text).toContain('Bacopa is not a general brain boost.\n\nThe clearest human signal is narrower: selected memory-retention and free-recall outcomes.\n\nAttention and processing-speed results are less consistent.')
  })

  it('fails validation when the limitation or canonical source is dropped', () => {
    const post = buildFeedNativeSocialPost(fixture)
    const broken = { ...post, text: `${post.hook}\n\n${fixture.finding}` }
    const errors = validateFeedNativeSocialPost(broken, fixture)
    expect(errors).toEqual(expect.arrayContaining([
      'governed limitation must be preserved losslessly',
      'canonical source URL must appear exactly in the social copy',
    ]))
  })
})
