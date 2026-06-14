'use client'

import { useState, type FormEvent } from 'react'
import {
  emailCaptureProviderAction,
  emailCaptureProviderConfigured,
  emailCaptureProviderHoneypotName,
} from '@/content/emailCapture'
import { trackEmailSignup } from '@/lib/analytics'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function FooterEmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const disabled = !emailCaptureProviderConfigured

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (disabled) {
      e.preventDefault()
      return
    }
    
    // If not using dynamic submission, let standard form post proceed
    if (emailCaptureProviderAction.includes('list-manage.com')) {
      // Standard mailchimp form action takes care of the post
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
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
        trackEmailSignup({ source: 'footer-email-capture' })
      } else {
        setStatus('error')
        setErrorMsg('Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className='rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80'>
        <span className='font-semibold text-emerald-400'>✓</span> Check your email to confirm your subscription.
      </div>
    )
  }

  return (
    <div>
      <p className='mb-3 text-sm font-semibold text-white/90'>Research Notes</p>
      <p className='mb-3 text-xs text-white/55'>
        Evidence summaries, the safety checklist, and occasional deep dives. No spam.
      </p>
      <form
        onSubmit={handleSubmit}
        action={disabled ? undefined : emailCaptureProviderAction}
        method={disabled ? undefined : 'post'}
        className='flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row'
      >
        {emailCaptureProviderHoneypotName && !disabled ? (
          <div aria-hidden='true' className='absolute left-[-5000px]'>
            <label htmlFor='footer-email-capture-bot'>Leave this field empty</label>
            <input
              id='footer-email-capture-bot'
              name={emailCaptureProviderHoneypotName}
              tabIndex={-1}
              autoComplete='off'
            />
          </div>
        ) : null}
        <label className='sr-only' htmlFor='footer-email-capture'>Email address</label>
        <input
          id='footer-email-capture'
          type='email'
          name='email'
          required={!disabled}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='your@email.com'
          disabled={disabled || status === 'submitting'}
          className='min-h-10 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'
        />
        <button
          type='submit'
          disabled={disabled || status === 'submitting'}
          className='min-h-10 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {disabled ? 'Subscribe' : (status === 'submitting' ? 'Subscribing...' : 'Subscribe')}
        </button>
      </form>
      {status === 'error' && (
        <p className='mt-2 text-xs text-red-400'>{errorMsg}</p>
      )}
    </div>
  )
}
