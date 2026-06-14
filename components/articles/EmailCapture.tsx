'use client'

import { FormEvent, useId, useState } from 'react'
import { trackEmailSignup } from '@/lib/analytics'

type EmailCaptureProps = {
  title: string
  description: string
  ctaLabel: string
  magnet: string
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

const CHECKLIST_URL = '/lead-magnets/adhd-supplement-starter-checklist.html'

export default function EmailCapture({ title, description, ctaLabel, magnet }: EmailCaptureProps) {
  const titleId = useId()
  const emailId = useId()
  const firstNameId = useId()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('loading')
    setMessage('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, magnet, confirmEmail }),
      })
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not subscribe this email right now.')
      }

      setState('success')
      setMessage('You are subscribed. Open the checklist below.')
      trackEmailSignup({ source: `article-${magnet}` })
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not subscribe this email right now.')
    }
  }

  const isLoading = state === 'loading'
  const statusClassName = state === 'error' ? 'text-sm leading-6 text-red-700' : 'text-sm leading-6 text-[#46574d]'

  return (
    <aside className="my-10 rounded-3xl border border-brand-900/10 bg-brand-50/70 p-5 shadow-sm sm:p-7" aria-labelledby={titleId}>
      <div className="space-y-3">
        <p className="eyebrow-label">Free checklist</p>
        <h2 id={titleId} className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-[#46574d]">{description}</p>
      </div>

      {state === 'success' ? (
        <div className="mt-6 rounded-2xl border border-brand-900/10 bg-white p-4 text-sm leading-6 text-[#46574d]">
          <p className="font-semibold text-ink">{message}</p>
          <a className="mt-3 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800" href={CHECKLIST_URL}>
            Open the ADHD checklist
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate>
          <div className="grid gap-2">
            <label htmlFor={emailId} className="text-sm font-semibold text-ink">Email address</label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-brand-900/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor={firstNameId} className="text-sm font-semibold text-ink">First name <span className="font-normal text-muted">optional</span></label>
            <input
              id={firstNameId}
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full rounded-2xl border border-brand-900/15 bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="First name"
            />
          </div>

          {/* Honeypot field to catch spam bots */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="confirmEmail">Do not fill this field if you are a human</label>
            <input
              id="confirmEmail"
              name="confirmEmail"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
          >
            {isLoading ? 'Sending…' : ctaLabel}
          </button>

          {message ? (
            <p className={statusClassName} role="status">
              {message}
            </p>
          ) : null}

          <p className="text-xs leading-5 text-muted">
            Educational content only. No supplement checklist replaces medical care or prescribed ADHD treatment.
          </p>
        </form>
      )}
    </aside>
  )
}
