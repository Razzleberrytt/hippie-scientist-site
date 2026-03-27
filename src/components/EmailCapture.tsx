import { FormEvent, useState } from 'react'
import { trackEvent, useEmailCaptureTrigger } from '@/lib/growth'
import { CTA } from '@/lib/cta'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'

type CaptureContext = 'global' | 'herb' | 'compound' | 'blog' | 'starter-pack'

type EmailCaptureProps = {
  context?: CaptureContext
  forceShow?: boolean
  title?: string
  subtitle?: string
  buttonLabel?: string
  postSubmitCtaPath?: string
  postSubmitCtaLabel?: string
}

export default function EmailCapture({
  context = 'global',
  forceShow = false,
  title,
  subtitle,
  buttonLabel,
  postSubmitCtaPath = '/build',
  postSubmitCtaLabel = 'Save blend',
}: EmailCaptureProps) {
  const shouldShow = useEmailCaptureTrigger()
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const { status, message, submit, clearFeedback } = useSubmissionForm({
    successMessage: 'You’re in. Your guide is ready below.',
    buildPayload: (fields: { email: string }) => ({
      formType: 'lead-capture',
      email: fields.email,
      source: 'inline-capture',
      context,
      pagePath: typeof window === 'undefined' ? undefined : window.location.pathname,
    }),
    onSuccess: () => {
      trackEvent('email_submit', { context, source: 'inline_capture' })
      const guideUrl = '/blend-guide.txt'
      const guideLink = document.createElement('a')
      guideLink.href = guideUrl
      guideLink.download = 'blend-guide.txt'
      guideLink.rel = 'noopener noreferrer'
      document.body.appendChild(guideLink)
      guideLink.click()
      document.body.removeChild(guideLink)
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const didSubmit = await submit({ email }, { honeypot })
    if (didSubmit) {
      setEmail('')
      setHoneypot('')
    }
  }

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail)
    clearFeedback()
  }

  if (!forceShow && !shouldShow) return null

  return (
    <section
      aria-label='Email capture'
      className='container mx-auto max-w-4xl px-4 pb-12 sm:px-6 sm:pb-16'
    >
      <div className='shadow-halo border-white/12 relative overflow-hidden rounded-3xl border bg-white/[0.05] p-5 backdrop-blur-2xl sm:p-7'>
        <div
          aria-hidden
          className='pointer-events-none absolute -top-20 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent'
        />

        <div className='relative space-y-5'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.24em] text-white/75'>
              Research notes
            </p>
            <h2 className='text-[1.4rem] font-semibold tracking-tight text-white sm:text-3xl'>
              {title || 'Get a beginner-safe herbal blend guide (free)'}
            </h2>
            <p className='text-white/88 max-w-2xl text-sm leading-relaxed sm:text-[0.97rem]'>
              {subtitle ||
                'Designed to help you learn safely. Built for clarity, not hype. We share practical updates and starter resources only.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className='grid gap-2.5 sm:grid-cols-[1fr_auto]'>
            <label htmlFor='email-capture-input' className='sr-only'>
              Email address
            </label>
            <input
              id='email-capture-input'
              type='email'
              inputMode='email'
              autoComplete='email'
              value={email}
              onChange={event => handleEmailChange(event.target.value)}
              placeholder='you@example.com'
              aria-label='Email address'
              aria-describedby='email-capture-status'
              className='min-h-11 w-full rounded-xl border border-white/30 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder-white/65 outline-none transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-300/50'
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
            <button
              type='submit'
              disabled={status === 'pending'}
              className='min-h-11 rounded-xl border border-emerald-200/35 bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 disabled:cursor-not-allowed disabled:opacity-70'
            >
              {status === 'pending' ? 'Submitting…' : buttonLabel || CTA.conversion.getGuide}
            </button>
          </form>

          <div className='text-white/78 grid gap-2 text-xs sm:grid-cols-3 sm:text-sm'>
            <p>• Day 1: Beginner Blend Guide</p>
            <p>• Day 2+: One herb insight per day</p>
            <p>• Always links back to full breakdowns</p>
          </div>

          <p
            id='email-capture-status'
            className={`text-xs ${status === 'error' ? 'text-rose-300' : 'text-emerald-200'}`}
            role={status === 'error' ? 'alert' : 'status'}
            aria-live={status === 'error' ? 'assertive' : 'polite'}
          >
            {message}
          </p>

          {status === 'success' ? (
            <div className='shadow-halo mt-1 flex flex-col gap-3 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3.5 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-emerald-200'>Your guide is downloading now.</p>
              <a
                href={postSubmitCtaPath}
                className='inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 sm:w-auto'
              >
                {postSubmitCtaLabel || CTA.conversion.saveBlend}
              </a>
            </div>
          ) : null}

          <p className='text-xs text-white/55'>
            No spam. Unsubscribe anytime. Practical content only.
          </p>
        </div>
      </div>
    </section>
  )
}
