'use client'

import type { FormEvent } from 'react'
import { trackRevenueEvent } from '../src/lib/revenue-tracking'

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
  action = '/newsletter/confirmed',
  className = '',
  location = 'email-capture',
}: EmailCaptureProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget)
    if (String(formData.get('website') || '').trim()) {
      event.preventDefault()
      return
    }

    trackRevenueEvent({
      kind: 'email_signup_attempt',
      location,
      label: ctaLabel,
      target: action,
    })
  }

  return (
    <section className={`rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 ${className}`}>
      <div className='grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Email updates</p>
          <h2 className='mt-3 text-2xl font-semibold text-ink'>{headline}</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>{description}</p>
        </div>

        <form
          action={action}
          method='get'
          onSubmit={handleSubmit}
          className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'
        >
          <div aria-hidden='true' className='absolute left-[-5000px]'>
            <label htmlFor='email-capture-website'>Leave this field empty</label>
            <input id='email-capture-website' name='website' tabIndex={-1} autoComplete='off' />
          </div>
          <label className='sr-only' htmlFor='email-capture-address'>Email address</label>
          <input
            id='email-capture-address'
            name='email'
            type='email'
            required
            placeholder='you@example.com'
            className='min-h-11 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15'
          />
          <button
            type='submit'
            className='min-h-11 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900'
          >
            {ctaLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
