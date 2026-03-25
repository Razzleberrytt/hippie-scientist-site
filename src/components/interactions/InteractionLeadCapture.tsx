import { FormEvent, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { submitLeadCapture } from '@/lib/leadCapture'

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supportingCopy = useMemo(() => contextCopy[context], [context])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    const result = await submitLeadCapture({
      email,
      source: 'interaction-checker',
      context,
    })

    if (!result.ok) {
      setStatus('error')
      setMessage(result.message || 'Please check your email and try again.')
      return
    }

    setStatus('success')
    setMessage(
      "You're on the list. We'll let you know when deeper interaction coverage and saved tools expand."
    )
    onSuccess?.()
  }

  if (status === 'success') {
    return (
      <section className='rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4 sm:p-5'>
        <h3 className='text-sm font-semibold text-emerald-100 sm:text-base'>
          Thanks for opting in.
        </h3>
        <p className='mt-1 text-xs text-emerald-50/90 sm:text-sm'>{message}</p>
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

      <form onSubmit={submit} className='mt-3 flex flex-col gap-2 sm:flex-row'>
        <label className='sr-only' htmlFor='interaction-lead-email'>
          Email address
        </label>
        <input
          id='interaction-lead-email'
          type='email'
          inputMode='email'
          autoComplete='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder='you@example.com'
          className='w-full rounded-lg border border-white/20 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-200/45'
          aria-invalid={status === 'error'}
          required
        />
        <Button
          variant='primary'
          type='submit'
          disabled={status === 'loading'}
          className='whitespace-nowrap px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70'
        >
          {status === 'loading' ? 'Saving…' : 'Email me the updates'}
        </Button>
      </form>

      {status === 'error' && <p className='mt-2 text-xs text-rose-200'>{message}</p>}
      <p className='mt-2 text-xs text-white/55'>
        Optional. We only send practical updates when interaction safety coverage expands.
      </p>
    </section>
  )
}
