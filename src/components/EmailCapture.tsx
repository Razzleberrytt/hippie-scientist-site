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
  const apiUrl = `${window.location.origin}/api/subscribe`
  const [submitDebug, setSubmitDebug] = useState<{
    apiUrl: string
    status: number
    ok: boolean
    body: unknown
    fetchError: string | null
  } | null>(null)

  useEffect(() => {
    setStoredEmailCount(getStoredEmails().length)
  }, [])

  const sendEmailToBackend = async (capturedEmail: string) => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: capturedEmail }),
      })

      const responseBody = await response.json().catch(() => null)

      setSubmitDebug({
        apiUrl,
        status: response.status,
        ok: response.ok,
        body: responseBody,
        fetchError: null,
      })

      // eslint-disable-next-line no-console
      console.log('[EmailCapture] /api/subscribe response:', {
        status: response.status,
        ok: response.ok,
        body: responseBody,
      })
    } catch (error) {
      setSubmitDebug({
        apiUrl,
        status: 0,
        ok: false,
        body: null,
        fetchError: error instanceof Error ? error.message : String(error),
      })
      // eslint-disable-next-line no-console
      console.error('[EmailCapture] /api/subscribe fetch failed:', error)
    }
  }

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

    void sendEmailToBackend(normalizedEmail)

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
            Stay in the loop
          </h2>
          <p className='text-sm text-white/75 sm:text-[0.95rem]'>
            Get a free beginner blend guide + new herbs and research drops.
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
              Get the Guide
            </button>
          </form>
          <p className='text-xs text-white/60'>CURRENT API URL: {apiUrl}</p>

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
              <p className='text-sm text-emerald-200'>
                Your guide is downloading. Want a personalized blend?
              </p>
              <a
                href='/build'
                className='inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/80 sm:w-auto'
              >
                Build Your First Blend
              </a>
            </div>
          ) : null}

          {submitDebug ? (
            <div className='mt-1 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-100'>
              <p className='font-semibold tracking-wide text-amber-200'>DEBUG · /api/subscribe</p>
              <ul className='mt-1 space-y-1'>
                <li>
                  <span className='text-amber-200/90'>apiUrl:</span> {submitDebug.apiUrl}
                </li>
                <li>
                  <span className='text-amber-200/90'>status:</span> {submitDebug.status}
                </li>
                <li>
                  <span className='text-amber-200/90'>ok:</span> {String(submitDebug.ok)}
                </li>
                <li>
                  <span className='text-amber-200/90'>fetchError:</span>{' '}
                  {submitDebug.fetchError ?? 'none'}
                </li>
                <li>
                  <span className='text-amber-200/90'>body JSON:</span>{' '}
                  <pre className='mt-1 overflow-x-auto rounded bg-black/20 p-2 text-[11px] leading-relaxed text-amber-50'>
                    {JSON.stringify(submitDebug.body, null, 2) ?? 'null'}
                  </pre>
                </li>
              </ul>
            </div>
          ) : null}

          <p className='text-xs text-white/55'>No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}
