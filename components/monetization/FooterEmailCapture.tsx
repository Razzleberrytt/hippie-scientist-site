'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function FooterEmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (data.success) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong. Try again.')
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
      <p className='mb-3 text-xs text-white/55'>Evidence summaries and occasional deep dives. No spam.</p>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row'>
        <label className='sr-only' htmlFor='footer-email-capture'>Email address</label>
        <input
          id='footer-email-capture'
          type='email'
          name='email'
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='your@email.com'
          disabled={status === 'submitting'}
          className='min-h-10 flex-1 rounded-full border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50'
        />
        <button
          type='submit'
          disabled={status === 'submitting'}
          className='min-h-10 rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className='mt-2 text-xs text-red-400'>{errorMsg}</p>
      )}
    </div>
  )
}
