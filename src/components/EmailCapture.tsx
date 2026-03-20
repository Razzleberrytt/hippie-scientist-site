import { FormEvent, useEffect, useState } from 'react'
import { exportEmailsToCSV } from '@/utils/exportEmailsToCSV'

const EMAIL_STORAGE_KEY = 'hs_email_list'

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

export default function EmailCapture() {
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

  return (
    <section
      aria-label='Email capture'
      className='container mx-auto max-w-3xl px-4 pb-10 sm:px-6 sm:pb-12'
    >
      <div className='shadow-halo relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:rounded-[24px] sm:p-5'>
        <div
          aria-hidden
          className='pointer-events-none absolute -top-16 left-0 right-0 h-28 bg-gradient-to-b from-white/10 to-transparent'
        />

        <div className='relative space-y-3'>
          <h2 className='text-xl font-semibold tracking-tight text-white sm:text-2xl'>
            Build your first calming herbal blend in minutes
          </h2>
          <p className='text-sm text-white/75 sm:text-[0.95rem]'>
            Get a clear, beginner-safe roadmap so you can craft a blend that actually works—without
            overwhelm.
          </p>

          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-2.5 sm:flex-row sm:items-center'
          >
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
              className='border-white/12 w-full rounded-xl border bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-emerald-300/35 sm:flex-1'
            />
            <button
              type='submit'
              className='rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80'
            >
              Start My First Blend
            </button>
          </form>

          <ul className='space-y-1 text-xs text-white/80 sm:text-sm'>
            <li>• Beginner-friendly blend recipes</li>
            <li>• Research-backed herb insights</li>
            <li>• No fluff, just what works</li>
          </ul>
          {storedEmailCount > 0 ? (
            <div className='pt-1'>
              <button
                type='button'
                onClick={handleExportEmails}
                className='rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
              >
                Export Emails
              </button>
            </div>
          ) : null}

          {error ? <p className='text-xs text-rose-300'>{error}</p> : null}
          {success ? (
            <div className='shadow-halo mt-1 flex flex-col gap-3 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-emerald-200'>You’re in. Your guide is downloading now.</p>
              <a
                href='/build'
                className='inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 sm:w-auto'
              >
                Build Your First Blend
              </a>
            </div>
          ) : null}

          <p className='text-xs text-white/55'>No spam. Just useful drops.</p>
        </div>
      </div>
    </section>
  )
}
