import { FormEvent, useState } from 'react'
import clsx from 'clsx'
import Magnetic from './Magnetic'
import { Button } from '@/components/ui/Button'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'

type NewsletterSignupProps = {
  compact?: boolean
  className?: string
}

export default function NewsletterSignup({ compact = false, className }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const baseClasses = compact ? 'flex flex-col gap-2 sm:flex-row sm:items-center' : 'grid gap-3'

  const { status, message, submit, clearFeedback } = useSubmissionForm({
    successMessage: "Thanks! You're subscribed.",
    buildPayload: (fields: { email: string }) => ({
      formType: 'newsletter',
      email: fields.email,
      source: compact ? 'newsletter-signup-compact' : 'newsletter-signup',
      pagePath: typeof window === 'undefined' ? undefined : window.location.pathname,
    }),
  })

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const didSubmit = await submit({ email }, { honeypot })
    if (didSubmit) {
      setEmail('')
      setHoneypot('')
    }
  }

  const statusId = compact ? 'newsletter-signup-status-compact' : 'newsletter-signup-status'

  return (
    <form
      className={clsx(baseClasses, className)}
      aria-label='Newsletter signup form'
      onSubmit={onSubmit}
    >
      {!compact && <h3 className='text-lg font-semibold text-white'>Join our Newsletter</h3>}
      <div className='flex flex-col gap-2 sm:flex-row'>
        <label htmlFor='newsletter-signup-email' className='sr-only'>
          Email address
        </label>
        <input
          id='newsletter-signup-email'
          className='flex-1 rounded-full border border-white/25 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/40'
          placeholder='you@example.com'
          type='email'
          value={email}
          onChange={event => {
            setEmail(event.target.value)
            clearFeedback()
          }}
          aria-describedby={statusId}
          required
        />
        <input
          type='text'
          tabIndex={-1}
          autoComplete='off'
          value={honeypot}
          onChange={event => setHoneypot(event.target.value)}
          className='sr-only'
          aria-hidden='true'
        />
        <Magnetic strength={12}>
          <Button
            variant='primary'
            className='whitespace-nowrap'
            type='submit'
            disabled={status === 'pending'}
          >
            {status === 'pending' ? 'Submitting…' : 'Subscribe'}
          </Button>
        </Magnetic>
      </div>
      <p
        id={statusId}
        className={`text-xs ${status === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}
        role={status === 'error' ? 'alert' : 'status'}
        aria-live={status === 'error' ? 'assertive' : 'polite'}
      >
        {message}
      </p>
    </form>
  )
}
