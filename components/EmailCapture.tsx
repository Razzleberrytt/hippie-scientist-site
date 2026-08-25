'use client'

import { usePathname } from 'next/navigation'
import GooglePreferredSourceButton from './seo/GooglePreferredSourceButton'
import NewsletterSignup from './NewsletterSignup'
import { shouldShowPreferredSource } from '@/lib/preferred-source-eligibility'

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
  const pathname = usePathname() || '/'
  const showPreferredSource = shouldShowPreferredSource(pathname)

  return (
    <>
      <NewsletterSignup
        title={headline}
        description={description}
        ctaLabel={ctaLabel}
        location={location}
        className={`${showPreferredSource ? 'mb-4' : 'mb-20 md:mb-0'} ${className}`}
      />
      {showPreferredSource ? <GooglePreferredSourceButton className='mb-20 md:mb-0' /> : null}
    </>
  )
}
