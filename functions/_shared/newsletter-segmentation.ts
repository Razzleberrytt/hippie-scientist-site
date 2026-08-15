export const NEWSLETTER_INTERESTS = ['Sleep', 'Stress', 'Anxiety', 'Focus', 'General'] as const
export type NewsletterInterest = (typeof NEWSLETTER_INTERESTS)[number]

const MAGNET_TO_INTEREST: Record<string, NewsletterInterest> = {
  sleep: 'Sleep',
  stress: 'Stress',
  anxiety: 'Anxiety',
  focus: 'Focus',
  'brain-fog': 'Focus',
  fatigue: 'General',
  overthinking: 'Stress',
  pain: 'General',
  inflammation: 'General',
  'safety-checklist': 'General',
  'supplement-safety-checklist': 'General',
  default: 'General',
  general: 'General',
}

function normalizeKey(value: unknown): string {
  return typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[_\s]+/g, '-')
    : ''
}

export function interestFromSignupMagnet(magnet: unknown): NewsletterInterest {
  const key = normalizeKey(magnet)
  return MAGNET_TO_INTEREST[key] ?? 'General'
}

export function newsletterInterestTag(interest: NewsletterInterest): string {
  return `Interest: ${interest}`
}

export function newsletterTagsForSignup(magnet: unknown, configuredTag?: string): string[] {
  const tags = [configuredTag?.trim(), newsletterInterestTag(interestFromSignupMagnet(magnet))]
    .filter((tag): tag is string => Boolean(tag))

  return Array.from(new Set(tags))
}
