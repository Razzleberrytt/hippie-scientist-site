import { describe, expect, it } from 'vitest'
import {
  REQUIRED_WELCOME_PURPOSES,
  welcomeEmailSequence,
  withWelcomeTracking,
} from '@/content/emailWelcomeSequence'

describe('welcome email sequence', () => {
  it('contains exactly seven ordered emails', () => {
    expect(welcomeEmailSequence).toHaveLength(7)
    expect(welcomeEmailSequence.map((email) => email.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('covers every required welcome purpose exactly once', () => {
    expect(welcomeEmailSequence.map((email) => email.purpose)).toEqual(REQUIRED_WELCOME_PURPOSES)
    expect(new Set(welcomeEmailSequence.map((email) => email.purpose)).size).toBe(7)
  })

  it('starts immediately and never moves backward in cadence', () => {
    expect(welcomeEmailSequence[0].delayDays).toBe(0)
    for (let index = 1; index < welcomeEmailSequence.length; index += 1) {
      expect(welcomeEmailSequence[index].delayDays).toBeGreaterThan(
        welcomeEmailSequence[index - 1].delayDays,
      )
    }
  })

  it('gives every message a useful primary CTA with email attribution', () => {
    for (const email of welcomeEmailSequence) {
      expect(email.subject.trim().length).toBeGreaterThan(10)
      expect(email.previewText.trim().length).toBeGreaterThan(20)
      expect(email.body.length).toBeGreaterThanOrEqual(2)
      expect(email.cta.href).toContain('utm_source=newsletter')
      expect(email.cta.href).toContain('utm_medium=email')
      expect(email.cta.href).toContain('utm_campaign=welcome_sequence')
      expect(email.cta.href).toContain(`utm_content=email_${email.sequence}`)
    }
  })

  it('preserves existing query strings when adding attribution', () => {
    expect(withWelcomeTracking('/search/?q=magnesium', 3)).toContain('&utm_source=newsletter')
  })
})
