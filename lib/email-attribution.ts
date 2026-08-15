'use client'

const SIGNUP_AT_KEY = 'ths:newsletter:signup-at:v1'
const FIRST_EMAIL_RETURN_AT_KEY = 'ths:newsletter:first-return-at:v1'
const CAMPAIGN_KEY = 'ths:newsletter:last-campaign:v1'
const CONTENT_KEY = 'ths:newsletter:last-content:v1'

export type NewsletterAttribution = {
  newsletterAttributed: boolean
  campaign: string
  content: string
  subscriberAgeDays: number | null
  firstEmailReturnAgeDays: number | null
}

function safeRead(key: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function safeWrite(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Attribution storage must never block navigation or signup.
  }
}

function ageDays(timestamp: string): number | null {
  const parsed = Date.parse(timestamp)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.floor((Date.now() - parsed) / 86_400_000))
}

export function markNewsletterSignup(now = new Date()): void {
  if (!safeRead(SIGNUP_AT_KEY)) safeWrite(SIGNUP_AT_KEY, now.toISOString())
}

export function captureEmailReturn(url: URL, now = new Date()): { campaign: string; content: string } | null {
  const medium = url.searchParams.get('utm_medium')?.toLowerCase().trim()
  if (medium !== 'email') return null

  const campaign = url.searchParams.get('utm_campaign')?.trim() || 'unknown-email-campaign'
  const content = url.searchParams.get('utm_content')?.trim() || 'unknown-email-content'

  if (!safeRead(FIRST_EMAIL_RETURN_AT_KEY)) safeWrite(FIRST_EMAIL_RETURN_AT_KEY, now.toISOString())
  safeWrite(CAMPAIGN_KEY, campaign)
  safeWrite(CONTENT_KEY, content)

  return { campaign, content }
}

export function getNewsletterAttribution(): NewsletterAttribution {
  const signupAt = safeRead(SIGNUP_AT_KEY)
  const firstReturnAt = safeRead(FIRST_EMAIL_RETURN_AT_KEY)
  const campaign = safeRead(CAMPAIGN_KEY)
  const content = safeRead(CONTENT_KEY)

  return {
    newsletterAttributed: Boolean(signupAt || firstReturnAt || campaign),
    campaign,
    content,
    subscriberAgeDays: signupAt ? ageDays(signupAt) : null,
    firstEmailReturnAgeDays: firstReturnAt ? ageDays(firstReturnAt) : null,
  }
}
