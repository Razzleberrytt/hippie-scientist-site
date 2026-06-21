'use client'

import { useState, type FormEvent } from 'react'
import {
  emailCaptureProviderAction,
  emailCaptureProviderConfigured,
  emailCaptureProviderHoneypotName,
  type EmailCaptureGoal,
  getLeadMagnet,
} from '@/content/emailCapture'
import { trackEmailSignup } from '@/lib/analytics'

type EmailCaptureBoxProps = {
  variant?: 'inline' | 'card' | 'wide'
  goal?: EmailCaptureGoal
  title?: string
  description?: string
  className?: string
}

const variantClasses: Record<NonNullable<EmailCaptureBoxProps['variant']>, string> = {
  inline: 'rounded-[1.25rem] border border-brand-900/10 bg-white/85 p-5',
  card: 'rounded-[1.5rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm',
  wide: 'rounded-[1.5rem] border border-brand-900/10 bg-brand-50/70 p-6 shadow-sm sm:p-8',
}

export function EmailCaptureBox({
  variant = 'card',
  goal = 'default',
  title,
  description,
  className = '',
}: EmailCaptureBoxProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const leadMagnet = getLeadMagnet(goal)
  const disabled = !emailCaptureProviderConfigured

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (disabled) {
      e.preventDefault()
      return
    }

    // Honey-pot check
    const formData = new FormData(e.currentTarget)
    if (emailCaptureProviderHoneypotName && String(formData.get(emailCaptureProviderHoneypotName) || '').trim()) {
      e.preventDefault()
      return
    }

    // Let external form providers handle their own submission flow.
    if (!emailCaptureProviderAction.startsWith('/api/')) {
      return
    }

    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(emailCaptureProviderAction, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, magnet: leadMagnet.goal, source: `email-capture-${goal}` }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
        trackEmailSignup({ source: `email-capture-${goal}` })
      } else {
        const detail = await res.json().catch(() => ({})) as Record<string, unknown>
        setStatus('error')
        setErrorMsg(String(detail.error ?? 'Something went wrong. Try again.'))
      }
    } catch {
      setStatus('error')
      setErrorMsg('Could not connect to email service. Try again.')
    }
  }

  if (status === 'success') {
    return (
      <section className={`${variantClasses[variant]} ${className}`}>
        <div className='flex flex-col items-center justify-center py-6 text-center text-ink'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-150 mb-3 text-xl font-bold'>
            ✓
          </div>
          <h2 className='text-lg font-semibold'>You are subscribed!</h2>
          <p className='mt-2 text-sm text-muted max-w-sm'>
            Check your inbox shortly to confirm your subscription and access your free guide.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`${variantClasses[variant]} ${className}`}>
      <div className='grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Free guide</p>
          <h2 className='mt-2 text-2xl font-semibold text-ink'>{title || leadMagnet.title}</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>{description || leadMagnet.description}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          action={disabled ? undefined : emailCaptureProviderAction}
          method={disabled ? undefined : 'post'}
          className='flex flex-col gap-3'
        >
          {emailCaptureProviderHoneypotName ? (
            <div aria-hidden='true' className='absolute left-[-5000px]'>
              <label htmlFor={`email-capture-bot-${leadMagnet.goal}`}>Leave this field empty</label>
              <input
                id={`email-capture-bot-${leadMagnet.goal}`}
                name={emailCaptureProviderHoneypotName}
                tabIndex={-1}
                autoComplete='off'
              />
            </div>
          ) : null}
          <div className='flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row'>
            <label className='sr-only' htmlFor={`email-capture-${leadMagnet.goal}`}>
              Email address
            </label>
            <input
              id={`email-capture-${leadMagnet.goal}`}
              name='email'
              type='email'
              required={!disabled}
              disabled={disabled || status === 'submitting'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='you@example.com'
              className='min-h-11 flex-1 rounded-full border border-brand-900/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-muted'
            />
            <button
              type='submit'
              disabled={disabled || status === 'submitting'}
              className='min-h-11 rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:bg-stone-400 whitespace-nowrap'
            >
              {disabled ? 'Get the free checklist' : (status === 'submitting' ? 'Subscribing...' : leadMagnet.ctaLabel)}
            </button>
          </div>
          {status === 'error' && (
            <p className='text-xs text-red-600 mt-1 font-semibold'>{errorMsg}</p>
          )}
        </form>
      </div>
    </section>
  )
}
