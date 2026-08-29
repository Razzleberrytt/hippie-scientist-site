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
  const statusClassName = state === 'error' ? 'text-sm leading-6 text-red-700 dark:text-red-300' : 'text-sm leading-6 text-muted'

  return (
    <aside className="my-6 border-t border-[color:var(--hs-hairline-strong)] pt-4 sm:rounded-[var(--hs-radius)] sm:border sm:bg-[color:var(--surface-card)] sm:p-5" aria-labelledby={titleId} data-lead-magnet={magnet}>
      <div className="space-y-1.5">
        <p className="hs-label">{eyebrow}</p>
        <h2 id={titleId} className="font-display text-[1.15rem] font-semibold leading-snug tracking-tight text-ink sm:text-xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>

      {state === 'success' ? (
        <div className="mt-3 text-sm leading-6 text-muted">
          <p className="font-semibold text-ink">{message}</p>
          <a className="button-primary mt-3 inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold" href={resourceUrl}>
            {resourceLabel}
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 grid gap-3" noValidate>
          {/* Email is the only field delivery needs. First name is kept as an
              optional hidden field so the module stays a compact CTA instead of
              a two-field form competing with the research content. */}
          <div className="grid gap-1.5 sm:max-w-md">
            <label htmlFor={emailId} className="text-xs font-semibold text-ink">Email address</label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 w-full rounded-full border border-[color:var(--hs-hairline-strong)] bg-[var(--surface-card-strong)] px-4 py-2.5 text-base text-ink outline-none transition focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20"
              placeholder="you@example.com"
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
            <label htmlFor={firstNameId}>First name</label>
            <input
              id={firstNameId}
              name="firstName"
              type="text"
              tabIndex={-1}
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>

          <TurnstileWidget onTokenChange={setTurnstileToken} resetKey={turnstileResetKey} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="submit"
              disabled={isLoading || (turnstileEnabled && !turnstileToken)}
              className="button-primary inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
            >
              {isLoading ? 'Sending…' : ctaLabel}
            </button>
            <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--tone-ink)] underline-offset-4 hover:underline" href={resourceUrl}>
              Preview it first &rarr;
            </Link>
          </div>

          {message ? <p className={statusClassName} role="status">{message}</p> : null}
          <p className="text-xs leading-5 text-muted">{disclaimer}</p>
        </form>
      )}
    </aside>
  )
}
