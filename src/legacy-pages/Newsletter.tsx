import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const { status, message, submit, clearFeedback } = useSubmissionForm({
    successMessage: "You're on the list ✦ Check your inbox for confirmation.",
    buildPayload: (fields: { email: string; firstName: string }) => ({
      formType: 'newsletter',
      email: fields.email,
      firstName: fields.firstName.trim() || undefined,
      source: 'newsletter-page',
      pagePath: '/newsletter',
    }),
    onSuccess: () => {
      ;(window as any).gtag?.('event', 'newsletter_signup_success')
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const didSubmit = await submit({ email, firstName }, { honeypot })
    if (didSubmit) {
      setEmail('')
      setFirstName('')
      setHoneypot('')
    }
  }

  const handleFieldChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    clearFeedback()
  }

  return (
    <>
      <Meta
        title='Newsletter — The Hippie Scientist'
        description='Get new herb profiles, safety notes, and blend ideas in your inbox.'
        path='/newsletter'
        pageType='website'
      />
      <main className='container mx-auto max-w-2xl space-y-6 px-4 py-10'>
        <header className='glass-soft rounded-2xl p-6'>
          <h1 className='bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent'>
            Join the newsletter
          </h1>
          <p className='mt-2 text-white/90'>
            Occasional updates: new herb pages, safety advisories, and research roundups. No spam.
          </p>
        </header>

        {status !== 'success' ? (
          <form className='glass-soft space-y-4 rounded-2xl p-6' onSubmit={handleSubmit} noValidate>
            <p className='sr-only' aria-hidden='true'>
              <label htmlFor='newsletter-bot-field'>Leave this field empty</label>
            </p>
            <input
              id='newsletter-bot-field'
              type='text'
              tabIndex={-1}
              autoComplete='off'
              value={honeypot}
              onChange={event => setHoneypot(event.target.value)}
              className='sr-only'
              aria-hidden='true'
            />

            <label className='block'>
              <span className='text-sm text-white/80'>Email address</span>
              <input
                required
                type='email'
                name='email'
                autoComplete='email'
                value={email}
                onChange={event => handleFieldChange(setEmail, event.target.value)}
                placeholder='you@example.com'
                aria-label='Email address'
                aria-describedby='newsletter-form-status'
                className='mt-1 w-full rounded-lg border border-white/30 bg-slate-900/70 px-3 py-2 text-white placeholder-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
              />
            </label>

            <label className='block'>
              <span className='text-sm text-white/80'>First name (optional)</span>
              <input
                type='text'
                name='firstName'
                autoComplete='given-name'
                value={firstName}
                onChange={event => handleFieldChange(setFirstName, event.target.value)}
                placeholder='Will'
                aria-label='First name'
                className='mt-1 w-full rounded-lg border border-white/30 bg-slate-900/70 px-3 py-2 text-white placeholder-white/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-cyan-300/60'
              />
            </label>

            <button
              disabled={status === 'pending'}
              className='rounded-lg border border-lime-300/45 bg-gradient-to-r from-lime-300/85 to-cyan-300/80 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:from-lime-200 hover:to-cyan-200 focus:outline-none focus:ring-2 focus:ring-lime-200/80 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {status === 'pending' ? 'Submitting…' : 'Subscribe'}
            </button>

            <p
              id='newsletter-form-status'
              className={`text-xs ${status === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}
              role={status === 'error' ? 'alert' : 'status'}
              aria-live={status === 'error' ? 'assertive' : 'polite'}
            >
              {message}
            </p>

            <p className='pt-2 text-xs text-white/60'>
              By subscribing, you agree to our{' '}
              <Link className='underline' to='/privacy'>
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link className='underline' to='/disclaimer'>
                Disclaimer
              </Link>
              .
            </p>
          </form>
        ) : (
          <div className='glass-soft rounded-2xl p-6'>
            <h2 className='font-semibold text-lime-300'>You're on the list ✦</h2>
            <p className='mt-1 text-white/75' role='status' aria-live='polite'>
              {message}
            </p>
            <nav className='mt-4 text-sm'>
              <Link className='mr-3 underline' to='/herbs'>
                Browse database
              </Link>
              <Link className='underline' to='/blog'>
                Read the blog
              </Link>
            </nav>
          </div>
        )}
      </main>
    </>
  )
}
