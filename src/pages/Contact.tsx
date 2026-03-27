import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import Meta from '../components/Meta'
import { FORM_ERROR_COPY } from '@/lib/formSubmission'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const { status, message, submit, clearFeedback } = useSubmissionForm({
    successMessage: 'Thanks — your message was sent. We usually reply within 2–3 business days.',
    buildPayload: (fields: {
      name: string
      email: string
      subject: string
      messageBody: string
    }) => ({
      formType: 'contact',
      name: fields.name.trim(),
      email: fields.email,
      subject: fields.subject.trim(),
      message: fields.messageBody.trim(),
      source: 'contact-page',
      pagePath: '/contact',
    }),
    validate: fields => {
      if (!fields.name.trim() || !fields.subject.trim() || !fields.messageBody.trim()) {
        return FORM_ERROR_COPY.requiredFields
      }
      return null
    },
    onSuccess: () => {
      ;(window as any).gtag?.('event', 'contact_submit_success')
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const didSubmit = await submit(
      {
        name,
        email,
        subject,
        messageBody,
      },
      { honeypot }
    )

    if (didSubmit) {
      setName('')
      setEmail('')
      setSubject('')
      setMessageBody('')
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
        title='Contact — The Hippie Scientist'
        description='Questions, corrections, partnerships—drop us a line.'
        path='/contact'
        pageType='website'
      />
      <main className='container mx-auto max-w-2xl space-y-6 px-4 py-10'>
        <header className='rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm'>
          <h1 className='bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent'>
            Contact
          </h1>
          <p className='mt-2 text-white/75'>
            We read every message. Safety notes and factual corrections are appreciated.
          </p>
        </header>

        <form
          className='space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm'
          onSubmit={handleSubmit}
          noValidate
        >
          <p className='sr-only' aria-hidden='true'>
            <label htmlFor='contact-bot-field'>Leave this field empty</label>
          </p>
          <input
            id='contact-bot-field'
            type='text'
            tabIndex={-1}
            autoComplete='off'
            value={honeypot}
            onChange={event => setHoneypot(event.target.value)}
            className='sr-only'
            aria-hidden='true'
          />

          <label className='block'>
            <span className='text-sm text-white/80'>Name</span>
            <input
              required
              type='text'
              name='name'
              autoComplete='name'
              value={name}
              onChange={event => handleFieldChange(setName, event.target.value)}
              placeholder='Will'
              className='mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50'
            />
          </label>

          <label className='block'>
            <span className='text-sm text-white/80'>Email</span>
            <input
              required
              type='email'
              name='email'
              autoComplete='email'
              value={email}
              onChange={event => handleFieldChange(setEmail, event.target.value)}
              placeholder='you@example.com'
              aria-describedby='contact-form-status'
              className='mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50'
            />
          </label>

          <label className='block'>
            <span className='text-sm text-white/80'>Subject</span>
            <input
              required
              type='text'
              name='subject'
              value={subject}
              onChange={event => handleFieldChange(setSubject, event.target.value)}
              placeholder='Partnership inquiry'
              className='mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50'
            />
          </label>

          <label className='block'>
            <span className='text-sm text-white/80'>Message</span>
            <textarea
              required
              name='message'
              rows={6}
              value={messageBody}
              onChange={event => handleFieldChange(setMessageBody, event.target.value)}
              placeholder='How can we help?'
              className='mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 placeholder-white/50'
            />
          </label>

          <div className='flex items-center gap-2'>
            <button
              disabled={status === 'pending'}
              className='rounded-lg border border-lime-300/20 bg-gradient-to-r from-lime-400/30 to-cyan-400/20 px-4 py-2 text-sm font-medium text-lime-200 hover:from-lime-400/40 hover:to-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {status === 'pending' ? 'Sending…' : 'Send message'}
            </button>
            <a
              className='text-white/70 underline hover:text-cyan-300'
              href='mailto:hello@thehippiescientist.net'
            >
              or email us directly
            </a>
          </div>

          <p
            id='contact-form-status'
            className={`text-xs ${status === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}
            role={status === 'error' ? 'alert' : 'status'}
            aria-live={status === 'error' ? 'assertive' : 'polite'}
          >
            {message}
          </p>

          <p className='text-xs text-white/60'>
            This form is protected by a spam honeypot. By submitting, you agree to our{' '}
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
      </main>
    </>
  )
}
