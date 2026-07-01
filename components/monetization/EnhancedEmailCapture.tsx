'use client'

import type { FormEvent } from 'react'
import { trackRevenueEvent } from '../../src/lib/revenue-tracking'

export type EnhancedEmailCaptureProps = {
  headline: string
  description: string
  benefit1?: string
  benefit2?: string
  benefit3?: string
  ctaLabel?: string
  action?: string
  variant?: 'compact' | 'expanded' | 'inline'
  location?: string
  className?: string
}

export function EnhancedEmailCapture({
  headline,
  description,
  benefit1,
  benefit2,
  benefit3,
  ctaLabel = 'Join the list',
  action = '/info/newsletter/confirmed',
  variant = 'expanded',
  location = 'email-capture',
  className = '',
}: EnhancedEmailCaptureProps) {
  const isCompact = variant === 'compact'
  const isInline = variant === 'inline'

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

  if (isCompact) {
    return (
      <section className={`rounded-[1.25rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm ${className}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Stay informed</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{headline}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>

        <form
          action={action}
          method="get"
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <div aria-hidden="true" className="absolute left-[-5000px]">
            <label htmlFor="email-capture-compact-website">Leave this field empty</label>
            <input id="email-capture-compact-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="min-h-10 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
          />
          <button
            type="submit"
            className="min-h-10 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 whitespace-nowrap"
          >
            {ctaLabel}
          </button>
        </form>
      </section>
    )
  }

  if (isInline) {
    return (
      <section className={`rounded-[1.25rem] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/50 p-6 ${className}`}>
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Email updates</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{headline}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>

          {(benefit1 || benefit2 || benefit3) && (
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {benefit1 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-emerald-600">✓</span>
                  <span>{benefit1}</span>
                </li>
              )}
              {benefit2 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-emerald-600">✓</span>
                  <span>{benefit2}</span>
                </li>
              )}
              {benefit3 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-emerald-600">✓</span>
                  <span>{benefit3}</span>
                </li>
              )}
            </ul>
          )}

          <form
            action={action}
            method="get"
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <div aria-hidden="true" className="absolute left-[-5000px]">
              <label htmlFor="email-capture-inline-website">Leave this field empty</label>
              <input id="email-capture-inline-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="min-h-10 flex-1 rounded-full border border-emerald-300 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="submit"
              className="min-h-10 rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 whitespace-nowrap"
            >
              {ctaLabel}
            </button>
          </form>
        </div>
      </section>
    )
  }

  // expanded (default)
  return (
    <section className={`rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 ${className}`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Email updates</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">{headline}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{description}</p>

          {(benefit1 || benefit2 || benefit3) && (
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {benefit1 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-brand-700">✓</span>
                  <span>{benefit1}</span>
                </li>
              )}
              {benefit2 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-brand-700">✓</span>
                  <span>{benefit2}</span>
                </li>
              )}
              {benefit3 && (
                <li className="flex gap-2">
                  <span className="flex-shrink-0 text-brand-700">✓</span>
                  <span>{benefit3}</span>
                </li>
              )}
            </ul>
          )}
        </div>

        <form
          action={action}
          method="get"
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
        >
          <div aria-hidden="true" className="absolute left-[-5000px]">
            <label htmlFor="email-capture-expanded-website">Leave this field empty</label>
            <input id="email-capture-expanded-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="min-h-11 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 whitespace-nowrap"
          >
            {ctaLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
