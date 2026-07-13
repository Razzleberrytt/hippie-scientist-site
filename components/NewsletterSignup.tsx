'use client'

import Link from 'next/link'
import { type FormEvent, useId, useState } from 'react'
import { safetyChecklistLeadMagnet } from '@/lib/lead-magnet'
import { mailchimpSignupConfig } from '@/lib/mailchimp-integration'
import { trackEmailSignup } from '@/lib/analytics'

type NewsletterSignupProps = {
  title?: string
  description?: string
  ctaLabel?: string
  location?: string
  variant?: 'card' | 'inline' | 'footer' | 'compact'
  className?: string
}

const variantClasses: Record<NonNullable<NewsletterSignupProps['variant']>, string> = {
  card: 'border-y border-brand-900/10 bg-white/60 px-4 py-6 sm:rounded-[1.5rem] sm:border sm:p-8',
  inline: 'border-y border-brand-900/10 bg-white/60 px-4 py-5 sm:rounded-[1.25rem] sm:border sm:p-5',
  footer: 'rounded-xl border border-white/10 bg-white/5 p-4',
  compact: 'rounded-2xl border border-emerald-800/15 bg-emerald-50/80 p-4',
}

export default function NewsletterSignup({
  title = safetyChecklistLeadMagnet.title,
  description = safetyChecklistLeadMagnet.description,
  ctaLabel = safetyChecklistLeadMagnet.ctaLabel,
  location = 'newsletter-signup',
  variant = 'card',
  className = '',
}: NewsletterSignupProps) {
  const isFooter = variant === 'footer'
  const textColor = isFooter ? 'text-white' : 'text-ink'
  const mutedColor = isFooter ? 'text-white/65' : 'text-muted'
  const inputClass = isFooter
    ? 'min-h-11 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/40 focus:ring-2 focus:ring-white/15'
    : 'min-h-11 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15'
  const buttonClass = isFooter
    ? 'min-h-11 rounded-full bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25 border border-white/20'
    : 'button-primary min-h-11 px-5 py-2.5 text-sm'
  const emailId = useId()
  const honeypotId = useId()
  const statusId = useId()
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const usesClientPost = mailchimpSignupConfig.isApiAction

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          source: location,
        }),
      })
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Could not subscribe this email right now.')
      }

      setStatus('success')
      setMessage('You are subscribed. Open the safety checklist while the next evidence note is prepared.')
      trackEmailSignup({ source: location })
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Could not subscribe this email right now.')
    }
  }

  return (
    <section className={`${variantClasses[variant]} ${className}`} data-signup-location={location}>
      <div className='grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center'>
        <div>
          <p className={`text-xs font-bold uppercase tracking-[0.18em] ${isFooter ? 'text-emerald-300' : 'text-brand-700'}`}>
            Free safety checklist
          </p>
          <h2 className={`mt-2 text-lg font-semibold leading-tight ${textColor} sm:text-2xl`}>{title}</h2>
          <p className={`mt-3 text-sm leading-7 ${mutedColor}`}>{description}</p>
          <p className={`mt-2 text-xs leading-5 ${mutedColor}`}>
            {safetyChecklistLeadMagnet.privacyNote}{' '}
            <Link href='/info/privacy/' className={isFooter ? 'text-emerald-300 hover:underline' : 'text-brand-800 hover:underline'}>
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
          <input type='hidden' name='SOURCE' value={location} />
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
            <button type='submit' className={buttonClass} disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending...' : ctaLabel}
            </button>
          </div>
          {message ? (
            <p
              id={statusId}
              className={`text-xs leading-5 ${status === 'error' ? 'text-red-700' : mutedColor}`}
              role={status === 'error' ? 'alert' : 'status'}
              aria-live='polite'
            >
              {message}{' '}
              {status === 'success' ? (
                <Link href='/info/supplement-safety-checklist/' className={isFooter ? 'text-emerald-300 hover:underline' : 'text-brand-800 hover:underline'}>
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
