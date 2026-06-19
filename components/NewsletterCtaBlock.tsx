'use client'

import Link from 'next/link'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

type NewsletterCtaBlockProps = {
  title?: string
  description?: string
  href?: string
  ctaLabel?: string
  location?: string
}

export default function NewsletterCtaBlock({
  title = 'Read the newsletter archive',
  description = 'Short evidence-first notes on supplement safety, sourcing, and research interpretation.',
  href = '/newsletter',
  ctaLabel = 'Open newsletter',
  location = 'newsletter-cta',
}: NewsletterCtaBlockProps) {
  return (
    <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Newsletter</p>
          <h2 className='mt-2 text-2xl font-semibold text-ink'>{title}</h2>
          <p className='mt-2 max-w-2xl text-sm leading-7 text-muted'>{description}</p>
        </div>
        <Link
          href={href}
          onClick={() => trackRevenueEvent({
            kind: 'cta_click',
            location,
            label: ctaLabel,
            target: href,
          })}
          className='inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900'
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
