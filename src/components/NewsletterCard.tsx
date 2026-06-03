import { FormEvent, useState } from 'react'
import Magnetic from './Magnetic'
import { Button } from '@/components/ui/Button'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'

export default function NewsletterCard() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const { status, message, submit, clearFeedback } = useSubmissionForm({
    successMessage: "Thanks! You're subscribed.",
    buildPayload: (fields: { email: string }) => ({
      formType: 'newsletter',
      email: fields.email,
      source: 'newsletter-card',
      pagePath: typeof window === 'undefined' ? undefined : window.location.pathname,
    }),
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const didSubmit = await submit({ email }, { honeypot })
    if (didSubmit) {
      setEmail('')
      setHoneypot('')
    }
  }

  return (
    <section className='animated-border mt-10'>
      <div className='glass rounded-[27px] p-6 md:p-8'>
        <h2 className='text-2xl font-semibold tracking-tight md:text-3xl'>Stay in the loop</h2>
        <p className='mt-2 text-sm text-white/80 md:text-base'>
          Get field notes on new psychoactive herbs, blends, and research drops.
        </p>
        <form
          className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center'
          aria-label='Newsletter signup form'
          onSubmit={handleSubmit}
        >
          <label htmlFor='newsletter-card-email' className='sr-only'>
            Email address
          </label>
          <input
            id='newsletter-card-email'
            type='email'
            value={email}
            onChange={event => {
              setEmail(event.target.value)
              clearFeedback()
            }}
            placeholder='you@example.com'
            aria-describedby='newsletter-card-status'
            className='bg-white/14 w-full rounded-2xl px-4 py-3 text-base text-white/90 placeholder-white/60 ring-1 ring-white/20 backdrop-blur-xl focus:ring-white/40 sm:flex-1'
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
              type='submit'
              variant='primary'
              className='rounded-2xl px-6 py-3'
              disabled={status === 'pending'}
            >
              {status === 'pending' ? 'Submitting…' : 'Join the newsletter'}
            </Button>
          </Magnetic>
        </form>
        <p
          id='newsletter-card-status'
          className={`mt-2 text-xs ${status === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live={status === 'error' ? 'assertive' : 'polite'}
        >
          {message}
        </p>
      </div>
    </section>
  )
}
