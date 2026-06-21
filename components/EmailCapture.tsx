'use client'

import NewsletterSignup from './NewsletterSignup'

type EmailCaptureProps = {
  headline?: string
  description?: string
  ctaLabel?: string
  action?: string
  className?: string
  location?: string
}

export default function EmailCapture({
  headline = 'Get the evidence-first supplement notes',
  description = 'Occasional research updates, practical safety context, and new guide announcements. No diagnosis, treatment, or personal medical advice.',
  ctaLabel = 'Join the list',
  className = '',
  location = 'email-capture',
}: EmailCaptureProps) {
  return (
    <NewsletterSignup
      title={headline}
      description={description}
      ctaLabel={ctaLabel}
      location={location}
      className={`mb-20 md:mb-0 ${className}`}
    />
  )
}
