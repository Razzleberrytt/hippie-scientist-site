'use client'

import NewsletterSignup from '../NewsletterSignup'

export type EnhancedEmailCaptureProps = {
  headline: string
  description: string
  benefit1?: string
  benefit2?: string
  benefit3?: string
  ctaLabel?: string
  /** @deprecated Newsletter submissions use the canonical configured endpoint. */
  action?: string
  variant?: 'compact' | 'expanded' | 'inline'
  location?: string
  className?: string
}

const newsletterVariant = {
  compact: 'compact',
  expanded: 'card',
  inline: 'inline',
} as const

/**
 * Compatibility wrapper for comparison pages that still import the older
 * EnhancedEmailCapture surface. NewsletterSignup is the single subscription
 * authority: Mailchimp endpoint selection, Turnstile, rate limiting, success
 * analytics, and the safety-checklist funnel all stay centralized there.
 */
export function EnhancedEmailCapture({
  headline,
  description,
  benefit1,
  benefit2,
  benefit3,
  ctaLabel = 'Join the list',
  variant = 'expanded',
  location = 'enhanced-email-capture',
  className = '',
}: EnhancedEmailCaptureProps) {
  const benefits = [benefit1, benefit2, benefit3].filter((benefit): benefit is string => Boolean(benefit))
  const resolvedDescription = benefits.length > 0
    ? `${description} ${benefits.join(' • ')}`
    : description

  return (
    <NewsletterSignup
      title={headline}
      description={resolvedDescription}
      ctaLabel={ctaLabel}
      location={location}
      variant={newsletterVariant[variant]}
      className={className}
    />
  )
}
