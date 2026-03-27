import { FormEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useSubmissionForm } from '@/hooks/useSubmissionForm'

type LeadCaptureContext = 'after-report' | 'after-save' | 'after-share' | 'after-export'

type InteractionLeadCaptureProps = {
  context: LeadCaptureContext
  emphasized?: boolean
  onSuccess?: () => void
}

const contextCopy: Record<LeadCaptureContext, string> = {
  'after-report': 'Get safer combinations and updates as interaction coverage expands.',
  'after-save': 'Get safer combinations and updates as your saved report library grows.',
  'after-share': 'Get safer combinations and updates for shared stacks and reports.',
  'after-export': 'Get safer combinations and updates when new export and safety tools land.',
}

export default function InteractionLeadCapture({
  context,
  emphasized = false,
  onSuccess,
}: InteractionLeadCaptureProps) {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const supportingCopy = useMemo(() => contextCopy[context], [context])

  const { status, message, submit, clearFeedback } = useSubmissionForm({
    successMessage:
      "You're on the list. We'll let you know when deeper interaction coverage and saved tools expand.",
    buildPayload: (fields: { email: string }) => ({
      formType: 'lead-capture',
      email: fields.email,
      source: 'interaction-checker',
      context,
      pagePath: typeof window === 'undefined' ? undefined : window.location.pathname,
    }),
    onSuccess,
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

  if (status === 'success') {
    return (
      <section className='rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4 sm:p-5'>
        <h3 className='text-sm font-semibold text-emerald-100 sm:text-base'>
          Thanks for opting in.
        </h3>
        <p className='mt-1 text-xs text-emerald-50/90 sm:text-sm' role='status' aria-live='polite'>
          {message}
        </p>
        <p className='mt-2 text-xs text-emerald-50/70'>
          Next up: blend safety support, broader interaction coverage, and a cleaner saved-report
          library.
        </p>
      </section>
    )
  }

  return (
    <section
      className={`rounded-2xl border bg-black/30 p-4 sm:p-5 ${
        emphasized
          ? 'border-cyan-300/35 shadow-[0_0_32px_rgba(34,211,238,0.16)]'
          : 'border-white/10'
      }`}
    >
      <h3 className='text-sm font-semibold text-white sm:text-base'>
        Download your stack as a PDF + get safer combinations and updates
      </h3>
      <p className='mt-1 text-xs text-white/75 sm:text-sm'>{supportingCopy}</p>

      <form onSubmit={handleSubmit} className='mt-3 flex flex-col gap-2 sm:flex-row'>
        <label className='sr-only' htmlFor='interaction-lead-email'>
          Email address
        </label>
        <input
          id='interaction-lead-email'
          type='email'
          inputMode='email'
          autoComplete='email'
          value={email}
          onChange={event => handleEmailChange(event.target.value)}
          placeholder='you@example.com'
          className='w-full rounded-lg border border-white/20 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-200/45'
          aria-invalid={status === 'error'}
          aria-describedby='interaction-lead-status'
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
        <Button
          variant='primary'
          type='submit'
          disabled={status === 'pending'}
          className='whitespace-nowrap px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70'
        >
          {status === 'pending' ? 'Saving…' : 'Email me the updates'}
        </Button>
      </form>

      <p
        id='interaction-lead-status'
        className={`mt-2 text-xs ${status === 'error' ? 'text-rose-200' : 'text-emerald-200'}`}
        role={status === 'error' ? 'alert' : 'status'}
        aria-live={status === 'error' ? 'assertive' : 'polite'}
      >
        {message}
      </p>
      <p className='mt-2 text-xs text-white/55'>
        Optional. We only send practical updates when interaction safety coverage expands.
      </p>
    </section>
  )
}
