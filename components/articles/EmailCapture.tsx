'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { trackEmailSignup } from '@/lib/analytics'
import { CONSENT_CHANGE_EVENT, getConsent } from '@/lib/consent'
import { trackLeadMagnetFunnelEvent } from '@/lib/lead-magnet-analytics'
import TurnstileWidget, { turnstileEnabled } from '@/components/security/TurnstileWidget'

type EmailCaptureProps = {
  title: string
  description: string
  ctaLabel: string
  magnet: string
  resourceUrl?: string
  resourceLabel?: string
  eyebrow?: string
  placement?: string
  disclaimer?: string
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

const DEFAULT_RESOURCE_URL = '/lead-magnets/adhd-supplement-starter-checklist/'

export default function EmailCapture({
  title,
  description,
  ctaLabel,
  magnet,
  resourceUrl = DEFAULT_RESOURCE_URL,
  resourceLabel = 'Open your resource',
  eyebrow = 'Free research resource',
  placement = 'article-inline',
  disclaimer = 'Educational content only. This resource does not replace individualized medical or medication guidance.',
}: EmailCaptureProps) {
  const titleId = useId()
  const emailId = useId()
  const firstNameId = useId()
  const impressionTracked = useRef(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const trackImpression = () => {
      if (impressionTracked.current || getConsent() !== 'granted') return
      impressionTracked.current = true
      trackLeadMagnetFunnelEvent('lead_magnet_impression', {
        slug: magnet,
        sourcePath: window.location.pathname,
        placement,
      })
    }

    trackImpression()
    window.addEventListener(CONSENT_CHANGE_EVENT, trackImpression)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, trackImpression)
  }, [magnet, placement])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (turnstileEnabled && !turnstileToken) {
      setState('error')
      setMessage('Complete the security check before subscribing.')
      return
    }

    setState('loading')
    setMessage('')
    trackLeadMagnetFunnelEvent('lead_magnet_signup_attempt', {
      slug: magnet,
      sourcePath: window.location.pathname,
      placement,
    })

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          magnet,
          confirmEmail,
          turnstileToken: turnstileEnabled ? turnstileToken : undefined,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not subscribe this email right now.')
      }

      setState('success')
      setMessage('You are subscribed. Your resource is ready below.')
      setTurnstileResetKey((value) => value + 1)
      trackEmailSignup({ source: `lead-magnet-${magnet}` })
      trackLeadMagnetFunnelEvent('lead_magnet_signup_success', {
        slug: magnet,
        sourcePath: window.location.pathname,
        placement,
      })
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Could not subscribe this email right now.')
      setTurnstileResetKey((value) => value + 1)
    }
  }

  const isLoading = state === 'loading'
  const statusClassName = state === 'error' ? 'text-sm leading-6 text-red-700' : 'text-sm leading-6 text-muted'

  return (
    <aside className="my-10 rounded-3xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm sm:p-7" aria-labelledby={titleId} data-lead-magnet={magnet}>
      <div className="space-y-3">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 id={titleId} className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted">{description}</p>
        <p className="text-sm leading-6 text-muted">
          Want to review it first?{' '}
          <Link className="font-semibold text-brand-800 underline decoration-brand-700/35 underline-offset-4 hover:text-brand-900" href={resourceUrl}>
            Preview the resource
          </Link>
          .
        </p>
      </div>

      {state === 'success' ? (
        <div className="mt-6 rounded-2xl border border-brand-900/10 bg-[var(--surface-card-strong)] p-4 text-sm leading-6 text-muted">
          <p className="font-semibold text-ink">{message}</p>
          <a className="mt-3 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800" href={resourceUrl}>
            {resourceLabel}
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
              className="w-full rounded-2xl border border-brand-900/15 bg-[var(--surface-card-strong)] px-4 py-3 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
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
              className="w-full rounded-2xl border border-brand-900/15 bg-[var(--surface-card-strong)] px-4 py-3 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="First name"
            />
          </div>

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

          <TurnstileWidget onTokenChange={setTurnstileToken} resetKey={turnstileResetKey} />

          <button
            type="submit"
            disabled={isLoading || (turnstileEnabled && !turnstileToken)}
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
          >
            {isLoading ? 'Sending…' : ctaLabel}
          </button>

          {message ? <p className={statusClassName} role="status">{message}</p> : null}
          <p className="text-xs leading-5 text-muted">{disclaimer}</p>
        </form>
      )}
    </aside>
  )
}
