import { FormEvent, useEffect, useState } from 'react'
import { exportEmailsToCSV } from '@/utils/exportEmailsToCSV'
import { trackEvent, useEmailCaptureTrigger } from '@/lib/growth'
import { CTA } from '@/lib/cta'

const EMAIL_STORAGE_KEY = 'hs_email_list'
const EMAIL_JOURNEY_KEY = 'hs_email_journey_v1'
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

export const getStoredEmails = (): string[] => {
  const storedEmails = localStorage.getItem(EMAIL_STORAGE_KEY)

  if (!storedEmails) {
    return []
  }

  try {
    const parsedEmails = JSON.parse(storedEmails)
    return Array.isArray(parsedEmails)
      ? parsedEmails.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

const getStoredJourney = (): Record<string, unknown> => {
  try {
    const parsed = JSON.parse(localStorage.getItem(EMAIL_JOURNEY_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [storedEmailCount, setStoredEmailCount] = useState(0)

  useEffect(() => {
    setStoredEmailCount(getStoredEmails().length)
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSuccess(false)

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')

    const emailList = getStoredEmails()

    if (!emailList.includes(normalizedEmail)) {
      emailList.push(normalizedEmail)
      localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emailList))
      setStoredEmailCount(emailList.length)
    }
    const journey = getStoredJourney()
    localStorage.setItem(
      EMAIL_JOURNEY_KEY,
      JSON.stringify({
        ...journey,
        [normalizedEmail]: {
          startedAt: new Date().toISOString(),
          day1: 'Beginner Blend Guide',
          cadence: 'Daily herb or compound insight',
        },
      })
    )
    trackEvent('email_submit', { context, source: 'inline_capture' })

    const guideUrl = '/blend-guide.txt'
    const guideLink = document.createElement('a')
    guideLink.href = guideUrl
    guideLink.download = 'blend-guide.txt'
    guideLink.rel = 'noopener noreferrer'
    document.body.appendChild(guideLink)
    guideLink.click()
    document.body.removeChild(guideLink)

    setSuccess(true)
    setEmail('')
  }

  const handleExportEmails = () => {
    const didExport = exportEmailsToCSV()

    if (!didExport) {
      setError('No emails available to export yet.')
      return
    }

    setError('')
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
              onChange={event => setEmail(event.target.value)}
              placeholder='you@example.com'
              aria-label='Email address'
              className='min-h-11 w-full rounded-xl border border-white/30 bg-slate-950/70 px-4 py-2.5 text-sm text-white placeholder-white/65 outline-none transition focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-300/50'
            />
            <button
              type='submit'
              className='min-h-11 rounded-xl border border-emerald-200/35 bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80'
            >
              {buttonLabel || CTA.conversion.getGuide}
            </button>
          </form>

          <div className='text-white/78 grid gap-2 text-xs sm:grid-cols-3 sm:text-sm'>
            <p>• Day 1: Beginner Blend Guide</p>
            <p>• Day 2+: One herb insight per day</p>
            <p>• Always links back to full breakdowns</p>
          </div>
          {storedEmailCount > 0 ? (
            <div className='pt-1'>
              <button
                type='button'
                onClick={handleExportEmails}
                className='min-h-10 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
              >
                Export Emails
              </button>
            </div>
          ) : null}

          {error ? <p className='text-xs text-rose-300'>{error}</p> : null}
          {success ? (
            <div className='shadow-halo mt-1 flex flex-col gap-3 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3.5 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-emerald-200'>You’re in. Your guide is downloading now.</p>
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
