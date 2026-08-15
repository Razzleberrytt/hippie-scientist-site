'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { safetyChecklistLeadMagnet } from '@/lib/lead-magnet'
import { mailchimpSignupConfig } from '@/lib/mailchimp-integration'
import { trackEmailSignup, trackExperimentConversion } from '@/lib/analytics'
import { trackRevenueEvent } from '@/src/lib/revenue-tracking'

type TurnstileApi = {
  render: (element: HTMLElement, options: { sitekey: string; size?: 'normal' | 'flexible' | 'compact'; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => string
  reset: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type NewsletterExperiment = {
  id: string
  variant: string
  location?: string
}

type NewsletterSignupProps = {
  title?: string
  description?: string
  ctaLabel?: string
  location?: string
  variant?: 'card' | 'inline' | 'footer' | 'compact' | 'editorial'
  className?: string
  experiment?: NewsletterExperiment
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || ''
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstileScript() {
  if (typeof document === 'undefined') return
  if (document.querySelector(`script[src="${TURNSTILE_SCRIPT_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = TURNSTILE_SCRIPT_SRC
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

const variantClasses: Record<NonNullable<NewsletterSignupProps['variant']>, string> = {
  card: 'border-y border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_66%,transparent)] px-4 py-6 sm:rounded-[1.5rem] sm:border sm:p-8',
  inline: 'border-y border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_66%,transparent)] px-4 py-5 sm:rounded-[1.25rem] sm:border sm:p-5',
  footer: 'rounded-xl border border-white/10 bg-white/5 p-4',
  compact: 'rounded-2xl border border-[color:color-mix(in_srgb,var(--tone)_22%,var(--hs-hairline))] bg-[color:color-mix(in_srgb,var(--tone)_6%,var(--hs-surface))] p-4',
  editorial:
    'rounded-[1.75rem] border border-[color:var(--hs-hairline)] bg-[color:color-mix(in_srgb,var(--hs-surface)_84%,transparent)] p-5 shadow-[0_12px_32px_-26px_rgba(49,42,52,0.28)] sm:p-7',
}

export default function NewsletterSignup({
  title = safetyChecklistLeadMagnet.title,
  description = safetyChecklistLeadMagnet.description,
  ctaLabel = safetyChecklistLeadMagnet.ctaLabel,
  location = 'newsletter-signup',
  variant = 'card',
  className = '',
  experiment,
}: NewsletterSignupProps) {
  const pathname = usePathname()
  const resolvedLocation =
    location === 'global-footer' && pathname === '/' ? 'homepage-safety-checklist' : location
  const isFooter = variant === 'footer'
  const textColor = isFooter ? 'text-white' : 'text-[color:var(--hs-ink)]'
  const mutedColor = isFooter ? 'text-white/65' : 'text-[color:var(--hs-body)]'
  const inputClass = isFooter
    ? 'min-h-11 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/40 focus:ring-2 focus:ring-white/15'
    : 'min-h-11 flex-1 rounded-full border border-[color:var(--hs-hairline-strong)] bg-[color:var(--hs-surface)] px-4 text-sm text-[color:var(--hs-ink)] outline-none transition placeholder:text-[color:color-mix(in_srgb,var(--hs-body)_68%,transparent)] focus:border-[color:color-mix(in_srgb,var(--hs-gold)_60%,var(--hs-hairline))] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--hs-gold)_14%,transparent)]'
  const buttonClass = isFooter
    ? 'min-h-11 rounded-full border border-white/20 bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25'
    : 'button-primary min-h-11 px-5 py-2.5 text-sm'
  const emailId = useId()
  const honeypotId = useId()
  const statusId = useId()
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const usesClientPost = mailchimpSignupConfig.isApiAction
  const usesTurnstile = usesClientPost && Boolean(turnstileSiteKey)

  useEffect(() => {
    if (!usesTurnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) return

    let cancelled = false
    loadTurnstileScript()

    const renderWhenReady = () => {
      if (cancelled || !turnstileContainerRef.current || turnstileWidgetIdRef.current) return

      if (window.turnstile) {
        const containerWidth = turnstileContainerRef.current.getBoundingClientRect().width
        const size = containerWidth > 0 && containerWidth < 300 ? 'compact' : 'flexible'

        turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey,
          size,
          callback: setTurnstileToken,
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        })
        return
      }

      window.setTimeout(renderWhenReady, 150)
    }

    renderWhenReady()

    return () => {
      cancelled = true
    }
  }, [usesTurnstile])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    trackRevenueEvent({
      kind: 'email_signup_attempt',
      location: resolvedLocation,
      label: safetyChecklistLeadMagnet.slug,
      target: mailchimpSignupConfig.action,
    })

    if (!usesClientPost) return

    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      const response = await fetch(mailchimpSignupConfig.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: '',
          magnet: safetyChecklistLeadMagnet.slug,
          confirmEmail,
          source: resolvedLocation,
          turnstileToken: usesTurnstile ? turnstileToken : undefined,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not subscribe this email right now.')
      }

      setStatus('success')
      if (usesTurnstile) {
        window.turnstile?.reset(turnstileWidgetIdRef.current)
        setTurnstileToken('')
      }
      setMessage('You are subscribed. Open the safety checklist while the next evidence note is prepared.')
      trackEmailSignup({ source: resolvedLocation })
      if (experiment) {
        trackExperimentConversion({
          experimentId: experiment.id,
          variant: experiment.variant,
          location: experiment.location ?? resolvedLocation,
        })
      }
    } catch (error) {
      if (usesTurnstile) {
        window.turnstile?.reset(turnstileWidgetIdRef.current)
        setTurnstileToken('')
      }
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not subscribe this email right now.')
    }
  }

  const accentTextClass = isFooter ? 'text-[#e3c183]' : 'text-[color:var(--hs-gold-ink)]'
  const linkClass = isFooter
    ? 'text-[#e3c183] hover:text-white hover:underline'
    : 'text-[color:var(--tone-ink)] hover:text-[color:var(--hs-ink)] hover:underline'

  return (
    <section className={`${variantClasses[variant]} ${className}`} data-signup-location={resolvedLocation}>
      <div className='grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center'>
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${accentTextClass}`}>
            Free safety checklist
          </p>
          <h2 className={`mt-2 text-lg font-semibold leading-tight ${textColor} sm:text-2xl`}>{title}</h2>
          <p className={`mt-3 text-sm leading-7 ${mutedColor}`}>{description}</p>
          <p className={`mt-2 text-xs leading-5 ${mutedColor}`}>
            {safetyChecklistLeadMagnet.privacyNote}{' '}
            <Link href='/info/privacy/' className={linkClass}>
              Privacy policy
            </Link>
            .
          </p>
        </div>

        <form
          action={mailchimpSignupConfig.action}
          method={mailchimpSignupConfig.method}
          onSubmit={handleSubmit}
          className='flex flex-col gap-3'
        >
          <input type='hidden' name='SOURCE' value={resolvedLocation} />
          <input type='hidden' name='LEAD_MAGNET' value={safetyChecklistLeadMagnet.slug} />
          <div aria-hidden='true' className='absolute left-[-5000px]'>
            <label htmlFor={honeypotId}>Leave this field empty</label>
            <input
              id={honeypotId}
              name={mailchimpSignupConfig.honeypotName}
              tabIndex={-1}
              autoComplete='off'
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
            />
          </div>
          {usesTurnstile ? <div ref={turnstileContainerRef} className='min-h-[65px] w-full max-w-full' /> : null}
          <div className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'>
            <label className='sr-only' htmlFor={emailId}>
              Email address
            </label>
            <input
              id={emailId}
              name={mailchimpSignupConfig.emailFieldName}
              type='email'
              required
              inputMode='email'
              autoComplete='email'
              placeholder='you@example.com'
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-describedby={message ? statusId : undefined}
            />
            <button type='submit' className={buttonClass} disabled={status === 'submitting' || (usesTurnstile && !turnstileToken)}>
              {status === 'submitting' ? 'Sending...' : ctaLabel}
            </button>
          </div>
          {message ? (
            <p
              id={statusId}
              className={`text-xs leading-5 ${status === 'error' ? 'text-red-700 dark:text-red-300' : mutedColor}`}
              role={status === 'error' ? 'alert' : 'status'}
              aria-live='polite'
            >
              {message}{' '}
              {status === 'success' ? (
                <Link href='/info/supplement-safety-checklist/' className={linkClass}>
                  Open checklist
                </Link>
              ) : null}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  )
}
