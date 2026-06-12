'use client'

import type { FormEvent } from 'react'
import { useId, useState } from 'react'

type EmailCaptureProps = {
  title: string
  description: string
  ctaLabel: string
  magnet: string
  className?: string
}

const CHECKLIST_HREF = '/lead-magnets/adhd-supplement-starter-checklist.html'

export default function EmailCapture({
  title,
  description,
  ctaLabel,
  magnet,
  className = '',
}: EmailCaptureProps) {
  const id = useId()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') || '').trim()
    const firstName = String(formData.get('firstName') || '').trim()

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          magnet,
        }),
      })
      const result = await response.json().catch(() => ({})) as { ok?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Signup failed. Please try again.')
      }

      setStatus('success')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Signup failed. Please try again.')
    }
  }

  return (
    <section
      id="join-updates"
      className={`rounded-[1rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm sm:p-6 ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Free checklist</p>
          <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#46574d]">{description}</p>
          <p className="mt-3 text-xs leading-6 text-muted">
            Educational only. Supplements should not replace prescribed ADHD treatment.
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/60 p-4">
            <p className="text-sm font-semibold text-ink">You are on the list.</p>
            <p className="mt-1 text-sm leading-6 text-[#46574d]">
              Open the printable checklist now:
            </p>
            <a
              href={CHECKLIST_HREF}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900"
            >
              Open checklist
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-3" noValidate={false}>
            <div>
              <label htmlFor={`${id}-first-name`} className="text-sm font-semibold text-ink">
                First name <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id={`${id}-first-name`}
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="mt-1 min-h-11 w-full rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
              />
            </div>
            <div>
              <label htmlFor={`${id}-email`} className="text-sm font-semibold text-ink">
                Email address
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1 min-h-11 w-full rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="min-h-11 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 disabled:cursor-wait disabled:opacity-70"
            >
              {status === 'loading' ? 'Sending...' : ctaLabel}
            </button>
            {status === 'error' && (
              <p role="alert" className="text-sm leading-6 text-red-700">
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
