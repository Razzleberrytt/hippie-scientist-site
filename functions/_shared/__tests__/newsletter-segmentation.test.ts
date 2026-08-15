import { describe, expect, it } from 'vitest'
import {
  interestFromSignupMagnet,
  newsletterInterestTag,
  newsletterTagsForSignup,
} from '../newsletter-segmentation'

describe('newsletter segmentation', () => {
  it.each([
    ['sleep', 'Sleep'],
    ['stress', 'Stress'],
    ['anxiety', 'Anxiety'],
    ['focus', 'Focus'],
    ['brain-fog', 'Focus'],
    ['supplement-safety-checklist', 'General'],
    ['unknown-value', 'General'],
  ] as const)('maps %s to %s', (magnet, expected) => {
    expect(interestFromSignupMagnet(magnet)).toBe(expected)
  })

  it('never turns arbitrary user input into an arbitrary Mailchimp tag', () => {
    expect(newsletterTagsForSignup('MAKE-ME-ADMIN')).toEqual(['Interest: General'])
    expect(newsletterTagsForSignup('<script>alert(1)</script>')).toEqual(['Interest: General'])
  })

  it('keeps an explicitly configured provider tag alongside the canonical interest tag', () => {
    expect(newsletterTagsForSignup('sleep', 'Safety Checklist')).toEqual([
      'Safety Checklist',
      'Interest: Sleep',
    ])
  })

  it('uses a stable human-readable tag namespace', () => {
    expect(newsletterInterestTag('Anxiety')).toBe('Interest: Anxiety')
  })
})
